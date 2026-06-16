#!/bin/bash
set -e

# Start FastAPI backend in the background on port 8000
cd /app
uvicorn app.main:api --host 127.0.0.1 --port 8000 &

# Wait for FastAPI to boot
sleep 3

# Start the TanStack Start (Nitro) SSR server on the Hugging Face exposed port.
# Nitro resolves static assets at ../public relative to server/index.mjs,
# i.e. /app/frontend/.output/public — which is now correctly copied in Dockerfile.
export PORT=7860
export HOST=0.0.0.0
node /app/frontend/.output/server/index.mjs
