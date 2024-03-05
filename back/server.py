from transformers import AutoProcessor, CLIPSegForImageSegmentation
from transformers import CLIPProcessor, CLIPModel, CLIPTokenizer
from diffusers import StableDiffusionInpaintPipeline
import numpy as np
from PIL import Image
import requests
from flask import Flask, request
import base64
from io import BytesIO
import os
import websocket
import uuid
import comfyapicall


# fill here with more fruits
labels = ["fruit", "vegetable", "carrot", "tomato", "sweet potato", "radish", "banana", "coconut", "kiwi", "lemon"]

device = "cuda:0"

server_address = "127.0.0.1:8188"
client_id = str(uuid.uuid4())


# helpers
def load_b64(image_b64):
    image = Image.open(BytesIO(base64.b64decode(image_b64.split(',', 1)[-1]))).convert("RGB")
    return image


def get_clip(model_ID):
    model = CLIPModel.from_pretrained(model_ID).to(device)
    processor = CLIPProcessor.from_pretrained(model_ID)
    tokenizer = CLIPTokenizer.from_pretrained(model_ID)
    return model, processor, tokenizer


def get_single_image_embedding(clip_model, my_image):
    image = clip_processor(
        text=None,
        images=my_image,
        return_tensors="pt"
    )["pixel_values"].to(device)
    embedding = clip_model.get_image_features(image)
    return embedding


def get_single_text_embedding(clip_model, clip_tokenizer, text):
    inputs = clip_tokenizer(text, return_tensors="pt").to(device)
    text_embeddings = clip_model.get_text_features(**inputs)
    return text_embeddings


def get_labels_embeddings(clip_model, clip_tokenizer):    
    embeddings = {
        k: get_single_text_embedding(clip_model, clip_tokenizer, f"a photo of a {k}")
        for k in labels
    }

    return embeddings


def image_class_cosim(image, labels_embeddings, clip_model):
    def cosine_similarity(A, B):
        A = A.flatten()
        B = B.flatten()
        dot_product = np.dot(A, B)
        norm_a = np.linalg.norm(A)
        norm_b = np.linalg.norm(B)
        return dot_product / (norm_a * norm_b)

    image_emb = get_single_image_embedding(clip_model, image)

    probas = {}
    for k in labels_embeddings:
        label_emb = labels_embeddings[k]
        probas[k] = cosine_similarity(label_emb.cpu().detach().numpy(), image_emb.cpu().detach().numpy())
        
    return probas


# called by routes

def classify(image):
    cosims =  image_class_cosim(image, labels_embeddings, clip_model)

    # check if this is a fruit or a vegetable
    if cosims["fruit"] < 0.22 or cosims["vegetable"] < 0.22:
        return None

    return max(cosims, key=cosims.get)


def locate_ip(ip):
    url = f'http://ip-api.com/json/{ip}'
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an error for bad responses
        return response.json()  # Converts the JSON response to a Python dictionary
    except requests.RequestException as e:
        return {'error': str(e)}


def gen_mask(image, target_text, threshold=0.5):
    inputs = clipseg_processor(text=target_text, images=[image], padding=True, return_tensors="pt")
    outputs = clipseg_model(**inputs)
    logits = outputs.logits

    tensor_min = logits.min()
    tensor_max = logits.max()
    normalized_tensor = (logits - tensor_min) / (tensor_max - tensor_min)

    # Apply thresholding
    thresholded_tensor = (normalized_tensor > threshold).float() * normalized_tensor * 255
    numpy_image = thresholded_tensor.detach().numpy()

    # Convert to an 8-bit grayscale image
    numpy_image_8bit = numpy_image.astype(np.uint8)
    mask = Image.fromarray(numpy_image_8bit, mode='L')

    return mask


def apply_workflow(image, prompt):
    mask_image = gen_mask(image, "fruit", threshold=0.5)
    gen_image = pipe(prompt=prompt, image=image, mask_image=mask_image, num_inference_steps=10).images[0]
    return mask_image, gen_image


def generate(workflow, params):
    prompt = comfyapicall.load_workflow(workflow)
    img_b64 = comfyapicall.get_images(ws, prompt)
    return img_b64




app = Flask(__name__)

if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    print("LOADING MODELS")

    clipseg_processor = AutoProcessor.from_pretrained("CIDAS/clipseg-rd64-refined")
    clipseg_model = CLIPSegForImageSegmentation.from_pretrained("CIDAS/clipseg-rd64-refined")

    pipe = StableDiffusionInpaintPipeline.from_pretrained(
        "runwayml/stable-diffusion-inpainting"
    )

    pipe.to(device)

    pipe.enable_xformers_memory_efficient_attention()

    clip_model, clip_processor, clip_tokenizer = get_clip("openai/clip-vit-base-patch32")
    labels_embeddings = get_labels_embeddings(clip_model, clip_tokenizer)

    pipe.safety_checker  = None

    ws = websocket.WebSocket()
    ws.connect("ws://{}/ws?clientId={}".format(server_address, client_id))

    print("MODELS LOADED")


@app.route('/transform', methods=['POST'])
def transform():
    data = request.json
    image_b64 = data['image']  # Base64 encoded image
    prompt = data['prompt']

    image = load_b64(image_b64)
    mask_image, gen_image = apply_workflow(image, prompt)

    # Convert to base64 and return the image src
    buffered = BytesIO()
    gen_image.save(buffered, format="JPEG")  # You might need to adjust the format depending on your image
    base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return "data:image/jpeg;base64," + base64_image


@app.route('/info', methods=['POST'])
def info():
    data = request.json
    image_b64 = data['image']  # Base64 encoded image
    image = load_b64(image_b64)

    caller_ip = request.remote_addr

    ip_info = locate_ip(caller_ip)

    classes = classify(image)

    if not classes:
        return {
            "is_valid": False,
            "fruit": None,
            "country": ip_info["country"]
        }
    else:
        return {
            "is_valid": True,
            "fruit": max(classes, key=classes.get),
            "country": ip_info["country"]
        }


if __name__ == '__main__':
    app.run(debug=True)
