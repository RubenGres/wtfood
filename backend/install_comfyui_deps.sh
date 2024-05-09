# SD models
wget -O ComfyUI/models/checkpoints/juggernaut-reborn.safetensors https://civitai.com/api/download/models/274039
wget -O ComfyUI/models/controlnet/control_v11f1e_sd15_tile_fp16.safetensors https://huggingface.co/ckpt/ControlNet-v1-1/resolve/main/control_v11f1e_sd15_tile_fp16.safetensors

# custom nodes for the video workflow (from https://github.com/ltdrdata/ComfyUI-Manager/blob/main/extension-node-map.json)
cd ComfyUI/custom_nodes
git clone https://github.com/ltdrdata/ComfyUI-Impact-Pack.git
git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite
git clone https://github.com/lordgasmic/ComfyUI-Wildcards
git clone https://github.com/pythongosssss/ComfyUI-Custom-Scripts
git clone https://github.com/Fannovel16/comfyui_controlnet_aux
git clone https://github.com/Fannovel16/ComfyUI-Frame-Interpolation
