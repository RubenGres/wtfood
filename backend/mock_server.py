from dotenv import load_dotenv
load_dotenv()

import time
import base64
import os
from io import BytesIO
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS

import positioning
import database


# helpers
def load_b64(image_b64):
    image = Image.open(BytesIO(base64.b64decode(image_b64.split(',', 1)[-1]))).convert("RGB")
    return image


app = Flask(__name__)

CORS(app)

@app.route('/')
def home():
    return """
    <h1> Food dysmorphia API running </h1>

    Routes:
    <ul>
        <li> /position </li>
        <li> /media </li>
        <li> /cards </li>
        <li> /transform </li>
        <li> /info </li>
    </ul>
    """

@app.route('/transform', methods=['POST'])
def transform():
    data = request.json
    
    image_b64 = data['image']  # Base64 encoded image
    coord = data['coords']

    image = load_b64(image_b64)

    time.sleep(1)

    buffered = BytesIO()
    gen_image = image.convert('1')
    gen_image.save(buffered, format="JPEG")
    base64_image = buffered.getvalue()

    info_text = "This is a call to action"

    positioning.remove_coord(coord)
    media_url = database.add_cell(f"{time.time()}", base64_image, info_text, coord)

    response_data = {
        "media_src": media_url,
        "info_text": info_text
    }

    return jsonify(response_data)


@app.route('/info', methods=['POST'])
def info():
    return {
        "is_valid": True,
        "fruit": "fruit",
        "country": "France"
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
