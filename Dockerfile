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

# Copy Node.js binary so we can run the TanStack SSR server
COPY --from=frontend-builder /usr/local/bin/node /usr/local/bin/node

# Copy built frontend assets
# - /app/frontend/.output/public  → where Nitro server looks for static files (../public from server/)
# - /app/app/static/frontend      → where FastAPI serves static files from (unused now but kept as fallback)
COPY --from=frontend-builder /app/frontend/.output/public /app/frontend/.output/public
COPY --from=frontend-builder /app/frontend/.output/public /app/app/static/frontend
COPY --from=frontend-builder /app/frontend/.output/server /app/frontend/.output/server

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Hugging Face Spaces exposes port 7860
ENV API_PORT=7860
EXPOSE 7860

# Set environment variables
ENV ENVIRONMENT=production
ENV CORS_ALLOW_ALL=True

# Command to run the application (start.sh runs FastAPI and Node server)
CMD ["/app/start.sh"]
