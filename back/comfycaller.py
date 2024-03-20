import os
import io
import json
import base64
import websocket
import urllib.parse
from PIL import Image
import urllib.request
from requests_toolbelt import MultipartEncoder

server_address = os.environ.get("COMFY_API_URL", "127.0.0.1:8188")


def _deep_merge(dict_a, dict_b):
    """
    Recursively merges two dictionaries. Values from dict_b override dict_a in case of conflicts.
    Nested dictionaries are also merged.

    :param dict_a: First dictionary.
    :param dict_b: Second dictionary, whose values will override dict_a's in case of conflicts.
    :return: Merged dictionary.
    """
    result = dict_a.copy()  # Start with a shallow copy of dict_a to avoid modifying it directly
    for key, value in dict_b.items():
        # If the key is present in both dictionaries and both values are dictionaries, merge them recursively
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _deep_merge(result[key], value)
        else:
            # If the key is new or not a dictionary, simply override the value
            result[key] = value
    return result


def _build_override_dict(schema, params=None):
    override_dict = {}

    for param, value in params.items():
        nested_keys = schema[param]
        current_level = override_dict

        for i, key in enumerate(nested_keys):
            # If we are at the last key, set the value
            if i == len(nested_keys) - 1:
                current_level[key] = value
            else:
                # If the key does not exist, or it's not a dictionary (unexpected), create a new dict
                if key not in current_level or not isinstance(current_level[key], dict):
                    current_level[key] = {}
                # Move to the next level
                current_level = current_level[key]

    return override_dict


def load_workflow(workflow, params):
    try:
        with open(f"workflows/{workflow}.json") as f:
            worflow_steps = json.load(f)

        if params:
            with open(f"workflows/_{workflow}.json") as f:
                schema = json.load(f)

            params_dict = _build_override_dict(schema, params)
            worflow_steps = _deep_merge(worflow_steps, params_dict)

        return worflow_steps

    except FileNotFoundError:
        return None


def queue_prompt(prompt, client_id):
    p = {"prompt": prompt, "client_id": client_id}
    data = json.dumps(p).encode('utf-8')
    req = urllib.request.Request("http://{}/prompt".format(server_address), data=data)
    return json.loads(urllib.request.urlopen(req).read())


def get_media(filename, subfolder, folder_type):
    data = {"filename": filename, "subfolder": subfolder, "type": folder_type}
    url_values = urllib.parse.urlencode(data)
    with urllib.request.urlopen("http://{}/view?{}".format(server_address, url_values)) as response:
        return response.read()


def get_history(prompt_id):
    with urllib.request.urlopen("http://{}/history/{}".format(server_address, prompt_id)) as response:
        return json.loads(response.read())


def get_images(ws, prompt, client_id):
    prompt_id = queue_prompt(prompt, client_id)['prompt_id']
    output_images = {}
    while True:
        out = ws.recv()
        if isinstance(out, str):
            message = json.loads(out)
            if message['type'] == 'executing':
                data = message['data']
                if data['node'] is None and data['prompt_id'] == prompt_id:
                    break  #Execution is done
        else:
            continue  #previews are binary data

    history = get_history(prompt_id)[prompt_id]
    for o in history['outputs']:
        for node_id in history['outputs']:
            node_output = history['outputs'][node_id]
            if 'images' in node_output:
                images_output = []
                for image in node_output['images']:
                    image_data = get_media(image['filename'], image['subfolder'], image['type'])
                    images_output.append(image_data)
            output_images[node_id] = images_output

    return output_images


def get_outputs(ws, prompt, client_id):
    prompt_id = queue_prompt(prompt, client_id)['prompt_id']
    node_outputs = {}
    while True:
        out = ws.recv()
        if isinstance(out, str):
            message = json.loads(out)
            if message['type'] == 'executing':
                data = message['data']
                if data['node'] is None and data['prompt_id'] == prompt_id:
                    break  #Execution is done
        else:
            continue  #previews are binary data

    history = get_history(prompt_id)[prompt_id]

    for o in history['outputs']:
        for node_id in history['outputs']:
            node_outputs[node_id] = history['outputs'][node_id]

    return node_outputs


def upload_image(b64img, name, server_address, image_type="input", overwrite=False):
    """image type can be input, temp or output"""

    multipart_data = MultipartEncoder(
        fields={
            'image': (name, b64img, 'text/plain'),
            'type': image_type,
            'overwrite': str(overwrite).lower()
        }
    )

    headers = {'Content-Type': multipart_data.content_type}

    request = urllib.request.Request(f"http://{server_address}/upload/image", data=multipart_data.to_string(), headers=headers)

    # Perform the request and return the response
    with urllib.request.urlopen(request) as response:
        return response.read()


def generate(workflow, params, input_images, client_id):
    ws = websocket.WebSocket()
    ws.connect("ws://{}/ws?clientId={}".format(server_address, client_id))

    for k in input_images:
        b64img = input_images[k]
        upload_image(b64img, k, server_address, image_type="input", overwrite=True)

    prompt = load_workflow(workflow, params)
    return get_outputs(ws, prompt, client_id)
