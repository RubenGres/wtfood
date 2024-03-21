from transformers import CLIPProcessor, CLIPModel, CLIPTokenizer
import numpy as np
import json
import comfycaller as comfycaller


def _get_clip(model_ID):
    model = CLIPModel.from_pretrained(model_ID).to(device)
    processor = CLIPProcessor.from_pretrained(model_ID)
    tokenizer = CLIPTokenizer.from_pretrained(model_ID)
    return model, processor, tokenizer


def _get_single_image_embedding(clip_model, my_image):
    image = clip_processor(
        text=None,
        images=my_image,
        return_tensors="pt"
    )["pixel_values"].to(device)
    embedding = clip_model.get_image_features(image)
    return embedding


def _get_single_text_embedding(clip_model, clip_tokenizer, text):
    inputs = clip_tokenizer(text, return_tensors="pt").to(device)
    text_embeddings = clip_model.get_text_features(**inputs)
    return text_embeddings


def _get_labels_embeddings(clip_model, clip_tokenizer, labels):    
    embeddings = {
        k: _get_single_text_embedding(clip_model, clip_tokenizer, f"a photo of a {k}")
        for k in labels
    }

    return embeddings


def _image_class_cosim(image, labels_embeddings, clip_model):
    def _cosine_similarity(A, B):
        A = A.flatten()
        B = B.flatten()
        dot_product = np.dot(A, B)
        norm_a = np.linalg.norm(A)
        norm_b = np.linalg.norm(B)
        return dot_product / (norm_a * norm_b)

    image_emb = _get_single_image_embedding(clip_model, image)

    probas = {}
    for k in labels_embeddings:
        label_emb = labels_embeddings[k]
        probas[k] = _cosine_similarity(label_emb.cpu().detach().numpy(), image_emb.cpu().detach().numpy())
        
    return probas


def classify(image):
    #TODO resize image to 512x512
    
    cosims =  _image_class_cosim(image, labels_embeddings, clip_model)

    # check if this is a fruit or a vegetable
    if cosims["fruit"] < 0.22 or cosims["vegetable"] < 0.22:
        return None

    return max(cosims, key=cosims.get)

with open('./recognized_classes.json', 'r') as file:
    labels = json.load(file)

device = "cuda:0"

clip_model, clip_processor, clip_tokenizer = _get_clip("openai/clip-vit-base-patch32")
labels_embeddings = _get_labels_embeddings(clip_model, clip_tokenizer, labels)