#!/bin/bash

echo "================================"
echo "RunPod Fooocus Worker Starting"
echo "================================"

# Set environment variables from RunPod
export NEXTJS_API_URL="${NEXTJS_API_URL:-https://your-app.vercel.app}"
export POLL_INTERVAL="${POLL_INTERVAL:-5}"
export WORKER_ID="${WORKER_ID:-runpod-$(hostname)}"
export API_KEY="${API_KEY:-}"
export MODELS_PATH="${MODELS_PATH:-/workspace/models}"
export FOOOCUS_PATH="${FOOOCUS_PATH:-/workspace/Fooocus}"

echo "Configuration:"
echo "  API URL: $NEXTJS_API_URL"
echo "  Worker ID: $WORKER_ID"
echo "  Poll Interval: ${POLL_INTERVAL}s"
echo "  Models Path: $MODELS_PATH"
echo "  Fooocus Path: $FOOOCUS_PATH"

# Check if models are mounted or need downloading
if [ ! -f "$MODELS_PATH/checkpoints/juggernautXL_v8Rundiffusion.safetensors" ]; then
    echo "⚠️  Base model not found. Please mount models volume or download manually."
fi

if [ ! -f "$MODELS_PATH/loras/remy.safetensors" ]; then
    echo "⚠️  LoRA models not found. Please mount models volume or download manually."
fi

# Create output directory
mkdir -p /workspace/outputs

# Start the worker
echo ""
echo "Starting worker process..."
cd /workspace
python runpod_worker.py