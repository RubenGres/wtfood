from transformers import AutoProcessor, CLIPSegForImageSegmentation
from transformers import CLIPProcessor, CLIPModel, CLIPTokenizer
from diffusers import StableDiffusionInpaintPipeline
import numpy as np
from PIL import Image
import requests
from flask import Flask, request, jsonify
import base64
from io import BytesIO
import os
import websocket
import uuid

from comfyapicall import generate
from clipclassifier import classify


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

@app.route('/')
def home():
    return """
    <h1> Food dysmorphia API running </h1>

    Routes:
    <ul>
        <li> /transform </li>
        <li> /info </li>
    </ul>
    """


@app.route('/transform', methods=['POST'])
def transform():
    data = request.json
    
    image_b64 = data['image']  # Base64 encoded image
    image = load_b64(image_b64)
    
    workflow = data['workflow']
    params = data['params']
    client_id = data['client_id']

    image_class = classify(image)
    if image_class:
        params["prompt"] = f"person with a {image_class} face"

    # generation is happening here
    images = generate(workflow, params, client_id, "127.0.0.1:8188")
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)