from io import BytesIO
import random
import base64
import time
from PIL import Image

from .comfycaller import generate, get_media
from .clipclassifier import classify
import src.positioning as positioning
import src.database as database
import src.llmcaller as llmcaller

def load_b64(image_b64):
    image = Image.open(BytesIO(base64.b64decode(image_b64.split(',', 1)[-1]))).convert("RGB")
    return image


def classify_image(input_images, clip_model, clip_processor, clip_tokenizer, labels_embeddings):
    k = list(input_images.keys())[0]
    image = load_b64(input_images[k])

    image_class = classify(image, clip_model, clip_processor, clip_tokenizer, labels_embeddings)

    if not image_class:
        return "This is an error"

    return image_class


def create_video(input_images, workflow, params, client_id, coord, llm_response):
    params["prompt"] = llm_response["visuals"]

    k = list(input_images.keys())[0]
    input_images[k] = base64.b64decode(input_images[k])

    # generation is happening here
    outputs = generate(workflow, params, input_images, client_id)
    
    # get generated media info for the video
    videos = []
    images = []
    for k in outputs:
        node_output = outputs[k]
        if 'gifs' in node_output.keys():
            videos.extend(outputs[k]['gifs'])
        else:
            images.extend(outputs[k]['images'])

    media_info = None
    if not len(videos) == 0:
        media_info = videos[-1]
    else:
        media_info = images[-1]
    
    # load the video in RAM
    filename = media_info['filename']
    media_bytes = get_media(media_info['filename'], media_info['subfolder'], media_info['type'])
    
    positioning.remove_coord(coord)

    title = llm_response["title"]
    text = llm_response["article"]
    media_url = database.add_cell(filename, media_bytes, title, text, coord)

    response_data = {
        "media_src": media_url,
        "title": title,
        "text": text,
        "id": cell_id
    }
    
    return response_data


def create_mock(input_images, coord, llm_response):
    image = load_b64(list(input_images.values())[0])

    buffered = BytesIO()

    gen_image = image.point(lambda p: 255 if p > 128 else 128)
    
    gen_image.save(buffered, format="JPEG")
    base64_image = buffered.getvalue()

    positioning.remove_coord(coord)

    title = llm_response["title"]
    text = llm_response["article"]
    media_url, cell_id = database.add_cell(f"{time.time()}.jpg", base64_image, title, text, coord)

    response_data = {
        "media_src": media_url,
        "title": title,
        "text": text,
        "id": cell_id
    }

    return response_data
