# RunPod Dockerfile for Fooocus Worker
FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04

# Set working directory
WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy entire project
COPY . /workspace/

# Install Fooocus dependencies
WORKDIR /workspace/Fooocus
RUN pip install --no-cache-dir -r requirements_versions.txt

# Install additional worker dependencies
RUN pip install --no-cache-dir \
    requests \
    python-dotenv \
    runpod

# Create model directories
RUN mkdir -p /workspace/models/checkpoints \
    /workspace/models/loras \
    /workspace/models/vae \
    /workspace/outputs

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512

# Make scripts executable
RUN chmod +x /workspace/runpod/start.sh

# Set working directory back to workspace
WORKDIR /workspace

# Entry point for RunPod serverless
CMD ["python", "-u", "handler.py"]