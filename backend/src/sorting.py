import random
from . import clipclassifier
from . import database
import numpy as np
from PIL import Image


def mock_sort_cards(cards, label):
    return {
        card["id"]: (random.random() * 2 - 1) for card in cards
    }


def get_or_create_card_embedding(card, clip_model, clip_tokenizer, clip_processor):
    if card["id"] in card_embeddings:
        return card_embeddings["id"]
    
    card_image = Image.open(database.get_thumb_path(card['media_path']))
    card_emb = clipclassifier.get_card_embedding(clip_model, clip_processor, clip_tokenizer, card_image, card['title'])
    
    card_embeddings["id"] = card_emb
    
    return card_emb


def sort_cards(cards, label, clip_model, clip_tokenizer, clip_processor):
    sorting = {}

    label_emb = clipclassifier.get_single_text_embedding(clip_model, clip_tokenizer, label)

    for card in cards:
        card_emb = get_or_create_card_embedding(card, clip_model, clip_tokenizer, clip_processor)
        cosim = clipclassifier.cosine_similarity(label_emb.cpu().detach().numpy(), card_emb)
        sorting[card["id"]] = float(cosim)
    
    scores = np.array(list(sorting.values()))
    normalized_scores = norm(scores, -1, 1)
    
    for i, id in enumerate(sorting):
        sorting[id] = normalized_scores[i]
    
    return sorting

def norm(array, a, b):
    return (b-a) * ((array - array.min()) / (array.max() - array.min())) + a

card_embeddings = {}
