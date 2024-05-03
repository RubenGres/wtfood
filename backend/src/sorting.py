import random
from . import clipclassifier
import numpy as np


def mock_sort_cards(cards, label):
    return {
        card["id"]: (random.random() * 2 - 1) for card in cards
    }


def sort_cards(cards, label, clip_model, clip_tokenizer):
    sorting = {}

    #TODO include more than text
    cards_text = {card["id"]: card["title"] for card in cards}
    label_emb = clipclassifier.get_single_text_embedding(clip_model, clip_tokenizer, label)
    
    for id, text in cards_text.items():
        text_emb = clipclassifier.get_single_text_embedding(clip_model, clip_tokenizer, text)
        cosim = clipclassifier.cosine_similarity(label_emb.cpu().detach().numpy(), text_emb.cpu().detach().numpy())
        sorting[id] = float(cosim)
    
    scores = np.array(list(sorting.values()))
    normalized_scores = norm(scores, -1, 1)
    
    for i, id in enumerate(sorting):
        sorting[id] = normalized_scores[i]
    
    return sorting

def norm(array, a, b):
    return (b-a) * ((array - array.min()) / (array.max() - array.min())) + a

