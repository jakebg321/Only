# Quick Fix for RunPod CUDA Error

## The Problem:
The container wants CUDA 12.8 but the GPU driver only supports older CUDA versions.

## Quick Solution - Use Pre-built Image:

Instead of building from your GitHub, use this in the **Container Image** field:

### Option 1: Older CUDA (Most Compatible)
```
runpod/pytorch:2.0.1-py3.10-cuda11.8.0-devel-ubuntu22.04
```

### Option 2: Try TheBloke's SD Image
```
thebloke/fooocus:latest
```

### Option 3: Official Fooocus
```
ghcr.io/lllyasviel/fooocus:latest
```

## Then in Docker Command:
```bash
bash -c "apt update && apt install -y git wget && cd /workspace && git clone https://github.com/jakebg321/ai-content-platform.git && cd ai-content-platform && pip install requests && cd runpod && python runpod_worker.py"
```

## Environment Variables (Set these!):
```
NEXTJS_API_URL=https://iq-4ru0.onrender.com
WORKER_ID=runpod-001
POLL_INTERVAL=5
```

This bypasses the Docker build and just clones your code directly!