from dotenv import load_dotenv
load_dotenv()

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
parser = argparse.ArgumentParser(description='Start food dysmorphia backend')
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
    <h1> Food dysmorphia API running </h1>

    Routes:
    <ul>
        <li> /position/pick </li>
        <li> /position/free </li>
        <li> /cards </li>
        <li> /media/<id> </li>
        <li> /transform </li>
        <li> /sort </li>
        <li> /info </li>
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

    if not args.mock:
        prompts = llmconfig['prompts']
        stakeholder = random.choice(llmconfig['stakeholders'])
        issue = random.choice(llmconfig['issues'])
        food = classify(image)
        location = locate_ip(caller_ip)

        #TODO return an error if food is None
        if food is None:
            return jsonify({'error': 'No fruit or vegetable found in image'}), 404

        llm_response = llmcaller.generate_text(prompts, stakeholder, issue, food, location)

        return sd_generation.create_video(input_images, workflow, params, client_id, coord, llm_response)
    else:
        return sd_generation.create_mock(input_images, coord)


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
    for pos in free_pos:
        positions.append({
            "x": pos[0],
            "y": pos[1]
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


if __name__ == '__main__':
    args = parser.parse_args()

    with open('./recognized_classes.json', 'r') as file:
        labels = json.load(file)

    with open('./llm_config.json', 'r') as file:
        llmconfig = json.load(file)

    if not args.mock:        
        clip_model, clip_processor, clip_tokenizer = clipclassifier.get_clip("openai/clip-vit-base-patch32")
        labels_embeddings = clipclassifier.get_labels_embeddings(clip_model, clip_tokenizer, labels)

    app.run(host='0.0.0.0', port=5000)
