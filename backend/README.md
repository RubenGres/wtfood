# Food-dysmorphia backend

This folder contains the backend of the food-dysmorphia (FD) project. 

Image recognition is made using CLIP from the `recognized classes.json` list.
The image generation backend is based on an ComfyUI instance. All configuration variables can be configured in the `.env` file.

# Installation

## FD API installation

To use the API you'll first need to install all dependencies using pip

```bash
pip install -r requirements.txt 
```

## ComfyUI installation for FD

First install ComfyUI from the official repository

```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt 
```

Install pytorch according to your GPU type if you don't already have it

### AMD
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7
```

### NVIDIA
```bash
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121
```

To install all custom nodes and models used in food-dysmorphia in one go you can use the script  `install_comfyui_deps.sh`

```bash
./install_comfyui_deps.sh
```

# Usage

Once everything is installed you can start the API with `python main.py`
