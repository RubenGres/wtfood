# Use Nvidia CUDA base image
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04 as base

# Prevents prompts from packages asking for user input during installation
ENV DEBIAN_FRONTEND=noninteractive
# Prefer binary wheels over source distributions for faster pip installations
ENV PIP_PREFER_BINARY=1
# Ensures output from python is printed immediately to the terminal without buffering
ENV PYTHONUNBUFFERED=1 

# Install Python, git and other necessary tools
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    git \
    wget

# Clean up to reduce image size
RUN apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Clone ComfyUI repository
RUN git clone https://github.com/comfyanonymous/ComfyUI.git /comfyui

# Change working directory to ComfyUI
WORKDIR /comfyui

# Install ComfyUI dependencies
RUN pip3 install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 \
    && pip3 install --no-cache-dir xformers==0.0.21 \
    && pip3 install -r requirements.txt

# Install runpod
RUN pip3 install runpod requests

# Download checkpoints/vae/LoRA to include in image
RUN wget -O models/checkpoints/juggernaut-reborn.safetensors https://civitai.com/api/download/models/274039
RUN wget -O models/controlnet/control_v11f1e_sd15_tile_fp16.safetensors https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11f1e_sd15_tile_fp16.safetensors

# Download all custom nodes 
RUN git clone https://github.com/ltdrdata/ComfyUI-Impact-Pack.git custom_nodes
RUN git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite custom_nodes
RUN git clone https://github.com/lordgasmic/ComfyUI-Wildcards custom_nodes
RUN git clone https://github.com/pythongosssss/ComfyUI-Custom-Scripts custom_nodes
RUN git clone https://github.com/Fannovel16/comfyui_controlnet_aux custom_nodes
RUN git clone https://github.com/Fannovel16/ComfyUI-Frame-Interpolation custom_nodes

RUN export LD_PRELOAD="$(ldconfig -p | grep -Po 'libtcmalloc.so.\d' | head -n 1)"

CMD python3 /main.py --disable-auto-launch --disable-metadata --listen 0.0.0.0 &
