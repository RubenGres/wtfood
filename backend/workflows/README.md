# Food-dysmorphia ComfyUI API workflows

Every ComfyUI workflow stored here will be able to be called by its name by the fd API.

Additionally to the workflow file you need to create another json file specifying every custom parameter you want to open to the API. 

For example for the workflow "default" you'll have the two following file:
- `default.json`
- `_default.json`

The `_default.json` file is as follow:
```json
{
    "seed": ["3", "inputs", "seed"],
    "prompt": ["6", "inputs", "text"]
}
```

Every parameter is named and links to the node corresponding input path inside the workflow json file.
