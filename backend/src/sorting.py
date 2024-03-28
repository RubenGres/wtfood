import random
from . import clipclassifier


def mock_sort_cards(cards, label):
    return {
        card["id"]: (random.random() * 2 - 1) for card in cards
    }


def sort_cards(cards, label, clip_model, clip_tokenizer):
    sorting = {}

    cards_text = {card["id"]: card["text"] for card in cards}
    label_emb = clipclassifier.get_single_text_embedding(clip_model, clip_tokenizer, label)
    
    for id, text in cards_text.values:
        text_emb = clipclassifier.get_single_text_embedding(clip_model, clip_tokenizer, text)
        sorting[id] = clipclassifier.cosine_similarity(label_emb, text_emb)

    return sorting
