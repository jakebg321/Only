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
    libgoogle-perftools4 \
    libtcmalloc-minimal4 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Clone Fooocus
RUN git clone https://github.com/lllyasviel/Fooocus.git /workspace/Fooocus

# Install Python dependencies
WORKDIR /workspace/Fooocus
RUN pip install --no-cache-dir \
    torch==2.1.0 torchvision==0.16.0 torchaudio==2.1.0 --index-url https://download.pytorch.org/whl/cu118
RUN pip install --no-cache-dir \
    -r requirements_versions.txt

# Install additional dependencies for worker
RUN pip install --no-cache-dir \
    requests \
    python-dotenv

# Copy worker scripts
COPY runpod_worker.py /workspace/
COPY api_runpod.py /workspace/Fooocus/
COPY start.sh /workspace/

# Make start script executable
RUN chmod +x /workspace/start.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
ENV MODELS_PATH=/workspace/models

# Create model directories
RUN mkdir -p /workspace/models/checkpoints \
    /workspace/models/loras \
    /workspace/models/vae \
    /workspace/models/embeddings \
    /workspace/models/controlnet

# Download base models (optional - can mount from volume instead)
# Uncomment these if you want models baked into the image
# RUN wget -O /workspace/models/checkpoints/juggernautXL_v8Rundiffusion.safetensors \
#     https://huggingface.co/RunDiffusion/Juggernaut-XL-v8/resolve/main/juggernautXL_v8Rundiffusion.safetensors
# RUN wget -O /workspace/models/checkpoints/realisticStockPhoto_v20.safetensors \
#     https://civitai.com/api/download/models/361593

# Entry point
ENTRYPOINT ["/workspace/start.sh"]