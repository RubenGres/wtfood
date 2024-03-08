from PIL import Image
from flask import Flask, request, jsonify
import base64
from io import BytesIO
import time


# helpers
def load_b64(image_b64):
    image = Image.open(BytesIO(base64.b64decode(image_b64.split(',', 1)[-1]))).convert("RGB")
    return image


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
    workflow = data['workflow']

    image = load_b64(image_b64)

    time.sleep(5)
    gen_image = image.rotate(45)

    buffered = BytesIO()
    gen_image.save(buffered, format="JPEG")
    base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
    base64_string = "data:image/jpeg;base64," + base64_image

    info_text = "This is a call to action"

    response_data = {
        "image_b64": base64_string,
        "info_text": info_text
    }

    return jsonify(response_data)


@app.route('/info', methods=['POST'])
def info():
    return {
        "is_valid": True,
        "fruit": "coconut",
        "country": "France"
    }


if __name__ == '__main__':
    app.run(debug=True)
