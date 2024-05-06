# WTFood backend

This folder contains the backend of the food-dysmorphia project. This includes code for the database and API.
ComfyUI also need to be run for the video generation. 

COnfiguration can be made in the .env and *.json files in this repository:
- `recognized classes.json`: All classes allowed by the CLIP model for generating the images.
- `llm_config.json`: All prompts sent to the LLM, articles, titles and visuals are needed keys to create the card.
- `.env`, global configuration file, include database path, media folder and API keys.

# Install instructions

## Installing the API

To use the API you'll first need to install all dependencies using pip

```bash
pip install -r requirements.txt 
```

## ComfyUI
The simplest way to set it up is to use the docker: `docker run wtfood-comfyui`. You can also set up ComfyUI manually and use the `install_comfyui_deps.sh` script in the backend folder. ComfyUI install instruction can be found in the  [official repository](https://github.com/comfyanonymous/ComfyUI)

## Usage

Once everything is installed you can start the API with `python main.py`.
You can pass the --mock argument if you don't want to rely on AI generation for testing purposes.
