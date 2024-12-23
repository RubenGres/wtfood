from transformers import CLIPProcessor, CLIPModel, CLIPTokenizer
import numpy as np
import torch
from PIL import Image


def cosine_similarity(A, B):
    A = A.flatten()
    B = B.flatten()
    dot_product = np.dot(A, B)
    norm_a = np.linalg.norm(A)
    norm_b = np.linalg.norm(B)
    return dot_product / (norm_a * norm_b)


def get_labels_embeddings(clip_model, clip_tokenizer, labels):    
    embeddings = {
        k: get_single_text_embedding(clip_model, clip_tokenizer, f"a photo containing a {k}")
        for k in labels
    }

    return embeddings


def get_card_embedding(clip_model, clip_processor, clip_tokenizer, card_image, card_title):
    with torch.no_grad():
        image_features = _get_single_image_embedding(clip_model, clip_processor, card_image)
        text_features = get_single_text_embedding(clip_model, clip_tokenizer, card_title)
    
    combined_features = (image_features + text_features) / 2
    
    return combined_features.cpu().numpy()


def get_clip(model_ID):
    model = CLIPModel.from_pretrained(model_ID).to(device)
    processor = CLIPProcessor.from_pretrained(model_ID)
    tokenizer = CLIPTokenizer.from_pretrained(model_ID)
    return model, processor, tokenizer


def _get_single_image_embedding(clip_model, clip_processor, my_image):
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


def _image_class_cosim(image, labels_embeddings, clip_model, clip_processor):
    image_emb = _get_single_image_embedding(clip_model, clip_processor, image)

    probas = {}
    for k in labels_embeddings:
        label_emb = labels_embeddings[k]
        probas[k] = cosine_similarity(label_emb.cpu().detach().numpy(), image_emb.cpu().detach().numpy())
        
    return probas


def classify(image, clip_model, clip_processor, labels_embeddings):
    image = image.resize((512, 512), Image.LANCZOS)

    cosims =  _image_class_cosim(image, labels_embeddings, clip_model, clip_processor)

    # check if this is a fruit or a vegetable
    if cosims["fruit"] < 0.21 or cosims["vegetable"] < 0.21:
        return None

    return max(cosims, key=cosims.get)

device = "cuda:0"
