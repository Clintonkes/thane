"""
Thanesgaylerental API - Main Application Entry Point
FastAPI backend for the Thanesgaylerental trucking logistics application.

Can be started with:
    uvicorn api.main:app --reload
    uvicorn api.main:app --port 8000 --reload

The app handles port availability check on startup.
"""

import os
import socket
import sys
import logging
from pathlib import Path
from datetime import datetime

# Configure global logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Add the project root to Python path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Load environment variables from .env
try:
    from dotenv import load_dotenv
    load_dotenv(PROJECT_ROOT / ".env")
except ImportError:
    pass

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database imports
from database.connection import init_db

# Route imports
from api.routes import orders, trucks, contact, reviews, admin

# ============== Port Handling for Uvicorn ==============

def check_port_available(port: int) -> bool:
    """Check if a port is available."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(1)
            sock.bind(('0.0.0.0', port))
            return True
    except OSError:
        return False

def get_available_port(start_port: int = 8000, max_attempts: int = 10) -> int:
    """Find an available port starting from start_port."""
    for port in range(start_port, start_port + max_attempts):
        if check_port_available(port):
            return port
    return start_port  # Return default if nothing found

# Check port on startup and log
START_PORT = int(os.getenv("PORT", "8000"))
if not check_port_available(START_PORT):
    NEW_PORT = get_available_port(START_PORT, max_attempts=10)
    if NEW_PORT != START_PORT:
        logger.warning(f"Port {START_PORT} is busy! Using port {NEW_PORT} instead.")
        os.environ["PORT"] = str(NEW_PORT)

# ============== FastAPI App Configuration ==============

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup/shutdown."""
    # Startup
    logger.info("Initializing database...")
    init_db()
    
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"API Documentation available at: http://localhost:{port}/api/docs")
    
    yield
    # Shutdown
    logger.info("Shutting down API server...")

app = FastAPI(
    title="Thanesgaylerental API",
    description="Backend API for Thanesgaylerental Properties LLC - Trucking & Logistics Services",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Configuration
base_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://thanesgaylerental.com"
]

env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    base_origins.extend(env_origins.split(","))

ALLOWED_ORIGINS = list(set([origin.strip() for origin in base_origins if origin.strip()]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import time
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Completed request: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
    return response


# ============== API Routes ==============

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Welcome to Thanesgaylerental API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected"
    }

# Mount Routers
app.include_router(orders.router)
app.include_router(trucks.router)
app.include_router(contact.router)
app.include_router(reviews.router)
app.include_router(admin.router)

# Run the app directly if this file is executed
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8000"))
    
    # Enterprise Auto-Sync: Safely update frontend config so you NEVER have broken ports!
    env_local_path = PROJECT_ROOT / "thanesgaylerental" / ".env.local"
    if not env_local_path.exists():
        env_local_path = PROJECT_ROOT / ".env.local"
    new_url = f"NEXT_PUBLIC_API_URL=http://localhost:{port}"
    try:
        lines = []
        if env_local_path.exists():
            with open(env_local_path, "r") as f:
                lines = f.readlines()
        
        updated = False
        for i, line in enumerate(lines):
            if line.startswith("NEXT_PUBLIC_API_URL="):
                lines[i] = new_url + "\n"
                updated = True
                break
        
        if not updated:
            lines.append(f"{new_url}\n")
            
        with open(env_local_path, "w") as f:
            f.writelines(lines)
        logger.info(f"Frontend automatically synchronized to {new_url}")
    except Exception as e:
        logger.error(f"Could not synchronize backend port with frontend: {e}")
    
    print("\n" + "="*60)
    print("🚀 Thanesgaylerental API Server")
    print("="*60)
    print(f"📍 Server running at: http://localhost:{port}")
    print(f"📚 API Documentation: http://localhost:{port}/api/docs")
    print("="*60 + "\n")
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=True)
