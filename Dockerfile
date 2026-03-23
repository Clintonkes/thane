# ===================================================================
# Thanesgaylerental API - Dockerfile for Railway Deployment
# ===================================================================
# This Dockerfile builds the Python FastAPI backend for deployment
# on Railway.app platform.
#
# Build: docker build -t thanesgaylerental-api .
# Run:   docker run -p 8000:8000 thanesgaylerental-api
# ===================================================================

# Use Python 3.11 as base image (latest stable)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV ENVIRONMENT=production

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port Railway will use
EXPOSE 8000

# Health check endpoint (Railway handles this based on railway.json)
# But we can keep an internal one for Docker if needed
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests, os; port = os.getenv('PORT', '8000'); requests.get(f'http://localhost:{port}/api/health')" || exit 1

# Run the application
# Railway automatically sets the PORT environment variable
# Use shell form to allow environment variable expansion
CMD python -m uvicorn api.main:app --host 0.0.0.0 --port $PORT


# ===================================================================
# Railway Deployment Notes:
# ===================================================================
# 1. Set the following Environment Variables in Railway:
#    - DATABASE_URL: PostgreSQL connection string
#      (e.g., postgres://user:password@host:5432/dbname)
#    - ALLOWED_ORIGINS: Comma-separated list of allowed origins
#    - ENVIRONMENT: production
#
# 2. Add a PostgreSQL database in Railway dashboard
#
# 3. For the Next.js frontend, deploy separately or add to this
#    Dockerfile with multi-stage build
#
# 4. Build Command (Railway automatically runs):
#    docker build -t thanesgaylerental .
#
# 5. Start Command:
#    python -m uvicorn api.main:app --host 0.0.0.0 --port $PORT
# ===================================================================
