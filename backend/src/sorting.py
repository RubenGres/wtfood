import random

def sort_cards(cards, label):
    return {
        card["id"]: (random.random() * 2 - 1) for card in cards
    }

