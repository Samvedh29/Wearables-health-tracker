# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:22-slim AS frontend-builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app/frontend
# Copy package.json and lockfile
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy frontend source code and build
COPY frontend/ ./
ENV VITE_API_URL=""
RUN pnpm run build

# ==========================================
# Stage 2: Build the FastAPI Backend
# ==========================================
FROM python:3.13-slim

# Install uv for fast dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install git if needed by any dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the backend project files
COPY backend/pyproject.toml backend/uv.lock ./
COPY backend/ ./

# Install python dependencies globally within the container
RUN uv pip install --system -r pyproject.toml

# Copy the built frontend static files from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/app/static/frontend

# Hugging Face Spaces exposes port 7860
ENV API_PORT=7860
EXPOSE 7860

# Set environment variables
ENV ENVIRONMENT=production
ENV CORS_ALLOW_ALL=True

# Command to run the application (Hugging Face expects the service on 0.0.0.0:7860)
CMD ["uvicorn", "app.main:api", "--host", "0.0.0.0", "--port", "7860"]
