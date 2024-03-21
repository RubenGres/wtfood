from dotenv import load_dotenv
load_dotenv()

import os
from transformers import AutoProcessor, CLIPSegForImageSegmentation
from transformers import CLIPProcessor, CLIPModel, CLIPTokenizer
from diffusers import StableDiffusionInpaintPipeline
import numpy as np
from PIL import Image
import requests
from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS

import base64
from io import BytesIO
import os
import websocket
import uuid

from comfycaller import generate, get_media
from clipclassifier import classify
import positioning
import database


# helpers
def load_b64(image_b64):
    image = Image.open(BytesIO(base64.b64decode(image_b64.split(',', 1)[-1]))).convert("RGB")
    return image

def locate_ip(ip):
    url = f'http://ip-api.com/json/{ip}'
    response = requests.get(url).json()

    if response['status'] == "fail":
        return {'country': "unknown"}
    
    return response


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

    k = list(input_images.keys())[0]
    image = load_b64(input_images[k])
    
    #TODO
    image_class = classify(image)
    if not image_class:
        return "This is an error"

    
    params["prompt"] = f"Futuristic solar punk city, greenery, vines"

    input_images[k] = base64.b64decode(input_images[k])

    # generation is happening here
    outputs = generate(workflow, params, input_images, client_id)
    
    # get generated media info for the video
    media_info = None
    for k in outputs:
        node_output = outputs[k]
        if 'gifs' in node_output.keys():
            media_info = outputs[k]['gifs'][0]

    #TODO error ?
    if not media_info:
        pass
    
    #TODO info text 
    info_text = params["prompt"]
    
    filename = media_info['filename']

    # load the video in RAM
    media_bytes = get_media(media_info['filename'], media_info['subfolder'], media_info['type'])
    
    positioning.remove_coord(coord)
    media_url = database.add_cell(filename, media_bytes, info_text, coord)

    response_data = {
        "media_src": media_url,
        "info_text": info_text
    }
    
    return jsonify(response_data)


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


@app.route('/cards', methods=['GET'])
def get_cards():
    rows = database.get_all_cells_as_dict()
    return rows


@app.route('/media/<filename>', methods=['GET'])
def load_media(filename):
    return database.load_media(filename)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
