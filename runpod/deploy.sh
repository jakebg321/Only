#!/bin/bash

echo "================================"
echo "RunPod Deployment Script"
echo "================================"

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Configuration
DOCKER_IMAGE="fooocus-worker"
DOCKER_TAG="latest"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"  # Set this to your registry if using one

# Build the Docker image
echo ""
echo "Building Docker image..."
docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker image built successfully"

# Tag for registry if specified
if [ ! -z "$DOCKER_REGISTRY" ]; then
    echo ""
    echo "Tagging for registry: $DOCKER_REGISTRY"
    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
    
    echo "Pushing to registry..."
    docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
    
    if [ $? -eq 0 ]; then
        echo "✅ Image pushed to registry"
    else
        echo "❌ Failed to push to registry"
        exit 1
    fi
fi

echo ""
echo "================================"
echo "Deployment Instructions for RunPod:"
echo "================================"
echo ""
echo "1. Go to RunPod Dashboard (https://runpod.io)"
echo ""
echo "2. Create a new Pod or Serverless Endpoint with:"
echo "   - GPU: RTX 3090 or better (24GB VRAM recommended)"
echo "   - Container Image: ${DOCKER_REGISTRY:+${DOCKER_REGISTRY}/}${DOCKER_IMAGE}:${DOCKER_TAG}"
echo "   - Container Disk: 50GB minimum"
echo "   - Volume: Mount your models at /workspace/models"
echo ""
echo "3. Set Environment Variables:"
echo "   - NEXTJS_API_URL=https://your-app.vercel.app"
echo "   - API_KEY=your-secret-key (if using authentication)"
echo "   - WORKER_ID=runpod-001"
echo "   - POLL_INTERVAL=5"
echo ""
echo "4. For Persistent Storage (recommended):"
echo "   - Create a Network Volume for models"
echo "   - Mount at: /workspace/models"
echo "   - Upload your models:"
echo "     - checkpoints/juggernautXL_v8Rundiffusion.safetensors"
echo "     - checkpoints/realisticStockPhoto_v20.safetensors"
echo "     - loras/remy.safetensors"
echo "     - loras/RealVisXL_V5.0_fp32.safetensors"
echo "     - loras/super-realism.safetensors"
echo ""
echo "5. Start the Pod and check logs for:"
echo "   'RunPod Worker runpod-001 started'"
echo "   'Polling https://your-app.vercel.app/api/generate/queue'"
echo ""
echo "================================"

# Create a deployment config file for reference
cat > runpod-config.json <<EOF
{
  "name": "fooocus-worker",
  "imageName": "${DOCKER_REGISTRY:+${DOCKER_REGISTRY}/}${DOCKER_IMAGE}:${DOCKER_TAG}",
  "gpu": "RTX 3090",
  "minMemoryInGb": 24,
  "minVcpuCount": 4,
  "containerDiskInGb": 50,
  "volumeMounts": [
    {
      "name": "models",
      "mountPath": "/workspace/models"
    }
  ],
  "env": [
    {
      "key": "NEXTJS_API_URL",
      "value": "https://your-app.vercel.app"
    },
    {
      "key": "API_KEY",
      "value": "your-secret-key"
    },
    {
      "key": "WORKER_ID",
      "value": "runpod-001"
    },
    {
      "key": "POLL_INTERVAL",
      "value": "5"
    }
  ]
}
EOF

echo ""
echo "✅ RunPod configuration saved to: runpod-config.json"
echo ""
echo "For local testing with your Next.js app:"
echo "  docker run -it --rm --gpus all \\"
echo "    -e NEXTJS_API_URL=http://host.docker.internal:3000 \\"
echo "    -e WORKER_ID=local-test \\"
echo "    -v /path/to/models:/workspace/models \\"
echo "    ${DOCKER_IMAGE}:${DOCKER_TAG}"