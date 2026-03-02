import os
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

# Embedding model - converts text to vectors (fastembed is lightweight)
embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")

# LLM - Groq with llama model
llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.5
)

# Prompt template for question answering
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


def load_video(video_id: str, transcript: str) -> tuple:
    """Full RAG pipeline - takes video_id and transcript, builds a queryable chain, stores it in sessions."""
    
    # Step 1: Check if already loaded
    if video_id in sessions:
        return (video_id, "Already loaded")
    
    # Step 2: Split transcript into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    chunks = text_splitter.create_documents([transcript])
    
    # Step 3: Create vector store with FAISS
    vectorstore = FAISS.from_documents(chunks, embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    
    # Step 4: Create chain using LCEL (LangChain Expression Language)
    # This replaces the deprecated create_retrieval_chain and create_stuff_documents_chain
    
    # First, create a function to format documents
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
    
    # Build the chain: retrieve docs -> format -> prompt -> llm -> parse output
    chain = (
        {"context": retriever | format_docs, "input": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    # Step 5: Store in sessions
    sessions[video_id] = chain
    
    # Step 6: Return success message
    return (video_id, "Video loaded successfully")


def ask_question(video_id: str, question: str) -> str:
    """Ask a question about an already-loaded video."""
    # Step 1: Get chain from sessions
    chain = sessions[video_id]
    
    # Step 2: Invoke chain (LCEL returns the string directly now)
    answer = chain.invoke(question)
    
    # Step 3: Return answer
    return answer
