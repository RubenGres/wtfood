from transformers import AutoProcessor, CLIPSegForImageSegmentation
from diffusers import StableDiffusionInpaintPipeline
import numpy as np
from PIL import Image

from flask import Flask, request
from PIL import Image
import os

app = Flask(__name__)

if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    print("LOADING MODELS")

    clipseg_processor = AutoProcessor.from_pretrained("CIDAS/clipseg-rd64-refined")
    clipseg_model = CLIPSegForImageSegmentation.from_pretrained("CIDAS/clipseg-rd64-refined")

    pipe = StableDiffusionInpaintPipeline.from_single_file(
        "./models/sd-v1-5-inpainting.ckpt"
    )
    pipe.safety_checker  = None

    print("MODELS LOADED")

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


@app.route('/transform', methods=['POST'])
def handle_request():
    data = request.json
    image_url = data['image_url']  # Base64 encoded image
    prompt = data['prompt']

    image = Image.open(image_url)
    mask_image, gen_image = apply_workflow(image, prompt)

    save_path = "/home/ruben/food-dysmorphia/no_canvas/output/" + image_url.split('/')[-1]
    print(save_path)
    gen_image.save(save_path)
    
    return "output/" + image_url.split('/')[-1]

if __name__ == '__main__':
    app.run(debug=True)
