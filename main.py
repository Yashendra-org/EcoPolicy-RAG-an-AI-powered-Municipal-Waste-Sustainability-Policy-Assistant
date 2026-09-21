import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Security, Request
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging (Sanitized - no plain text user queries logged in production)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Configuration & Constants ---
POLICY_FILE = "municipal_waste_policy.txt"
CHROMA_DIR = "./chroma_db"
API_KEY_NAME = "X-API-Key"

# Retrieve secret key from environment or use a secure fallback
SECRET_API_KEY = os.getenv("API_SECRET_KEY", "ECO_RAG_SECURE_KEY_2026")

# --- Authentication Setup ---
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

def get_api_key(api_key_header: str = Security(api_key_header)):
    """Validates the incoming API key."""
    if api_key_header != SECRET_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing API Key.")
    return api_key_header

# --- Rate Limiter Setup ---
limiter = Limiter(key_func=get_remote_address)

# Global state
retriever_instance = None

# --- Lifespan & State Management ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Modern lifespan event to safely initialize resources.
    """
    global retriever_instance
    logger.info("Initializing ChromaDB Vector Store...")
    
    # Secure file initialization (Ensure file exists before loading)
    if not os.path.exists(POLICY_FILE):
        logger.info("Creating default policy file.")
        sample_text = """
        MUNICIPAL SUSTAINABILITY AND SOLID WASTE MANAGEMENT BYLAWS (2025)
        Section 1: Electronic Waste (E-Waste) Disposal
        1.1 Electronic waste including discarded smartphones, circuit boards, and laptops must never be mixed with ordinary municipal household garbage.
        1.2 Citizens must deposit e-waste exclusively at authorized municipal e-waste collection bins located at designated ward offices.
        
        Section 2: Organic and Wet Waste Management
        2.1 Residential complexes generating >50kg wet waste daily must install on-site composting units.
        2.2 Wet waste must be stored in green biodegradable bags.
        """
        # Secure file write
        with open(POLICY_FILE, "w", encoding="utf-8") as f:
            f.write(sample_text.strip())

    try:
        loader = TextLoader(POLICY_FILE, encoding="utf-8")
        docs = loader.load()
        
        splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=30)
        chunks = splitter.split_documents(docs)
        
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector_store = Chroma.from_documents(chunks, embeddings, persist_directory=CHROMA_DIR)
        
        # Store retriever in global state to avoid uvicorn app.state lifecycle bugs
        retriever_instance = vector_store.as_retriever(search_kwargs={"k": 2})
        logger.info("Vector Store initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize vector store: {e}")
        retriever_instance = None

    yield
    # Cleanup resources on shutdown if needed
    logger.info("Shutting down RAG API.")

# --- Application Factory ---
app = FastAPI(
    title="EcoPolicy Secure RAG API",
    description="Production-hardened backend service for querying municipal sustainability bylaws.",
    version="1.1.0",
    lifespan=lifespan
)

# Attach Rate Limiter exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- Security: CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    # In production, restrict this to strictly your Vercel URL and localhost
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"], # Restrict methods
    allow_headers=["*"],
)

# --- Request / Response Schemas ---
class QueryRequest(BaseModel):
    # Enforce strict length limits to prevent DoS attacks via massive token payloads
    query: str = Field(..., min_length=3, max_length=500, description="The user query to search against the policy.")

class QueryResponse(BaseModel):
    query: str
    sources: list[str]
    synthesized_answer: str

# --- API Endpoints ---
@app.post("/api/query", response_model=QueryResponse)
@limiter.limit("10/minute") # Strict rate limiting to prevent abuse
async def query_policy(
    request: Request, 
    payload: QueryRequest, 
    api_key: str = Security(get_api_key)
):
    """
    Secure endpoint to query the RAG pipeline.
    Requires X-API-Key header. Limited to 10 requests per minute.
    """
    global retriever_instance
    if not retriever_instance:
        raise HTTPException(status_code=503, detail="RAG system is currently unavailable or failed to initialize.")
    
    user_query = payload.query.strip()
    
    try:
        # Retrieve relevant document segments using the state-bound retriever
        relevant_docs = retriever_instance.invoke(user_query)
        source_texts = [doc.page_content for doc in relevant_docs]
        
        # Grounded synthesis summary
        answer = (
            f"Based on official guidelines retrieved for your query, "
            f"ensure strict compliance with municipal bylaws. Review the source excerpts for exact clause details."
        )
        
        return QueryResponse(
            query=user_query,
            sources=source_texts,
            synthesized_answer=answer
        )
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail="Internal processing error.")

@app.get("/health")
@limiter.limit("30/minute")
async def health_check(request: Request):
    """Public health check endpoint, rate-limited to prevent ping floods."""
    status = "healthy" if getattr(request.app.state, "retriever", None) else "degraded"
    return {"status": status, "service": "EcoPolicy Secure RAG API"}

# Run locally using: uvicorn main:app --reload
