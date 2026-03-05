from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import load_video, ask_question, sessions, get_transcript, extract_video_id

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
    video_url: str  # Accept full URL now, extract ID internally


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
    """Fetch transcript and load video into RAG pipeline in one shot."""
    try:
        video_id = extract_video_id(req.video_url)

        # Skip re-loading if already in session
        if video_id in sessions:
            return {"video_id": video_id, "status": "ready", "message": "Already loaded"}

        transcript = get_transcript(video_id)
        load_video(video_id, transcript)

        return {"video_id": video_id, "status": "ready", "message": "Video loaded successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
def chat(req: ChatRequest):
    """Ask a question about an already-loaded video."""
    if req.video_id not in sessions:
        raise HTTPException(status_code=404, detail="Video not loaded. Call /api/load first.")

    try:
        answer = ask_question(req.video_id, req.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))