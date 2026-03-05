import os
import re
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Sessions store - cache for loaded videos
sessions = {}

# Embedding model
embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")

# LLM - Groq with llama model
llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.5
)

# Prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are YtChat, a helpful assistant that answers questions strictly based on a YouTube video's transcript.
RULES:
- Answer ONLY from the context provided. Never use outside knowledge.
- If the answer isn't in the context, say: "I couldn't find that in the video."
- Keep answers clear and concise.
- Use bullet points or numbered lists when explaining steps or multiple points.
- Use **bold** for important terms or key takeaways.
- If quoting the video directly, use "quotes".
- Don't say "based on the context" or "the transcript says" — just answer naturally.
Context:
{context}"""),
    ("human", "{input}")
])

def extract_video_id(url: str) -> str:
    pattern1 = r"(?:v=|\/)([0-9A-Za-z_-]{11})"
    pattern2 = r"youtu\.be\/([0-9A-Za-z_-]{11})"
    for pattern in [pattern1, pattern2]:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError("Invalid YouTube URL. Could not extract video ID.")

def get_transcript(video_id: str) -> str:
    try:
        ytt_api = YouTubeTranscriptApi()
        transcript_list = ytt_api.list(video_id)
        
        # Pick first available transcript (any language)
        transcript = transcript_list.find_transcript(
            [t.language_code for t in transcript_list]
        )
        fetched = transcript.fetch()
        return " ".join([entry.text for entry in fetched])
    except Exception as e:
        raise ValueError(f"Could not fetch transcript: {str(e)}")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def load_video(video_id: str, transcript: str) -> str:
    if video_id in sessions:
        return "Already loaded"
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    chunks = text_splitter.create_documents([transcript])
    vectorstore = FAISS.from_documents(chunks, embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    chain = (
        {"context": retriever | format_docs, "input": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    sessions[video_id] = chain
    return "Video loaded successfully"

def ask_question(video_id: str, question: str) -> str:
    chain = sessions[video_id]
    return chain.invoke(question)