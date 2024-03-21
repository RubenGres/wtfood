#git clone https://github.com/comfyanonymous/ComfyUI.git

#cd ComfyUI

# Install pytorch according to your GPU (uncommment what you need to install) 

# AMD
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7

# NVIDIA
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121

pip3 install -r requirements.txt

# custom nodes for the video workflow (from https://github.com/ltdrdata/ComfyUI-Manager/blob/main/extension-node-map.json)
cd ComfyUI/custom_nodes
git clone https://github.com/ltdrdata/ComfyUI-Impact-Pack.git
git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite
git clone https://github.com/lordgasmic/ComfyUI-Wildcards
git clone https://github.com/pythongosssss/ComfyUI-Custom-Scripts
git clone https://github.com/Fannovel16/comfyui_controlnet_aux
git clone https://github.com/Fannovel16/ComfyUI-Frame-Interpolation
git clone https://github.com/Fannovel16/comfyui_controlnet_aux

pip3 install imageio-ffmpeg
pip3 install opencv-python
