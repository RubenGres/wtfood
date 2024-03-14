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
        <li> /next_position </li>
        <li> /video </li>
        <li> /cards </li>
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


@app.route('/position', methods=['GET'])
def get_position():
    coords = positioning.new_coordinates()
    
    coord_dict = {
        "x": coords[0],
        "y": coords[1]
    }

    return coord_dict


@app.route('/cards', methods=['GET'])
def get_cards():
    rows = database.get_all_cells_as_dict()
    return rows


@app.route('/video/<video_id>', methods=['GET'])
def get_video(video_id):
    image_folder = "./"

    # Build the file path for the requested video
    video_path = os.path.join(image_folder, f"{video_id}.jpg")
    
    # Check if the file exists
    if not os.path.isfile(video_path):
        abort(404, description="Video not found")

    # Return the video file
    return send_from_directory(directory=image_folder, path=video_path)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
