"""
Local Windows Worker for Processing Queue
Works with your local Fooocus installation
"""

import os
import sys
import time
import json
import base64
import requests
from typing import Optional, Dict, Any
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
NEXTJS_API_URL = 'https://iq-4ru0.onrender.com'
POLL_INTERVAL = 5
WORKER_ID = 'local-windows'

# Windows paths to your Fooocus
FOOOCUS_PATH = r'C:\Users\pc\vscode\Only\ai-content-platform\Fooocus'
sys.path.append(FOOOCUS_PATH)
os.chdir(FOOOCUS_PATH)

class LocalWorker:
    def __init__(self):
        self.session = requests.Session()
        
        # Import Fooocus modules
        import modules.config as config
        import modules.flags as flags
        import modules.async_worker as worker
        from modules.async_worker import AsyncTask
        
        self.config = config
        self.flags = flags
        self.worker = worker
        self.AsyncTask = AsyncTask
        
        # Update configs
        self.config.update_files()
        logger.info(f"Loaded {len(self.config.model_filenames)} models, {len(self.config.lora_filenames)} LoRAs")
    
    def poll_queue(self) -> Optional[Dict[str, Any]]:
        """Poll Render API for pending requests"""
        try:
            response = self.session.get(f"{NEXTJS_API_URL}/api/generate/queue")
            if response.status_code == 200:
                data = response.json()
                # Find first pending request
                for request in data.get('queue', []):
                    if request['status'] == 'pending':
                        return request
        except Exception as e:
            logger.error(f"Error polling queue: {e}")
        return None
    
    def update_status(self, request_id: int, status: str, result: Optional[Dict] = None):
        """Update request status in Render"""
        try:
            payload = {
                'requestId': request_id,
                'status': status,
                'workerId': WORKER_ID
            }
            if result:
                payload['result'] = result
            
            response = self.session.post(
                f"{NEXTJS_API_URL}/api/generate/update",
                json=payload
            )
            if response.status_code == 200:
                logger.info(f"Updated request {request_id} to {status}")
            else:
                logger.error(f"Failed to update status: {response.text}")
        except Exception as e:
            logger.error(f"Error updating status: {e}")
    
    def generate_image(self, prompt: str, request_id: int) -> Optional[str]:
        """Generate image using your exact Fooocus setup"""
        logger.info(f"Generating for request {request_id}: {prompt[:50]}...")
        
        # Build control parameters (YOUR EXACT SETUP)
        ctrls = []
        
        # Basic parameters
        ctrls.append(None)  # currentTask
        ctrls.append(False)  # generate_image_grid
        ctrls.append(prompt)  # prompt
        ctrls.append("")  # negative_prompt
        ctrls.append(["Fooocus V2", "Fooocus Enhance", "Fooocus Sharp"])  # styles
        ctrls.append("Quality")  # performance
        ctrls.append("896×1152")  # aspect_ratio (× not *)
        ctrls.append(1)  # image_number
        ctrls.append("png")  # output_format
        ctrls.append(-1)  # random seed
        ctrls.append(False)  # read_wildcards_in_order
        ctrls.append(2.0)  # sharpness
        ctrls.append(4.0)  # guidance_scale
        
        # Models
        ctrls.append("juggernautXL_v8Rundiffusion.safetensors")
        ctrls.append("realisticStockPhoto_v20.safetensors")
        ctrls.append(0.6)
        
        # YOUR EXACT LoRAs
        # LoRA 1: remy
        ctrls.append(True)
        ctrls.append("remy.safetensors")
        ctrls.append(0.94)
        
        # LoRA 2: RealVisXL
        ctrls.append(True)
        ctrls.append("RealVisXL_V5.0_fp32.safetensors")
        ctrls.append(0.6)
        
        # LoRA 3: super-realism
        ctrls.append(True)
        ctrls.append("super-realism.safetensors")
        ctrls.append(0.69)
        
        # Empty LoRA slots
        for _ in range(2):
            ctrls.append(False)
            ctrls.append("None")
            ctrls.append(1.0)
        
        # Rest of parameters (matching api_exact.py)
        ctrls.append(False)  # input_image_checkbox
        ctrls.append('uov_tab')
        ctrls.append(self.flags.disabled)
        ctrls.append(None)
        
        ctrls.extend([[], None, "", None])  # Outpaint/Inpaint
        ctrls.extend([False, False, False, False])  # Display settings
        ctrls.extend([1.5, 0.8, 0.3, 7.0, 2])  # ADM settings
        ctrls.extend(["dpmpp_2m_sde_gpu", "karras", self.flags.default_vae])  # Sampler
        ctrls.extend([-1] * 6)  # Overwrite settings
        ctrls.extend([False, False])  # Mixing
        ctrls.extend([False, False, 64, 128])  # ControlNet
        ctrls.extend(['joint', 0.25])  # Refiner
        ctrls.extend([False, 1.01, 1.02, 0.99, 0.95])  # FreeU
        ctrls.extend([False, False, 'v2.6', 1.0, 0.618, False, False, 0])  # Inpaint
        ctrls.extend([False, False, 'fooocus'])  # Save settings
        
        # IP ControlNet (4 sets)
        for _ in range(4):
            ctrls.extend([None, 0.6, 0.5, self.flags.default_ip])
        
        # DINO/Enhance
        ctrls.extend([False, 0, False, None, False, self.flags.disabled, 
                      self.flags.enhancement_uov_before, self.flags.enhancement_uov_prompt_type_original])
        
        # Enhance tabs (3 sets)
        for _ in range(3):
            ctrls.extend([False, "", "", "", 'u2net', 'full', 'vit_b', 
                          0.3, 0.25, 10, self.flags.inpaint_option_default, 
                          False, 'v2.6', 1.0, 0.618, 0, False])
        
        # Remove currentTask
        ctrls.pop(0)
        
        # Create and queue task
        task = self.AsyncTask(args=ctrls)
        self.worker.async_tasks.append(task)
        
        # Wait for completion
        timeout = 180
        start = time.time()
        
        while time.time() - start < timeout:
            time.sleep(0.1)
            
            while len(task.yields) > 0:
                flag, product = task.yields.pop(0)
                if flag == 'preview':
                    percentage, title, _ = product
                    logger.info(f"Progress: {percentage}% - {title}")
                    self.update_status(request_id, 'processing', {
                        'progress': percentage,
                        'message': title
                    })
                elif flag == 'finish':
                    logger.info(f"Generation complete: {product}")
                    # Product is a list, return first image path
                    if isinstance(product, list) and len(product) > 0:
                        return product[0]
                    return product
            
            if len(task.results) > 0:
                logger.info(f"Generation complete: {task.results}")
                # Results is a list, return first image path
                if isinstance(task.results, list) and len(task.results) > 0:
                    return task.results[0]
                return task.results[0] if task.results else None
        
        logger.error("Generation timed out")
        return None
    
    def encode_image_base64(self, image_path: str) -> Optional[str]:
        """Encode image file to base64"""
        try:
            # Handle list input (from Fooocus)
            if isinstance(image_path, list):
                image_path = image_path[0] if image_path else None
            
            if not image_path:
                return None
            
            # Convert to Windows path if needed
            if image_path.startswith('/'):
                # Convert Linux path to Windows
                image_path = image_path.replace('/', '\\')
                if not os.path.isabs(image_path):
                    image_path = os.path.join(FOOOCUS_PATH, image_path.lstrip('\\'))
            
            with open(image_path, 'rb') as f:
                return base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image: {e}")
            return None
    
    def process_request(self, request: Dict[str, Any]):
        """Process a single generation request"""
        request_id = request['id']
        prompt = request['prompt']
        
        logger.info(f"Processing request {request_id} from {request.get('userName', 'Unknown')}")
        logger.info(f"Prompt: {prompt}")
        
        # Update status to processing
        self.update_status(request_id, 'processing')
        
        try:
            # Generate image
            image_path = self.generate_image(prompt, request_id)
            
            if image_path:
                # Encode image to base64
                image_data = self.encode_image_base64(image_path)
                
                if image_data:
                    # Send result back
                    self.update_status(request_id, 'completed', {
                        'imageData': image_data,  # Send full base64 data
                        'imagePath': str(image_path),
                        'timestamp': time.time()
                    })
                    logger.info(f"✅ Request {request_id} completed successfully!")
                    logger.info(f"   Image saved at: {image_path}")
                else:
                    self.update_status(request_id, 'failed', {
                        'error': 'Failed to encode image'
                    })
            else:
                self.update_status(request_id, 'failed', {
                    'error': 'Generation failed or timed out'
                })
        except Exception as e:
            logger.error(f"Error processing request {request_id}: {e}")
            self.update_status(request_id, 'failed', {
                'error': str(e)
            })
    
    def run(self):
        """Main worker loop"""
        print("\n" + "="*60)
        print("LOCAL WINDOWS WORKER FOR RENDER QUEUE")
        print("="*60)
        print(f"Polling: {NEXTJS_API_URL}/api/generate/queue")
        print(f"Worker ID: {WORKER_ID}")
        print(f"Fooocus Path: {FOOOCUS_PATH}")
        print("="*60 + "\n")
        
        while True:
            try:
                # Poll for pending requests
                request = self.poll_queue()
                
                if request:
                    print(f"\n🎨 Found pending request!")
                    self.process_request(request)
                else:
                    print(".", end="", flush=True)
                    time.sleep(POLL_INTERVAL)
                    
            except KeyboardInterrupt:
                print("\n\n🛑 Worker stopped by user")
                break
            except Exception as e:
                logger.error(f"Worker error: {e}")
                time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    print("Starting local Windows worker...")
    print("This will process your Render queue using local Fooocus")
    print("Press Ctrl+C to stop\n")
    
    worker = LocalWorker()
    worker.run()