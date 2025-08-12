"""
Fooocus API adapted for RunPod Linux environment
Converts Windows paths to Linux and uses RunPod's shared model storage
"""

import os
import sys
import time
import json

# Setup paths for RunPod
root = os.path.dirname(os.path.abspath(__file__))
fooocus_path = os.path.join(root, 'Fooocus')
sys.path.append(fooocus_path)
os.chdir(fooocus_path)

# Import Fooocus modules
import modules.config as config
import modules.flags as flags
import modules.async_worker as worker
from modules.async_worker import AsyncTask

# Update model paths for RunPod shared storage
# RunPod typically mounts models at /workspace/models or similar
MODELS_BASE = os.getenv('MODELS_PATH', '/workspace/models')

# Override model paths
config.paths_checkpoints = [os.path.join(MODELS_BASE, 'checkpoints')]
config.paths_loras = [os.path.join(MODELS_BASE, 'loras')]
config.paths_vae = [os.path.join(MODELS_BASE, 'vae')]
config.paths_embeddings = [os.path.join(MODELS_BASE, 'embeddings')]
config.paths_controlnet = [os.path.join(MODELS_BASE, 'controlnet')]

# Update file lists
config.update_files()
print(f"[RunPod] Found {len(config.model_filenames)} models, {len(config.lora_filenames)} LoRAs")
print(f"[RunPod] Model paths: {config.paths_checkpoints}")
print(f"[RunPod] LoRA paths: {config.paths_loras}")

def generate_for_queue(prompt, request_id=None, parameters=None):
    """
    Generate image with queue tracking
    
    Args:
        prompt: Text prompt for generation
        request_id: ID from Next.js queue for tracking
        parameters: Optional dict with custom parameters
    """
    
    if parameters is None:
        parameters = {}
    
    print(f"\n[Queue {request_id}] Generating: {prompt[:80]}...")
    
    # Build control parameters
    ctrls = []
    
    # Basic parameters
    ctrls.append(None)  # currentTask
    ctrls.append(False)  # generate_image_grid
    ctrls.append(prompt)  # prompt
    ctrls.append(parameters.get('negative_prompt', ''))  # negative_prompt
    ctrls.append(parameters.get('styles', ["Fooocus V2", "Fooocus Enhance", "Fooocus Sharp"]))  # styles
    ctrls.append(parameters.get('performance', 'Quality'))  # performance
    ctrls.append(parameters.get('resolution', '896×1152'))  # aspect_ratio
    ctrls.append(parameters.get('image_number', 1))  # image_number
    ctrls.append(parameters.get('output_format', 'png'))  # output_format
    ctrls.append(parameters.get('seed', -1))  # image_seed (-1 for random)
    ctrls.append(False)  # read_wildcards_in_order
    ctrls.append(parameters.get('sharpness', 2.0))  # sharpness
    ctrls.append(parameters.get('cfg', 4.0))  # guidance_scale
    
    # Models
    ctrls.append(parameters.get('base_model', 'juggernautXL_v8Rundiffusion.safetensors'))
    ctrls.append(parameters.get('refiner_model', 'realisticStockPhoto_v20.safetensors'))
    ctrls.append(parameters.get('refiner_switch', 0.6))
    
    # LoRAs - Default to your working configuration
    loras = parameters.get('loras', [
        {'enabled': True, 'name': 'remy.safetensors', 'weight': 0.94},
        {'enabled': True, 'name': 'RealVisXL_V5.0_fp32.safetensors', 'weight': 0.6},
        {'enabled': True, 'name': 'super-realism.safetensors', 'weight': 0.69},
        {'enabled': False, 'name': 'None', 'weight': 1.0},
        {'enabled': False, 'name': 'None', 'weight': 1.0}
    ])
    
    # Ensure we have exactly 5 LoRA slots
    while len(loras) < 5:
        loras.append({'enabled': False, 'name': 'None', 'weight': 1.0})
    
    for lora in loras[:5]:
        ctrls.append(lora.get('enabled', False))
        ctrls.append(lora.get('name', 'None'))
        ctrls.append(lora.get('weight', 1.0))
    
    # Image input parameters
    ctrls.append(False)  # input_image_checkbox
    ctrls.append('uov_tab')  # current_tab
    ctrls.append(flags.disabled)  # uov_method
    ctrls.append(None)  # uov_input_image
    
    # Outpaint/Inpaint
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
    ctrls.append(parameters.get('adm_positive', 1.5))
    ctrls.append(parameters.get('adm_negative', 0.8))
    ctrls.append(parameters.get('adm_end', 0.3))
    ctrls.append(parameters.get('adaptive_cfg', 7.0))
    ctrls.append(parameters.get('clip_skip', 2))
    
    # Sampler settings
    ctrls.append(parameters.get('sampler', 'dpmpp_2m_sde_gpu'))
    ctrls.append(parameters.get('scheduler', 'karras'))
    ctrls.append(flags.default_vae)
    
    # Overwrite settings (all -1 for defaults)
    for _ in range(6):
        ctrls.append(-1)
    
    # Mixing settings
    ctrls.append(False)
    ctrls.append(False)
    
    # ControlNet preprocessing
    ctrls.append(False)
    ctrls.append(False)
    ctrls.append(64)
    ctrls.append(128)
    
    # Refiner settings
    ctrls.append('joint')
    ctrls.append(0.25)
    
    # FreeU settings
    ctrls.append(False)
    ctrls.append(1.01)
    ctrls.append(1.02)
    ctrls.append(0.99)
    ctrls.append(0.95)
    
    # Inpaint settings
    ctrls.append(False)
    ctrls.append(False)
    ctrls.append('v2.6')
    ctrls.append(1.0)
    ctrls.append(0.618)
    ctrls.append(False)
    ctrls.append(False)
    ctrls.append(0)
    
    # Save settings
    ctrls.append(False)
    ctrls.append(False)
    ctrls.append('fooocus')
    
    # IP ControlNet (4 sets)
    for _ in range(4):
        ctrls.append(None)
        ctrls.append(0.6)
        ctrls.append(0.5)
        ctrls.append(flags.default_ip)
    
    # DINO/Enhance settings
    ctrls.append(False)
    ctrls.append(0)
    ctrls.append(False)
    ctrls.append(None)
    ctrls.append(False)
    ctrls.append(flags.disabled)
    ctrls.append(flags.enhancement_uov_before)
    ctrls.append(flags.enhancement_uov_prompt_type_original)
    
    # Enhance tabs (3 sets)
    for _ in range(3):
        ctrls.append(False)
        ctrls.append("")
        ctrls.append("")
        ctrls.append("")
        ctrls.append('u2net')
        ctrls.append('full')
        ctrls.append('vit_b')
        ctrls.append(0.3)
        ctrls.append(0.25)
        ctrls.append(10)
        ctrls.append(flags.inpaint_option_default)
        ctrls.append(False)
        ctrls.append('v2.6')
        ctrls.append(1.0)
        ctrls.append(0.618)
        ctrls.append(0)
        ctrls.append(False)
    
    # Remove currentTask
    ctrls.pop(0)
    
    # Create and queue task
    task = AsyncTask(args=ctrls)
    worker.async_tasks.append(task)
    
    print(f"[Queue {request_id}] Task queued with parameters:")
    print(f"  Performance: {parameters.get('performance', 'Quality')}")
    print(f"  Resolution: {parameters.get('resolution', '896×1152')}")
    print(f"  CFG: {parameters.get('cfg', 4.0)}")
    print(f"  LoRAs: {len([l for l in loras if l.get('enabled')])}")
    
    # Wait for completion with progress callbacks
    timeout = 180 if parameters.get('performance', 'Quality') == 'Quality' else 90
    start = time.time()
    last_preview = None
    
    result = {
        'request_id': request_id,
        'status': 'processing',
        'progress': 0,
        'output': None
    }
    
    while time.time() - start < timeout:
        time.sleep(0.1)
        
        while len(task.yields) > 0:
            flag, product = task.yields.pop(0)
            if flag == 'preview':
                percentage, title, _ = product
                if percentage != last_preview:
                    result['progress'] = percentage
                    result['message'] = title
                    print(f"[Queue {request_id}] {percentage}% - {title}")
                    last_preview = percentage
            elif flag == 'finish':
                print(f"[Queue {request_id}] ✓ Generation complete!")
                result['status'] = 'completed'
                result['output'] = product
                return result
        
        if len(task.results) > 0:
            print(f"[Queue {request_id}] ✓ Generation complete!")
            result['status'] = 'completed'
            result['output'] = task.results[0] if task.results else None
            return result
    
    print(f"[Queue {request_id}] ✗ Generation timed out")
    result['status'] = 'failed'
    result['error'] = 'Generation timed out'
    return result

def test_runpod_setup():
    """Test that RunPod environment is properly configured"""
    print("\n" + "="*60)
    print("TESTING RUNPOD FOOOCUS SETUP")
    print("="*60)
    
    # Check model paths
    print("\nModel Paths:")
    print(f"  Checkpoints: {config.paths_checkpoints}")
    print(f"  LoRAs: {config.paths_loras}")
    
    # Check available models
    print(f"\nAvailable Models: {len(config.model_filenames)}")
    if config.model_filenames:
        print(f"  Sample: {config.model_filenames[:3]}")
    
    # Check available LoRAs
    print(f"\nAvailable LoRAs: {len(config.lora_filenames)}")
    if config.lora_filenames:
        print(f"  Sample: {config.lora_filenames[:3]}")
    
    # Test generation
    print("\nTesting generation...")
    result = generate_for_queue(
        prompt="test image of a cat",
        request_id="test-001",
        parameters={'performance': 'Speed'}  # Use Speed for faster testing
    )
    
    if result['status'] == 'completed':
        print(f"\n✓ TEST PASSED - Image generated: {result['output']}")
    else:
        print(f"\n✗ TEST FAILED - {result.get('error', 'Unknown error')}")
    
    print("="*60)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--test', action='store_true', help='Run test')
    parser.add_argument('--prompt', type=str, help='Generate with prompt')
    parser.add_argument('--request-id', type=str, default='manual-001', help='Request ID')
    args = parser.parse_args()
    
    if args.test:
        test_runpod_setup()
    elif args.prompt:
        result = generate_for_queue(args.prompt, args.request_id)
        print(f"\nResult: {json.dumps(result, indent=2)}")
    else:
        print("Use --test to test setup or --prompt 'your prompt' to generate")