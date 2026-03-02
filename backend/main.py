from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import load_video, ask_question, sessions

# App Setup
app = FastAPI(title="YtChat API")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class LoadRequest(BaseModel):
    video_id: str
    transcript: str


class ChatRequest(BaseModel):
    video_id: str
    question: str


# Endpoints
@app.get("/")
def root():
    """Health check - confirms the API is running."""
    return {"status": "YtChat API is running 🚀"}


@app.post("/api/load")
def load(req: LoadRequest):
    """Load a YouTube video and build its RAG pipeline."""
    try:
        vid, message = load_video(req.video_id, req.transcript)
        return {
            "video_id": vid,
            "title": message,
            "status": "ready"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/chat")
def chat(req: ChatRequest):
    """Ask a question about an already-loaded video."""
    # Check if video is loaded
    if req.video_id not in sessions:
        raise HTTPException(status_code=404, detail="Video not loaded. Call /api/load first.")
    
    try:
        answer = ask_question(req.video_id, req.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
