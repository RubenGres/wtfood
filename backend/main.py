from dotenv import load_dotenv
load_dotenv()

import os
import random
import json
import argparse
import requests
from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
from io import BytesIO
import base64
from PIL import Image

import src.positioning as positioning
import src.database as database
import src.sd_generation as sd_generation
import src.clipclassifier as clipclassifier
import src.sorting as sorting
import src.llmcaller as llmcaller


# Set up argparse
parser = argparse.ArgumentParser(description='Start WTFood backend')
parser.add_argument('--mock', action='store_true', help='Use mock generation for testing')

def load_b64(image_b64):
    image = Image.open(BytesIO(base64.b64decode(image_b64.split(',', 1)[-1]))).convert("RGB")
    return image


def locate_ip(ip):
    url = f'http://ip-api.com/json/{ip}'
    response = requests.get(url).json()

    if response['status'] == "fail":
        return f"unknown"
    
    return f"{response['city']}, {response['country']}"


def get_or_create_sorting(label, cards):
    sort_order = database.get_sorting(label)

    # if the sorting doesn't exist, create it
    if not sort_order:

        # sort using mock or clip sorting depending on the passed argument
        if not args.mock:
            sort_order = sorting.sort_cards(cards, label, clip_model, clip_tokenizer)
        else:
            sort_order = sorting.mock_sort_cards(cards, label)

        database.add_sorting(label, sort_order)
    
    return sort_order


def classify(image):
    return clipclassifier.classify(image, clip_model, clip_processor, labels_embeddings)


app = Flask(__name__)

CORS(app)

@app.route('/')
def home():
    return """
    <h1> WTFood API running </h1>

    Routes:
    <ul>
        <li> /position/pick </li>
        <li> /position/free </li>
        <li> /cards </li>
        <li> /media/<id> </li>
        <li> /transform </li>
        <li> /sort </li>
        <li> /info </li>
        <li> /dump.json </li>
    </ul>
    """


@app.route('/transform', methods=['POST'])
def transform():
    data = request.json

    input_images = data['input_images']
    workflow = data['workflow']
    params = data['params']
    client_id = data['client_id']
    coord = data['coords']

    caller_ip = request.remote_addr
    b64_image = list(input_images.values())[0]

    image = load_b64(b64_image)

    prompts = llmconfig['prompts']
    stakeholder = random.choice(llmconfig['stakeholders'])
    issue = random.choice(llmconfig['issues'])

    if not args.mock:
        food = classify(image)

        if food is None:
            return jsonify({'error': 'No fruit or vegetable found in image'}), 404
        
        location = locate_ip(caller_ip)
    
        llm_response = llmcaller.generate_text(prompts, stakeholder, issue, food, location)
        response_data = sd_generation.create_video(input_images, workflow, params, client_id, coord, llm_response, location, food, stakeholder, issue)
    else:
        food = random.choice(labels)
        location = locate_ip(caller_ip)
        print(caller_ip, location)
        llm_response = llmcaller.generate_text(prompts, stakeholder, issue, food, location)
        response_data = sd_generation.create_mock(input_images, coord, llm_response, location, food, stakeholder, issue)
    
    image_name = ".".join(response_data["media_src"].split(".")[:-1])
    image.save(os.path.join(thumbnail_folder, f"{image_name}.jpg"));

    return response_data

@app.route('/position/pick', methods=['GET'])
def pick_position():
    coords = positioning.pick_position()
    
    coord_dict = {
        "x": coords[0],
        "y": coords[1]
    }

    return coord_dict


@app.route('/position/free', methods=['GET'])
def free_position():
    free_pos = positioning.get_possible_positions()
    
    positions = []
    for i, pos in enumerate(free_pos):
        positions.append({
            "x": pos[0],
            "y": pos[1],
            "id": -i
        })
    
    return positions


@app.route('/sort', methods=['GET'])
def card_sort():
    x_label = request.args.get('x')
    y_label = request.args.get('y')

    cards = database.get_cards()
    
    x_sorting = get_or_create_sorting(x_label, cards)
    y_sorting = get_or_create_sorting(y_label, cards)

    # return {id: {x, y}} from labels
    card_sort = {}
    for id in x_sorting:
        card_sort[id] = {
            "x": x_sorting[id],
            "y": y_sorting[id]
        }
    
    return card_sort
    

@app.route('/cards', methods=['GET'])
def get_cards():
    rows = database.get_cards()
    return rows


@app.route('/media/<filename>', methods=['GET'])
def load_media(filename):
    return database.load_media(filename)


@app.route('/thumbnail/<filename>', methods=['GET'])
def load_thumbnail(filename):
    return database.load_thumb(filename)


@app.route('/dump.json', methods=['GET'])
def dump_database():
    return database.dump_database_json()

if __name__ == '__main__':
    args = parser.parse_args()

    media_folder = os.environ.get("FD_MEDIA_FOLDER", "./")
    thumbnail_folder = os.path.join(media_folder, "thumbnails")

    if not os.path.exists(thumbnail_folder):
        os.makedirs(thumbnail_folder)

    with open('./recognized_classes.json', 'r') as file:
        labels = json.load(file)

    with open('./llm_config.json', 'r') as file:
        llmconfig = json.load(file)

    if not args.mock:        
        clip_model, clip_processor, clip_tokenizer = clipclassifier.get_clip("openai/clip-vit-base-patch32")
        labels_embeddings = clipclassifier.get_labels_embeddings(clip_model, clip_tokenizer, labels)

    app.run(host='0.0.0.0', port=5000)
