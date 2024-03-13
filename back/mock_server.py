from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

import base64
from io import BytesIO
import time

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
        <li> /get_position </li>
        <li> /transform </li>
        <li> /info </li>
    </ul>
    """

@app.route('/transform', methods=['POST'])
def transform():
    data = request.json
    
    image_b64 = data['image']  # Base64 encoded image
    workflow = data['workflow']
    params = data['params']
    client_id = data['client_id']

    image = load_b64(image_b64)

    time.sleep(1)
    gen_image = image.rotate(90)

    buffered = BytesIO()
    gen_image.save(buffered, format="JPEG")
    base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
    base64_string = "data:image/jpeg;base64," + base64_image

    info_text = "This is a call to action"

    response_data = {
        "image_b64": base64_string,
        "info_text": info_text
    }

    coord = positioning.new_coordinates()
    print(coord)
    positioning.remove_coord(coord);

    database.add_cell(gen_image, info_text, coord)

    return jsonify(response_data)


@app.route('/info', methods=['POST'])
def info():
    return {
        "is_valid": True,
        "fruit": "coconut",
        "country": "France"
    }


@app.route('/get_position', methods=['GET'])
def get_position():
    return positioning.new_coordinates()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
