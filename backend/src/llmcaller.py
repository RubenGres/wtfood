import requests
from openai import OpenAI
import os
import json
import time
from openai import OpenAI
from tavily import TavilyClient

def tavily_search(query):
    tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
    search_result = tavily_client.get_search_context(query, search_depth="advanced", max_tokens=8000)
    return search_result

# Function to wait for a run to complete
def wait_for_run_completion(client, thread_id, run_id):
    while True:
        time.sleep(1)
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
        if run.status in ['completed', 'failed', 'requires_action']:
            return run

# Function to handle tool output submission
def submit_tool_outputs(client, thread_id, run_id, tools_to_call):
    tool_output_array = []
    for tool in tools_to_call:
        output = None
        tool_call_id = tool.id
        function_name = tool.function.name
        function_args = tool.function.arguments

        if function_name == "tavily_search":
            output = tavily_search(query=json.loads(function_args)["query"])

        if output:
            tool_output_array.append({"tool_call_id": tool_call_id, "output": output})

    return client.beta.threads.runs.submit_tool_outputs(
        thread_id=thread_id,
        run_id=run_id,
        tool_outputs=tool_output_array
    )

# Function to print messages from a thread
def print_messages_from_thread(client, thread_id):
    messages = client.beta.threads.messages.list(thread_id=thread_id)
    for msg in messages:
        print(f"{msg.role}: {msg.content[0].text.value}")

def get_messages_from_thread(client, thread_id):
    messages = client.beta.threads.messages.list(thread_id=thread_id)
    return messages

def send_message_llm(user_input, client, thread, assistant_id):
  # Create a message
  message = client.beta.threads.messages.create(
      thread_id=thread.id,
      role="user",
      content=user_input,
  )

  # Create a run
  run = client.beta.threads.runs.create(
      thread_id=thread.id,
      assistant_id=assistant_id,
  )

  # Wait for run to complete
  run = wait_for_run_completion(client, thread.id, run.id)

  if run.status == 'failed':
    print(run.error)

  elif run.status == 'requires_action':
    run = submit_tool_outputs(client, thread.id, run.id, run.required_action.submit_tool_outputs.tool_calls)
    run = wait_for_run_completion(client, thread.id, run.id)

  # Print messages from the thread
  return get_messages_from_thread(client, thread.id)


def generate_text(prompts, stakeholder, issue, food, place, model="gpt-4-turbo-2024-04-09"):    
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    assistant = client.beta.assistants.create(
        instructions=prompts["system"],
        model=model,
        tools=[{
            "type": "function",
            "function": {
                "name": "tavily_search",
                "description": "Get information on recent events from the web.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "The search query to use. For example: 'Latest news on Nvidia stock performance'"},
                    },
                    "required": ["query"]
                    }
                }
            }]
    )

    assistant_id = assistant.id
    thread = client.beta.threads.create()

    llm_response = {}

    for key, prompt in prompts["user"].items():
        user_message = prompt.format(stakeholder=stakeholder, issue=issue, food=food, place=place)
        llm_anwser = send_message_llm(user_message, client, thread, assistant_id)
        llm_response[key] = list(llm_anwser)[0].content[0].text.value

    return llm_response
