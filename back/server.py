from dotenv import load_dotenv
import os

load_dotenv()

media_folder = os.environ.get("FD_MEDIA_FOLDER", "./")

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

from comfycaller import generate
from clipclassifier import classify
import positioning
import database


# helpers
def load_b64(image_b64):
    image = Image.open(BytesIO(base64.b64decode(image_b64.split(',', 1)[-1]))).convert("RGB")
    return image

def locate_ip(ip):
    url = f'http://ip-api.com/json/{ip}'
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an error for bad responses

        #TODO handle error is ip not valid
        
        return response.json()  # Converts the JSON response to a Python dictionary
    except requests.RequestException as e:
        return {'error': str(e)}


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
    image_class = classify(image)
    if image_class:
        params["prompt"] = f"person with a {image_class} face"

    input_images[k] = base64.b64decode(input_images[k])

    # generation is happening here
    images = generate(workflow, params, input_images, client_id)

    image_data = list(images.values())[0][0]
    gen_image = Image.open(BytesIO(image_data))

    buffered = BytesIO()
    gen_image.save(buffered, format="JPEG")
    base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
    base64_string = "data:image/jpeg;base64," + base64_image

    info_text = params["prompt"]

    response_data = {
        "image_b64": base64_string,
        "info_text": info_text
    }

    positioning.remove_coord(coord)

    database.add_cell(gen_image, info_text, coord, image_folder=media_folder)

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


@app.route('/media/<id>', methods=['GET'])
def load_media(id):
    image_folder = "./"

    # Build the file path for the requested video
    video_path = os.path.join(image_folder, f"{id}.jpg")
    
    # Check if the file exists
    if not os.path.isfile(video_path):
        abort(404, description="Video not found")

    # Return the video file
    return send_from_directory(directory=image_folder, path=video_path)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
