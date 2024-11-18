FROM timpietruskyblibla/runpod-worker-comfy:3.1.0-base

WORKDIR /comfyui

# Download checkpoints/vae/LoRA to include in image
RUN wget -O models/checkpoints/juggernaut-reborn.safetensors https://civitai.com/api/download/models/274039
RUN wget -O models/controlnet/control_v11f1e_sd15_tile_fp16.safetensors https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11f1e_sd15_tile_fp16.safetensors

RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y

# Download all custom nodes 
RUN mkdir -p custom_nodes && cd custom_nodes && \
    git clone https://github.com/ltdrdata/ComfyUI-Manager.git && \
    git clone https://github.com/ltdrdata/ComfyUI-Impact-Pack.git && \
    git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite && \
    git clone https://github.com/pythongosssss/ComfyUI-Custom-Scripts && \
    git clone https://github.com/Fannovel16/comfyui_controlnet_aux && \
    git clone https://github.com/Fannovel16/ComfyUI-Frame-Interpolation

RUN pip3 install -r custom_nodes/ComfyUI-Impact-Pack/requirements.txt && python3 custom_nodes/ComfyUI-Impact-Pack/install.py

RUN pip3 install ultralytics matplotlib scikit-image imageio_ffmpeg

RUN apt install curl -y && mkdir -p /comfyui/custom_nodes/ComfyUI-Frame-Interpolation/ckpts/film/ && \
    curl -L -o /comfyui/custom_nodes/ComfyUI-Frame-Interpolation/ckpts/film/film_net_fp32.pt https://github.com/dajes/frame-interpolation-pytorch/releases/download/v1.0.0/film_net_fp32.pt

RUN mkdir -p /comfyui/wildcards

RUN wget -O models/controlnet/control_v11f1e_sd15_tile_fp16.safetensors https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11f1e_sd15_tile_fp16.safetensors


WORKDIR /comfyui
CMD python3 main.py --disable-auto-launch --disable-metadata --listen 0.0.0.0
