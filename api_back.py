from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from llama_cpp import Llama
import pickle
import os
from sse_starlette.sse import EventSourceResponse
from retrieve import retrieve_top_chunks

app = FastAPI()

# Configuration CORS la plus ouverte possible
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chargement du modèle GGUF
MODEL_PATH = "./model.gguf"  # Chemin vers le modèle GGUF
llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=8096,
    n_threads=4,
    verbose=False
)

# Load machine learning models
MODELS_DIR = "./models"
models = {}

# Load each model from the models directory
for model_file in os.listdir(MODELS_DIR):
    if model_file.endswith(".pkl"):
        model_name = os.path.splitext(model_file)[0]
        with open(os.path.join(MODELS_DIR, model_file), "rb") as f:
            models[model_name] = pickle.load(f)


async def generate_text(prompt: str):
    """Generate complete text response"""
    response = llm.create_completion(
        prompt,
        max_tokens=512,
        stream=False,
        temperature=0.7,
        top_p=0.9
    )
    
    return response["choices"][0]["text"]


@app.post("/generate_rag")
async def generate_rag_text(request: Request):
    """Endpoint to generate text with RAG context"""
    data = await request.json()
    prompt = data.get("prompt", "")
    
    if not prompt:
        return {"error": "Prompt is required"}
    
    context = retrieve_top_chunks(prompt, top_k=5)
    context_str = "\n".join([f'## Chunk {i+1}\n{chunk[0]}' for i, chunk in enumerate(context)])
    whole_prompt = f"""
You will have to give a advice about CKD based on context taken smartly from Kdigo guidelines.
You have to return the advice and only the advice by sourcing (full title: Kidney Disease: Improving Global Outcomes (KDIGO) 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease).
You have to focus on the context give, and rely only and I insist only on the context given.
You will have as additionnial information the eFGR, UACR and a risk (between 1 and 4) indicating the risk.
You have to be concise and clear and speed at the third person (e.g The patient should take this...)

# Context
{context_str}

# Patient information
{prompt}
"""
    return await generate_text(whole_prompt)

@app.post("/predict")
async def predict(request: Request):
    """Endpoint for model predictions"""
    data = await request.json()
    model_type = data.get("type")
    measurement = data.get("measurement")
    
    if not model_type or not measurement:
        return {"error": "Both 'type' and 'measurement' are required"}
        
    if model_type not in models:
        return {"error": f"Model type '{model_type}' not found"}
        
    try:
        # Get probability of class 1
        model = models[model_type]
        probability = model.predict_proba([[measurement]])[0][1]
        return {"probability": float(probability)}
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

@app.post("/generate")
async def generate_simple_text(request: Request):
    """Endpoint to generate text without RAG context"""
    data = await request.json()
    prompt = data.get("prompt", "")
    
    if not prompt:
        return {"error": "Prompt is required"}
    
    return await generate_text(prompt)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
