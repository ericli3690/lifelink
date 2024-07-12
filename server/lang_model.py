import sys
from langchain_community.llms import LlamaCpp

# enable verbose to debug the LLM's operation
verbose = False

# Just using synthia-7b out-of-the-box, of course in future versions this could be fine-tuned
# emergency-situation-specific inference, since it takes a bunch of funding

llm = LlamaCpp(
    model_path="./synthia-7b-v2.0-16k.Q2_K.gguf",
    # max tokens the model can account for when processing a response
    # make it large enough for the question and answer
    n_ctx=4096,
    # number of layers to offload to the GPU 
    # GPU is not strictly required but it does help
    n_gpu_layers=32,
    # number of tokens in the prompt that are fed into the model at a time
    n_batch=1024,
    # use half precision for key/value cache; set to True per langchain doc
    f16_kv=True,
    verbose=verbose,
)

def predict_diagnosis(symptoms):

    prompt = f"""
        You are an emergency-aid first responder in the following situation: a victim has suddenly starts expirencing the following symptoms:
        {("; ").join(symptoms)}. 
        First, provide the most likely diagnosis for the victim's condition in one sentence followed by a brief description of the condition.
        Second, provide instructions for what a first responder should do to help ensure the victim survives, based on their condition.
    """

    print("Generating Response...")

    output = llm(
        prompt,
        max_tokens=4096,
        temperature=0.2,
        # nucleus sampling (mass probability index)
        # controls the cumulative probability of the generated tokens
        # the higher top_p the more diversity in the output
        top_p=0.1
    )

    print(output)

predict_diagnosis(['Paralysis', 'Choking', 'Extreme pain'])