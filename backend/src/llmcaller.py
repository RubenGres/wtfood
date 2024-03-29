import requests
from openai import OpenAI


def locate_ip(ip):
    url = f'http://ip-api.com/json/{ip}'
    response = requests.get(url).json()

    if response['status'] == "fail":
        return {'country': "unknown"}
    
    return response


def generate_text(prompts, stakeholder, issue, food, place, model="gpt-4-0125-preview"):
    client = OpenAI()

    llm_response = {} # the response that will be returned at the end of the function
    conversation_history = []  # Initialize an empty list to store conversation history

    for k, prompt in prompts.items():
        system_prompt = prompt['system'].format(stakeholder=stakeholder, issue=issue, food=food, place=place)
        user_prompt = prompt['user'].format(stakeholder=stakeholder, issue=issue, food=food, place=place)

        # Append system and user prompts to conversation history
        conversation_history.append({"role": "system", "content": system_prompt})
        conversation_history.append({"role": "user", "content": user_prompt}) 

        # Send conversation history along with new prompts to the API
        response = client.chat.completions.create(
            model=model,
            messages=conversation_history,
            temperature=1,
            max_tokens=2048,
            top_p=0.9,
            frequency_penalty=1,
            presence_penalty=1
        )

        response_text = response.choices[0].message.content

        # Add to response 
        llm_response[k] = response_text
    
        # Append the response to conversation history for continuity
        conversation_history.append({"role": "system", "content": response_text})

    return llm_response
