"""
RunPod Worker for Fooocus Image Generation
Polls Next.js queue and processes generation requests
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

# Configuration from environment
NEXTJS_API_URL = os.getenv('NEXTJS_API_URL', 'https://your-app.vercel.app')
POLL_INTERVAL = int(os.getenv('POLL_INTERVAL', '5'))
WORKER_ID = os.getenv('WORKER_ID', 'runpod-001')
API_KEY = os.getenv('API_KEY', '')  # Optional auth key

# Add Fooocus to path
FOOOCUS_PATH = os.getenv('FOOOCUS_PATH', '/workspace/Fooocus')
sys.path.append(FOOOCUS_PATH)
os.chdir(FOOOCUS_PATH)

class QueueProcessor:
    def __init__(self):
        self.session = requests.Session()
        if API_KEY:
            self.session.headers['Authorization'] = f'Bearer {API_KEY}'
        
        # Import Fooocus modules after path setup
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
        """Poll Next.js API for pending requests"""
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
        """Update request status in Next.js"""
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
        """Generate image using Fooocus API"""
        logger.info(f"Generating image for request {request_id}: {prompt[:50]}...")
        
        # Build control parameters (matching api_exact.py)
        ctrls = []
        
        # Basic parameters
        ctrls.append(None)  # currentTask
        ctrls.append(False)  # generate_image_grid
        ctrls.append(prompt)  # prompt
        ctrls.append("")  # negative_prompt
        ctrls.append(["Fooocus V2", "Fooocus Enhance", "Fooocus Sharp"])  # styles
        ctrls.append("Quality")  # performance
        ctrls.append("896×1152")  # aspect_ratio (note: × not *)
        ctrls.append(1)  # image_number
        ctrls.append("png")  # output_format
        ctrls.append(-1)  # random seed
        ctrls.append(False)  # read_wildcards_in_order
        ctrls.append(2.0)  # sharpness
        ctrls.append(4.0)  # guidance_scale
        
        # Models
        ctrls.append("juggernautXL_v8Rundiffusion.safetensors")  # base_model
        ctrls.append("realisticStockPhoto_v20.safetensors")  # refiner_model
        ctrls.append(0.6)  # refiner_switch
        
        # LoRAs - Your exact configuration
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
        
        # LoRA 4-5: Empty
        for _ in range(2):
            ctrls.append(False)
            ctrls.append("None")
            ctrls.append(1.0)
        
        # Image input parameters
        ctrls.append(False)  # input_image_checkbox
        ctrls.append('uov_tab')  # current_tab
        ctrls.append(self.flags.disabled)  # uov_method
        ctrls.append(None)  # uov_input_image
        
        # Additional parameters (matching api_exact.py structure)
        ctrls.append([])  # outpaint_selections
        ctrls.append(None)  # inpaint_input_image
        ctrls.append("")  # inpaint_additional_prompt
        ctrls.append(None)  # inpaint_mask_image
        
        # Display settings
        ctrls.append(False)  # disable_preview
        ctrls.append(False)  # disable_intermediate_results
        ctrls.append(False)  # disable_seed_increment
        ctrls.append(False)  # black_out_nsfw
        
        # ADM settings
        ctrls.append(1.5)  # adm_scaler_positive
        ctrls.append(0.8)  # adm_scaler_negative
        ctrls.append(0.3)  # adm_scaler_end
        ctrls.append(7.0)  # adaptive_cfg
        ctrls.append(2)  # clip_skip
        
        # Sampler settings
        ctrls.append("dpmpp_2m_sde_gpu")  # sampler_name
        ctrls.append("karras")  # scheduler_name
        ctrls.append(self.flags.default_vae)  # vae_name
        
        # Overwrite settings (all -1 for defaults)
        for _ in range(6):
            ctrls.append(-1)
        
        # Mixing settings
        ctrls.append(False)  # mixing_image_prompt_and_vary_upscale
        ctrls.append(False)  # mixing_image_prompt_and_inpaint
        
        # ControlNet preprocessing
        ctrls.append(False)  # debugging_cn_preprocessor
        ctrls.append(False)  # skipping_cn_preprocessor
        ctrls.append(64)  # canny_low_threshold
        ctrls.append(128)  # canny_high_threshold
        
        # Refiner settings
        ctrls.append('joint')  # refiner_swap_method
        ctrls.append(0.25)  # controlnet_softness
        
        # FreeU settings
        ctrls.append(False)  # freeu_enabled
        ctrls.append(1.01)  # freeu_b1
        ctrls.append(1.02)  # freeu_b2
        ctrls.append(0.99)  # freeu_s1
        ctrls.append(0.95)  # freeu_s2
        
        # Inpaint settings
        ctrls.append(False)  # debugging_inpaint_preprocessor
        ctrls.append(False)  # inpaint_disable_initial_latent
        ctrls.append('v2.6')  # inpaint_engine
        ctrls.append(1.0)  # inpaint_strength
        ctrls.append(0.618)  # inpaint_respective_field
        ctrls.append(False)  # inpaint_advanced_masking_checkbox
        ctrls.append(False)  # invert_mask_checkbox
        ctrls.append(0)  # inpaint_erode_or_dilate
        
        # Save settings
        ctrls.append(False)  # save_final_enhanced_image_only
        ctrls.append(False)  # save_metadata_to_images
        ctrls.append('fooocus')  # metadata_scheme
        
        # IP ControlNet (4 sets)
        for _ in range(4):
            ctrls.append(None)  # ip_image
            ctrls.append(0.6)  # ip_stop
            ctrls.append(0.5)  # ip_weight
            ctrls.append(self.flags.default_ip)  # ip_type
        
        # DINO/Enhance settings
        ctrls.append(False)  # debugging_dino
        ctrls.append(0)  # dino_erode_or_dilate
        ctrls.append(False)  # debugging_enhance_masks_checkbox
        ctrls.append(None)  # enhance_input_image
        ctrls.append(False)  # enhance_checkbox
        ctrls.append(self.flags.disabled)  # enhance_uov_method
        ctrls.append(self.flags.enhancement_uov_before)  # enhance_uov_processing_order
        ctrls.append(self.flags.enhancement_uov_prompt_type_original)  # enhance_uov_prompt_type
        
        # Enhance tabs (3 sets)
        for _ in range(3):
            ctrls.append(False)  # enhance_enabled
            ctrls.append("")  # enhance_mask_dino_prompt_text
            ctrls.append("")  # enhance_prompt
            ctrls.append("")  # enhance_negative_prompt
            ctrls.append('u2net')  # enhance_mask_model
            ctrls.append('full')  # enhance_mask_cloth_category
            ctrls.append('vit_b')  # enhance_mask_sam_model
            ctrls.append(0.3)  # enhance_mask_box_threshold
            ctrls.append(0.25)  # enhance_mask_text_threshold
            ctrls.append(10)  # enhance_mask_sam_max_detections
            ctrls.append(self.flags.inpaint_option_default)  # enhance_inpaint_mode
            ctrls.append(False)  # enhance_inpaint_disable_initial_latent
            ctrls.append('v2.6')  # enhance_inpaint_engine
            ctrls.append(1.0)  # enhance_inpaint_strength
            ctrls.append(0.618)  # enhance_inpaint_respective_field
            ctrls.append(0)  # enhance_inpaint_erode_or_dilate
            ctrls.append(False)  # enhance_mask_invert
        
        # Remove currentTask
        ctrls.pop(0)
        
        # Create and queue task
        task = self.AsyncTask(args=ctrls)
        self.worker.async_tasks.append(task)
        
        # Wait for completion
        timeout = 180  # 3 minutes for Quality mode
        start = time.time()
        
        while time.time() - start < timeout:
            time.sleep(0.1)
            
            # Check for results
            while len(task.yields) > 0:
                flag, product = task.yields.pop(0)
                if flag == 'preview':
                    percentage, title, _ = product
                    logger.info(f"Progress: {percentage}% - {title}")
                    # Send progress update
                    self.update_status(request_id, 'processing', {
                        'progress': percentage,
                        'message': title
                    })
                elif flag == 'finish':
                    logger.info(f"Generation complete: {product}")
                    return product
            
            if len(task.results) > 0:
                logger.info(f"Generation complete: {task.results}")
                return task.results[0] if task.results else None
        
        logger.error("Generation timed out")
        return None
    
    def encode_image_base64(self, image_path: str) -> Optional[str]:
        """Encode image file to base64"""
        try:
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
                        'imageData': image_data,
                        'imagePath': image_path,
                        'timestamp': time.time()
                    })
                    logger.info(f"Request {request_id} completed successfully")
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
        logger.info(f"RunPod Worker {WORKER_ID} started")
        logger.info(f"Polling {NEXTJS_API_URL}/api/generate/queue every {POLL_INTERVAL}s")
        
        while True:
            try:
                # Poll for pending requests
                request = self.poll_queue()
                
                if request:
                    self.process_request(request)
                else:
                    # No pending requests, wait
                    time.sleep(POLL_INTERVAL)
                    
            except KeyboardInterrupt:
                logger.info("Worker stopped by user")
                break
            except Exception as e:
                logger.error(f"Worker error: {e}")
                time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    processor = QueueProcessor()
    processor.run()