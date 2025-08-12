# RunPod Fooocus Worker

This directory contains the RunPod deployment for processing image generation requests from your Next.js application.

## Architecture

```
Next.js App (Vercel) → Queue API → RunPod Worker → Fooocus → Generated Images
```

## Files

- `runpod_worker.py` - Main worker that polls your Next.js queue
- `api_runpod.py` - Fooocus API adapted for Linux/RunPod paths
- `Dockerfile` - Container definition for RunPod
- `start.sh` - Startup script for the worker
- `deploy.sh` - Deployment helper script
- `.env.example` - Environment variable template

## Quick Start

### 1. Local Testing

```bash
# Install Fooocus locally first
cd ai-content-platform
git clone https://github.com/lllyasviel/Fooocus.git

# Copy your models to test locally
mkdir -p models/checkpoints models/loras
# Copy your .safetensors files here

# Test the worker locally
cd runpod
python runpod_worker.py
```

### 2. Deploy to RunPod

```bash
# Build Docker image
cd runpod
./deploy.sh

# This will create a Docker image and provide deployment instructions
```

### 3. Configure RunPod

1. Go to [RunPod Dashboard](https://runpod.io)
2. Create a new Pod with:
   - **GPU**: RTX 3090 or better (24GB VRAM)
   - **Container**: Your Docker image
   - **Disk**: 50GB minimum
   - **Network Volume**: For persistent model storage

3. Set environment variables:
```env
NEXTJS_API_URL=https://your-app.vercel.app
API_KEY=your-secret-key
WORKER_ID=runpod-001
POLL_INTERVAL=5
```

4. Upload models to volume:
```
/workspace/models/
├── checkpoints/
│   ├── juggernautXL_v8Rundiffusion.safetensors
│   └── realisticStockPhoto_v20.safetensors
└── loras/
    ├── remy.safetensors
    ├── RealVisXL_V5.0_fp32.safetensors
    └── super-realism.safetensors
```

## API Endpoints

Your Next.js app provides these endpoints:

### POST /api/generate
Submit a new generation request
```json
{
  "prompt": "remy in blue bikini",
  "userId": "user123",
  "userName": "John Doe"
}
```

### GET /api/generate/queue
Get all queued requests
```json
{
  "queue": [...],
  "stats": {
    "pending": 2,
    "processing": 1,
    "completed": 5
  }
}
```

### POST /api/generate/update
Update request status (called by worker)
```json
{
  "requestId": 123456,
  "status": "completed",
  "result": {
    "imageData": "base64...",
    "imagePath": "/path/to/image.png"
  }
}
```

## Worker Flow

1. **Poll Queue**: Worker checks `/api/generate/queue` every 5 seconds
2. **Find Pending**: Picks up first request with `status: "pending"`
3. **Update Status**: Sets to `"processing"` via `/api/generate/update`
4. **Generate Image**: Uses Fooocus with your exact LoRA configuration
5. **Return Result**: Updates to `"completed"` with base64 image data

## Customization

### Modify Generation Parameters

Edit `runpod_worker.py` lines 82-104 to change:
- LoRA models and weights
- Resolution (default: 896×1152)
- Quality mode (Speed/Quality)
- Styles and effects

### Change Polling Interval

Set `POLL_INTERVAL` environment variable (in seconds)

### Add Authentication

Set `API_KEY` in environment and your Next.js app will validate it

## Monitoring

Check RunPod logs for:
```
[Queue 12345] Generating: remy in blue bikini...
[Queue 12345] 30% - Sampling...
[Queue 12345] 60% - Refining...
[Queue 12345] ✓ Generation complete!
```

## Troubleshooting

### Models Not Found
```bash
# Check model paths
ls -la /workspace/models/checkpoints/
ls -la /workspace/models/loras/

# Verify in Python
python -c "import sys; sys.path.append('/workspace/Fooocus'); import modules.config; modules.config.update_files(); print(modules.config.model_filenames)"
```

### Worker Not Polling
- Check `NEXTJS_API_URL` is correct
- Verify your Next.js app is deployed and accessible
- Check RunPod logs for connection errors

### Generation Fails
- Ensure GPU has enough VRAM (24GB recommended)
- Check that all LoRA files exist
- Verify model compatibility with SDXL

## Performance

- **Speed Mode**: ~30 seconds per image (30 steps)
- **Quality Mode**: ~60 seconds per image (60 steps)
- **GPU**: RTX 3090 or better recommended
- **Concurrent**: 1 image at a time per worker

## Scaling

To handle more requests:
1. Deploy multiple RunPod instances
2. Each with unique `WORKER_ID`
3. They'll process queue in parallel

## Cost Optimization

- Use RunPod Serverless for on-demand processing
- Set auto-shutdown after idle time
- Use spot instances for non-critical workloads
- Cache generated images to avoid regeneration