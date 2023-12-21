from transformers import AutoProcessor, CLIPSegForImageSegmentation
from diffusers import StableDiffusionInpaintPipeline
import numpy as np
from PIL import Image

from flask import Flask, request
from PIL import Image

clipseg_processor = AutoProcessor.from_pretrained("CIDAS/clipseg-rd64-refined")
clipseg_model = CLIPSegForImageSegmentation.from_pretrained("CIDAS/clipseg-rd64-refined")

pipe = StableDiffusionInpaintPipeline.from_single_file(
    "./models/sd-v1-5-inpainting.ckpt"
)