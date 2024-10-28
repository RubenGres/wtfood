from flask import Flask, request, jsonify
from transformers import CLIPProcessor, CLIPModel, CLIPTokenizer
import numpy as np
import torch
from PIL import Image
import io

app = Flask(__name__)

# Device setting
device = "cuda:0" if torch.cuda.is_available() else "cpu"

# Load the model, processor, and tokenizer during server startup
model_id = "openai/clip-vit-large-patch14"  # Use a robust CLIP model
clip_model, clip_processor, clip_tokenizer = None, None, None

def load_clip_model():
    global clip_model, clip_processor, clip_tokenizer
    clip_model = CLIPModel.from_pretrained(model_id).to(device)
    clip_processor = CLIPProcessor.from_pretrained(model_id)
    clip_tokenizer = CLIPTokenizer.from_pretrained(model_id)

# Load model on startup
load_clip_model()

# Utility functions
def cosine_similarity(A, B):
    A, B = A.flatten(), B.flatten()
    return np.dot(A, B) / (np.linalg.norm(A) * np.linalg.norm(B))

def get_single_text_embedding(clip_model, clip_tokenizer, text):
    inputs = clip_tokenizer(text, return_tensors="pt").to(device)
    text_embeddings = clip_model.get_text_features(**inputs)
    return text_embeddings

def _get_single_image_embedding(clip_model, clip_processor, my_image):
    image = clip_processor(images=my_image, return_tensors="pt")["pixel_values"].to(device)
    return clip_model.get_image_features(image)

# Routes
@app.route("/get_labels_embeddings", methods=["POST"])
def get_labels_embeddings():
    labels = request.json.get("labels", [])
    if not clip_model or not clip_tokenizer:
        return jsonify({"error": "Model not loaded"}), 500
    embeddings = {
        k: get_single_text_embedding(clip_model, clip_tokenizer, f"a photo containing a {k}").detach().cpu().numpy().tolist()
        for k in labels
    }
    return jsonify(embeddings)

@app.route("/get_card_embedding", methods=["POST"])
def get_card_embedding():
    card_title = request.json.get("card_title", "")
    file = request.files.get("card_image")
    if not file or not card_title:
        return jsonify({"error": "Image and title are required"}), 400
    image = Image.open(io.BytesIO(file.read()))
    with torch.no_grad():
        image_features = _get_single_image_embedding(clip_model, clip_processor, image)
        text_features = get_single_text_embedding(clip_model, clip_tokenizer, card_title)
        combined_features = (image_features + text_features) / 2
    return jsonify({"embedding": combined_features.cpu().numpy().tolist()})

@app.route("/classify", methods=["POST"])
def classify():
    labels_embeddings = request.json.get("labels_embeddings")
    if not labels_embeddings:
        return jsonify({"error": "Labels embeddings required"}), 400
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "Image required"}), 400
    image = Image.open(io.BytesIO(file.read())).resize((512, 512), Image.LANCZOS)
    
    with torch.no_grad():
        image_emb = _get_single_image_embedding(clip_model, clip_processor, image)
        cosims = {k: cosine_similarity(np.array(v), image_emb.cpu().numpy()) for k, v in labels_embeddings.items()}
    
    classification = None
    if cosims["fruit"] >= 0.21 and cosims["vegetable"] >= 0.21:
        classification = max(cosims, key=cosims.get)
    
    return jsonify({"classification": classification})

@app.route("/", methods=["GET"])
def documentation():
    doc = {
        "routes": {
            "/": "GET - Returns this API documentation.",
            "/get_labels_embeddings": "POST - Generate text embeddings for given labels. Payload: {'labels': ['label1', 'label2', ...]}",
            "/get_card_embedding": "POST - Generate a combined image and text embedding. Payload: {'card_title': 'title'} and file upload for 'card_image'.",
            "/classify": "POST - Classify an uploaded image using provided label embeddings. Payload: {'labels_embeddings': {...}} and file upload for 'image'."
        },
        "description": "This API provides endpoints for text and image embeddings using OpenAI's CLIP model, and enables image classification based on text labels."
    }
    return jsonify(doc)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
