from dotenv import load_dotenv
load_dotenv()

import os
import requests
from transformers import AutoProcessor, CLIPSegForImageSegmentation
from transformers import CLIPProcessor, CLIPModel, CLIPTokenizer
from diffusers import StableDiffusionInpaintPipeline
import numpy as np
from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS

import base64
import argparse
import websocket
import uuid

import src.positioning as positioning
import src.database as database
import src.sd_generation as sd_generation
import src.clipclassifier as clipclassifier


# Set up argparse
parser = argparse.ArgumentParser(description='Start food dysmorphia backend')
parser.add_argument('--mock', action='store_true', help='Use mock generation for testing')

def locate_ip(ip):
    url = f'http://ip-api.com/json/{ip}'
    response = requests.get(url).json()

    if response['status'] == "fail":
        return {'country': "unknown"}
    
    return response


def classify(input_images):
    return classify_image(input_images, clip_model, clip_processor, clip_tokenizer, labels_embeddings)


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
        <li> /sorting </li>
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

    if not args.mock:
        image_class = classify(input_images)
        return sd_generation.create_video(input_images, workflow, params, client_id, coord, image_class)
    else:
        return sd_generation.create_mock(input_images, coord)


@app.route('/info', methods=['POST'])
def info():
    data = request.json
    image_b64 = data['image']  # Base64 encoded image
    image = load_b64(image_b64)

    caller_ip = request.remote_addr

    ip_info = locate_ip(caller_ip)

    image_class = classify(image)

    if not image_class:
        return {
            "is_valid": False,
            "fruit": None,
            "country": ip_info["country"]
        }
    else:
        return {
            "is_valid": True,
            "fruit": image_class,
            "country": ip_info["country"]
        }


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


@app.route('/sorting', methods=['GET'])
def sorting():
    x_label = request.args.get('x')
    y_label = request.args.get('y')

    cards = database.get_cards()
    
    # get sorting for x_label, if not exist create it
    x_sorting = database.get_sorting(x_label)
    if not x_sorting:
        x_sorting = sorting.sort_cards(cards, x_label)
        database.add_sorting(x_label, x_sorting)
    
    # get sorting for y_label, if not exist create it
    y_sorting = database.get_sorting(y_label)
    if not y_sorting:
        y_sorting = sorting.sort_cards(cards, y_label)
        database.add_sorting(y_label, y_sorting)
        
    # return {id: {x, y}} from labels
    sorting = {}
    for id in x_sorting:
        sorting[id] = {
            "x": x_sorting[id],
            "y": y_sorting[id]
        }
    
    return sorting
    

@app.route('/cards', methods=['GET'])
def get_cards():
    rows = database.get_cards()
    return rows


@app.route('/media/<filename>', methods=['GET'])
def load_media(filename):
    return database.load_media(filename)


if __name__ == '__main__':
    args = parser.parse_args()

    app.run(host='0.0.0.0', port=5000)

    if not args.mock:
        clip_model, clip_processor, clip_tokenizer = clipclassifier.get_clip("openai/clip-vit-base-patch32")
        labels_embeddings = clipclassifier.get_labels_embeddings(clip_model, clip_tokenizer, labels)
