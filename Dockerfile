# ===================================================================
# Thanesgaylerental API - Dockerfile for Railway Deployment
# ===================================================================
# This Dockerfile builds the Python FastAPI backend for deployment
# on Railway.app platform.
#
# Build: docker build -t thanesgaylerental-api .
# Run:   docker run -p 8000:8000 thanesgaylerental-api
# ===================================================================

# Stage 1: Build the Next.js frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Final image with Python backend and static frontend
FROM python:3.11-slim
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV ENVIRONMENT=production

# Install system dependencies for psycopg2 and healthcheck
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code (including backend)
COPY . .

# Copy the built frontend from Stage 1
COPY --from=frontend-builder /app/out ./out

# Expose the port Railway will use
EXPOSE 8000

# Health check endpoint
# Use curl for more reliability in slim image
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Run the application
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
