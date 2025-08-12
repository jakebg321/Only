"""
RunPod Serverless Handler for Fooocus Worker
"""

import runpod
import os
import sys
import time
import base64
import json
import requests

# Add Fooocus to path
sys.path.append('/workspace/Fooocus')
os.chdir('/workspace/Fooocus')

# Import Fooocus modules
import modules.config as config
import modules.flags as flags
import modules.async_worker as worker
from modules.async_worker import AsyncTask

# Initialize Fooocus
config.paths_checkpoints = ['/workspace/models/checkpoints']
config.paths_loras = ['/workspace/models/loras']
config.update_files()

print(f"Loaded {len(config.model_filenames)} models, {len(config.lora_filenames)} LoRAs")

def generate_image(prompt, parameters=None):
    """Generate image using Fooocus"""
    if parameters is None:
        parameters = {}
    
    # Build control parameters (matching your exact setup)
    ctrls = []
    
    # Basic parameters
    ctrls.append(None)  # currentTask
    ctrls.append(False)  # generate_image_grid
    ctrls.append(prompt)  # prompt
    ctrls.append(parameters.get('negative_prompt', ''))
    ctrls.append(parameters.get('styles', ["Fooocus V2", "Fooocus Enhance", "Fooocus Sharp"]))
    ctrls.append(parameters.get('performance', 'Quality'))
    ctrls.append(parameters.get('resolution', '896×1152'))
    ctrls.append(1)  # image_number
    ctrls.append('png')  # output_format
    ctrls.append(parameters.get('seed', -1))
    ctrls.append(False)  # read_wildcards_in_order
    ctrls.append(2.0)  # sharpness
    ctrls.append(4.0)  # guidance_scale
    
    # Models
    ctrls.append('juggernautXL_v8Rundiffusion.safetensors')
    ctrls.append('realisticStockPhoto_v20.safetensors')
    ctrls.append(0.6)
    
    # Your exact LoRA configuration
    ctrls.append(True)
    ctrls.append('remy.safetensors')
    ctrls.append(0.94)
    
    ctrls.append(True)
    ctrls.append('RealVisXL_V5.0_fp32.safetensors')
    ctrls.append(0.6)
    
    ctrls.append(True)
    ctrls.append('super-realism.safetensors')
    ctrls.append(0.69)
    
    # Empty LoRA slots
    for _ in range(2):
        ctrls.append(False)
        ctrls.append('None')
        ctrls.append(1.0)
    
    # Add all remaining parameters (simplified for brevity)
    # Image input
    ctrls.append(False)  # input_image_checkbox
    ctrls.append('uov_tab')
    ctrls.append(flags.disabled)
    ctrls.append(None)
    
    # Outpaint/Inpaint
    ctrls.extend([[], None, "", None])
    
    # Display settings
    ctrls.extend([False, False, False, False])
    
    # ADM settings
    ctrls.extend([1.5, 0.8, 0.3, 7.0, 2])
    
    # Sampler
    ctrls.extend(['dpmpp_2m_sde_gpu', 'karras', flags.default_vae])
    
    # Overwrite settings
    ctrls.extend([-1] * 6)
    
    # Mixing
    ctrls.extend([False, False])
    
    # ControlNet
    ctrls.extend([False, False, 64, 128])
    
    # Refiner
    ctrls.extend(['joint', 0.25])
    
    # FreeU
    ctrls.extend([False, 1.01, 1.02, 0.99, 0.95])
    
    # Inpaint
    ctrls.extend([False, False, 'v2.6', 1.0, 0.618, False, False, 0])
    
    # Save
    ctrls.extend([False, False, 'fooocus'])
    
    # IP ControlNet (4 sets)
    for _ in range(4):
        ctrls.extend([None, 0.6, 0.5, flags.default_ip])
    
    # DINO/Enhance
    ctrls.extend([False, 0, False, None, False, flags.disabled, 
                  flags.enhancement_uov_before, flags.enhancement_uov_prompt_type_original])
    
    # Enhance tabs (3 sets)
    for _ in range(3):
        ctrls.extend([False, "", "", "", 'u2net', 'full', 'vit_b', 
                      0.3, 0.25, 10, flags.inpaint_option_default, 
                      False, 'v2.6', 1.0, 0.618, 0, False])
    
    # Remove currentTask
    ctrls.pop(0)
    
    # Create and queue task
    task = AsyncTask(args=ctrls)
    worker.async_tasks.append(task)
    
    # Wait for completion
    timeout = 120
    start = time.time()
    
    while time.time() - start < timeout:
        time.sleep(0.1)
        
        while len(task.yields) > 0:
            flag, product = task.yields.pop(0)
            if flag == 'finish':
                return product
        
        if len(task.results) > 0:
            return task.results[0] if task.results else None
    
    return None

def handler(job):
    """
    RunPod serverless handler
    
    Expected input format:
    {
        "input": {
            "prompt": "your prompt here",
            "request_id": "optional-id",
            "performance": "Quality",
            "seed": -1
        }
    }
    """
    try:
        job_input = job["input"]
        prompt = job_input.get("prompt", "a beautiful landscape")
        request_id = job_input.get("request_id", f"runpod-{time.time()}")
        
        print(f"Processing request {request_id}: {prompt[:50]}...")
        
        # Generate image
        image_path = generate_image(prompt, job_input)
        
        if image_path:
            # Read and encode image
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            
            # If Next.js URL is provided, update the queue
            nextjs_url = os.getenv('NEXTJS_API_URL')
            if nextjs_url and request_id != "manual":
                try:
                    requests.post(
                        f"{nextjs_url}/api/generate/update",
                        json={
                            "requestId": request_id,
                            "status": "completed",
                            "workerId": os.getenv('WORKER_ID', 'runpod-serverless'),
                            "result": {
                                "imageData": image_data,
                                "imagePath": image_path
                            }
                        }
                    )
                except:
                    pass  # Don't fail if callback fails
            
            return {
                "success": True,
                "request_id": request_id,
                "image_path": image_path,
                "image_data": image_data[:100] + "..."  # Truncate for logging
            }
        else:
            return {
                "success": False,
                "request_id": request_id,
                "error": "Image generation failed"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# RunPod serverless entry point
runpod.serverless.start({"handler": handler})