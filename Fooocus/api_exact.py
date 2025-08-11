"""
Fooocus API with EXACT values from your metadata
"""

import os
import sys
import time

# Setup
root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root)
os.chdir(root)

import modules.config as config
import modules.flags as flags
import modules.async_worker as worker
from modules.async_worker import AsyncTask

config.update_files()
print(f"Found {len(config.model_filenames)} models, {len(config.lora_filenames)} LoRAs")

def generate_exact():
    """Generate with your EXACT metadata values"""
    
    prompt = "remy, a beautiful young woman in a blue bikini top and denim shorts standing on the grass with her hands on her hips"
    
    print(f"\n[Generating] {prompt[:80]}...")
    
    # Build ctrls list with EXACT values from your metadata
    ctrls = []
    
    # Basic parameters
    ctrls.append(None)  # currentTask
    ctrls.append(False)  # generate_image_grid
    ctrls.append(prompt)  # prompt - your exact prompt
    ctrls.append("")  # negative_prompt - empty as in metadata
    ctrls.append(["Fooocus V2", "Fooocus Enhance", "Fooocus Sharp", "Fooocus Photograph"])  # styles from metadata
    ctrls.append("Quality")  # performance - "Quality" = 60 steps
    ctrls.append("896×1152")  # aspect_ratios_selection - portrait
    ctrls.append(1)  # image_number
    ctrls.append("png")  # output_format
    ctrls.append(1222747929992423451)  # image_seed - your exact seed
    ctrls.append(False)  # read_wildcards_in_order
    ctrls.append(2.0)  # sharpness - from metadata
    ctrls.append(4.0)  # guidance_scale - from metadata
    
    # Models
    ctrls.append("juggernautXL_v8Rundiffusion.safetensors")  # base_model
    ctrls.append("realisticStockPhoto_v20.safetensors")  # refiner_model - from metadata
    ctrls.append(0.6171)  # refiner_switch - from metadata
    
    # LoRAs - YOUR EXACT VALUES
    # LoRA 1: remy.safetensors : 0.94
    ctrls.append(True)  # lora_enabled
    ctrls.append("remy.safetensors")  # lora_model
    ctrls.append(0.94)  # lora_weight
    
    # LoRA 2: RealVisXL_V5.0_fp32.safetensors : 0.6
    ctrls.append(True)  # lora_enabled
    ctrls.append("RealVisXL_V5.0_fp32.safetensors")  # lora_model
    ctrls.append(0.6)  # lora_weight
    
    # LoRA 3: super-realism.safetensors : 0.69
    ctrls.append(True)  # lora_enabled
    ctrls.append("super-realism.safetensors")  # lora_model
    ctrls.append(0.69)  # lora_weight
    
    # LoRA 4-5: Empty
    for _ in range(2):
        ctrls.append(False)  # lora_enabled
        ctrls.append("None")  # lora_model
        ctrls.append(1.0)  # lora_weight
    
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
    
    # ADM settings - YOUR VALUES: (1.5, 0.8, 0.3)
    ctrls.append(1.5)  # adm_scaler_positive
    ctrls.append(0.8)  # adm_scaler_negative
    ctrls.append(0.3)  # adm_scaler_end
    ctrls.append(7.0)  # adaptive_cfg
    ctrls.append(2)  # clip_skip - from metadata
    
    # Sampler settings - YOUR VALUES
    ctrls.append("dpmpp_2m_sde_gpu")  # sampler_name
    ctrls.append("karras")  # scheduler_name
    ctrls.append(flags.default_vae)  # vae_name - "Default (model)"
    
    # Overwrite settings
    ctrls.append(-1)  # overwrite_step
    ctrls.append(-1)  # overwrite_switch
    ctrls.append(-1)  # overwrite_width
    ctrls.append(-1)  # overwrite_height
    ctrls.append(-1)  # overwrite_vary_strength
    ctrls.append(-1)  # overwrite_upscale_strength
    
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
    ctrls.append(False)  # save_metadata_to_images - false as in your metadata
    ctrls.append('fooocus')  # metadata_scheme
    
    # IP ControlNet (4 sets)
    for _ in range(4):
        ctrls.append(None)  # ip_image
        ctrls.append(0.6)  # ip_stop
        ctrls.append(0.5)  # ip_weight
        ctrls.append(flags.default_ip)  # ip_type
    
    # DINO/Enhance settings
    ctrls.append(False)  # debugging_dino
    ctrls.append(0)  # dino_erode_or_dilate
    ctrls.append(False)  # debugging_enhance_masks_checkbox
    ctrls.append(None)  # enhance_input_image
    ctrls.append(False)  # enhance_checkbox
    ctrls.append(flags.disabled)  # enhance_uov_method
    ctrls.append(flags.enhancement_uov_before)  # enhance_uov_processing_order
    ctrls.append(flags.enhancement_uov_prompt_type_original)  # enhance_uov_prompt_type
    
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
        ctrls.append(flags.inpaint_option_default)  # enhance_inpaint_mode
        ctrls.append(False)  # enhance_inpaint_disable_initial_latent
        ctrls.append('v2.6')  # enhance_inpaint_engine
        ctrls.append(1.0)  # enhance_inpaint_strength
        ctrls.append(0.618)  # enhance_inpaint_respective_field
        ctrls.append(0)  # enhance_inpaint_erode_or_dilate
        ctrls.append(False)  # enhance_mask_invert
    
    # Remove currentTask
    ctrls.pop(0)
    
    # Create and queue task
    task = AsyncTask(args=ctrls)
    worker.async_tasks.append(task)
    
    print(f"Task queued with YOUR EXACT parameters:")
    print(f"  Seed: 1222747929992423451")
    print(f"  Performance: Quality (60 steps)")
    print(f"  Resolution: 896×1152")
    print(f"  CFG: 4.0")
    print(f"  LoRAs:")
    print(f"    - remy.safetensors: 0.94")
    print(f"    - RealVisXL_V5.0_fp32.safetensors: 0.6")
    print(f"    - super-realism.safetensors: 0.69")
    print(f"  Refiner: realisticStockPhoto_v20 @ 0.6171")
    
    # Wait for completion
    timeout = 180  # 3 minutes for Quality mode
    start = time.time()
    last_preview = None
    
    while time.time() - start < timeout:
        time.sleep(0.1)
        
        while len(task.yields) > 0:
            flag, product = task.yields.pop(0)
            if flag == 'preview':
                percentage, title, _ = product
                if percentage != last_preview:
                    print(f"  {percentage}% - {title}")
                    last_preview = percentage
            elif flag == 'finish':
                print(f"\n✓ Generation complete!")
                print(f"  Output: {product}")
                return product
        
        if len(task.results) > 0:
            print(f"\n✓ Generation complete!")
            print(f"  Results: {task.results}")
            return task.results
    
    print("\n✗ Generation timed out")
    return None

if __name__ == "__main__":
    print("\n" + "="*60)
    print("FOOOCUS API - YOUR EXACT METADATA VALUES")
    print("="*60)
    
    result = generate_exact()
    
    if result:
        print("\n✓ SUCCESS - Image generated with your exact parameters!")
    else:
        print("\n✗ FAILED - Could not generate image")
    
    print("="*60)