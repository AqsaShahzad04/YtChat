🎬 YtChat — Chat with Any YouTube Video
This is a RAG (Retrieval-Augmented Generation) backend API that lets users ask questions about any YouTube video by analyzing its transcript. Think of it as a chatbot that "watches" a YouTube video for you and can answer questions about it.

🏗️ Architecture Overview
The project is a backend-only FastAPI application with two core files:

File	Purpose

main.py
API layer — defines endpoints and handles HTTP requests

rag.py
Core AI logic — transcript extraction, embedding, vector search, and LLM answering

.env
Stores the Groq API key

Dockerfile
Docker container setup (targets port 7860, likely for Hugging Face Spaces deployment)

requirements.txt
Python dependencies
🔄 How It Works (The RAG Pipeline)
The flow is a clean two-step process:

Step 1 — Load a Video (POST /api/load)

User sends a YouTube URL

extract_video_id()
 parses the 11-char video ID from any YouTube URL format

get_transcript()
 fetches the video's captions using youtube-transcript-api
The transcript is chunked into ~1000-char pieces (with 150-char overlap) using LangChain's RecursiveCharacterTextSplitter
Chunks are embedded into vectors using sentence-transformers/all-MiniLM-L6-v2 (a local HuggingFace model)
A FAISS vector store is created for fast similarity search
A retrieval chain is built combining the vector retriever (top-4 results) + Groq's Llama 3.3 70B LLM
The chain is cached in an in-memory sessions dict keyed by video ID
Step 2 — Ask Questions (POST /api/chat)

User sends a 

video_id
 + 

question
The pre-built chain retrieves the 4 most relevant transcript chunks
These chunks are fed as context to Llama 3.3 70B via Groq
The LLM answers strictly from the transcript (no hallucination — enforced by the system prompt)
🧠 Tech Stack
Layer	Technology
Web Framework	FastAPI + Uvicorn
LLM Provider	Groq (Llama 3.3 70B Versatile)
Embeddings	HuggingFace all-MiniLM-L6-v2 (runs locally)
Vector Store	FAISS (in-memory)
Orchestration	LangChain (retrieval chain + stuff documents chain)
Transcript Source	youtube-transcript-api
Deployment	Docker → Hugging Face Spaces (port 7860)
📝 Key Observations
No frontend yet — This is purely a backend API. There's no UI to interact with it (the .cursor folder suggests you might be building one).
In-memory sessions — The sessions dict means all loaded videos are lost on server restart. No persistence (no database).
No authentication — CORS is set to allow_origins=["*"], and there's no auth layer. Fine for a prototype, but worth noting.
Groq API key is exposed in the 

.env
 file (and committed to git based on the file being there). You'll want to rotate that key.
Smart caching — If a video is already loaded, it skips re-processing ("Already loaded" response).
Clean system prompt — The LLM is instructed to never hallucinate and only answer from the transcript context, with nice formatting rules (bold, bullets, quotes).
🚀 Summary
YtChat is a clean, well-structured RAG backend that turns any YouTube video into a searchable, conversational knowledge base. The pipeline is solid — it's using industry-standard tools (FAISS, LangChain, Groq) with good defaults. The main gaps are no frontend, no persistence, and no auth, which are all typical for an early-stage prototype.