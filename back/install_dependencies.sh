git clone https://github.com/comfyanonymous/ComfyUI.git

cd ComfyUI

# Install pytorch according to your GPU (uncommment what you need to install) 

# AMD
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7

# NVIDIA
# pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121

pip3 install -r requirements.txt

pip3 install --no-cache-dir xformers==0.0.21


