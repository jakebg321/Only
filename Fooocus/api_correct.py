"""
Fooocus API with EXACT parameter order from webui.py
"""

import os
import sys
import time
import random

# Setup
root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root)
os.chdir(root)

import modules.config as config
import modules.constants as constants
import modules.flags as flags
import modules.async_worker as worker
from modules.async_worker import AsyncTask

config.update_files()
print(f"Found {len(config.model_filenames)} models, {len(config.lora_filenames)} LoRAs")

def generate(prompt="beautiful landscape", loras=None):
    """Generate with exact webui parameter order"""
    
    print(f"\n[Generating] {prompt}")
    
    # Build ctrls list EXACTLY like webui.py does
    ctrls = []
    
    # Line 977-982
    ctrls.append(None)  # currentTask
    ctrls.append(False)  # generate_image_grid
    ctrls.append(prompt)  # prompt
    ctrls.append("")  # negative_prompt
    ctrls.append(["Fooocus V2", "Fooocus Enhance", "Fooocus Sharp"])  # style_selections
    ctrls.append("Speed")  # performance_selection
    ctrls.append("1152×896")  # aspect_ratios_selection (note: × not *)
    ctrls.append(1)  # image_number
    ctrls.append("png")  # output_format
    ctrls.append(random.randint(1, constants.MAX_SEED))  # image_seed
    ctrls.append(False)  # read_wildcards_in_order
    ctrls.append(2.0)  # sharpness
    ctrls.append(7.0)  # guidance_scale
    
    # Line 984: base_model, refiner_model, refiner_switch + lora_ctrls
    ctrls.append("juggernautXL_v8Rundiffusion.safetensors")  # base_model
    ctrls.append("None")  # refiner_model
    ctrls.append(0.5)  # refiner_switch
    
    # lora_ctrls - 5 LoRAs, each has (enabled, model, weight)
    if loras:
        for i in range(5):
            if i < len(loras):
                filename, weight = loras[i]
                ctrls.append(True)  # lora_enabled
                ctrls.append(filename)  # lora_model
                ctrls.append(weight)  # lora_weight
            else:
                ctrls.append(False)  # lora_enabled
                ctrls.append("None")  # lora_model
                ctrls.append(1.0)  # lora_weight
    else:
        for _ in range(5):
            ctrls.append(False)  # lora_enabled
            ctrls.append("None")  # lora_model
            ctrls.append(1.0)  # lora_weight
    
    # Line 985: input_image_checkbox, current_tab
    ctrls.append(False)  # input_image_checkbox
    ctrls.append('uov_tab')  # current_tab
    
    # Line 986: uov_method, uov_input_image
    ctrls.append(flags.disabled)  # uov_method
    ctrls.append(None)  # uov_input_image
    
    # Line 987: outpaint_selections, inpaint_input_image, inpaint_additional_prompt, inpaint_mask_image
    ctrls.append([])  # outpaint_selections
    ctrls.append(None)  # inpaint_input_image
    ctrls.append("")  # inpaint_additional_prompt
    ctrls.append(None)  # inpaint_mask_image
    
    # Line 988: disable_preview, disable_intermediate_results, disable_seed_increment, black_out_nsfw
    ctrls.append(False)  # disable_preview
    ctrls.append(False)  # disable_intermediate_results
    ctrls.append(False)  # disable_seed_increment
    ctrls.append(False)  # black_out_nsfw
    
    # Line 989: adm_scaler_positive, adm_scaler_negative, adm_scaler_end, adaptive_cfg, clip_skip
    ctrls.append(1.5)  # adm_scaler_positive
    ctrls.append(0.8)  # adm_scaler_negative
    ctrls.append(0.3)  # adm_scaler_end
    ctrls.append(7.0)  # adaptive_cfg
    ctrls.append(2)  # clip_skip
    
    # Line 990: sampler_name, scheduler_name, vae_name
    ctrls.append("dpmpp_2m_sde_gpu")  # sampler_name
    ctrls.append("karras")  # scheduler_name
    ctrls.append(flags.default_vae)  # vae_name
    
    # Line 991: overwrite_step, overwrite_switch, overwrite_width, overwrite_height, overwrite_vary_strength
    ctrls.append(-1)  # overwrite_step
    ctrls.append(-1)  # overwrite_switch
    ctrls.append(-1)  # overwrite_width
    ctrls.append(-1)  # overwrite_height
    ctrls.append(-1)  # overwrite_vary_strength
    
    # Line 992: overwrite_upscale_strength, mixing_image_prompt_and_vary_upscale, mixing_image_prompt_and_inpaint
    ctrls.append(-1)  # overwrite_upscale_strength
    ctrls.append(False)  # mixing_image_prompt_and_vary_upscale
    ctrls.append(False)  # mixing_image_prompt_and_inpaint
    
    # Line 993: debugging_cn_preprocessor, skipping_cn_preprocessor, canny_low_threshold, canny_high_threshold
    ctrls.append(False)  # debugging_cn_preprocessor
    ctrls.append(False)  # skipping_cn_preprocessor
    ctrls.append(64)  # canny_low_threshold
    ctrls.append(128)  # canny_high_threshold
    
    # Line 994: refiner_swap_method, controlnet_softness
    ctrls.append('joint')  # refiner_swap_method
    ctrls.append(0.25)  # controlnet_softness
    
    # Line 995: freeu_ctrls = [freeu_enabled, freeu_b1, freeu_b2, freeu_s1, freeu_s2]
    ctrls.append(False)  # freeu_enabled
    ctrls.append(1.01)  # freeu_b1
    ctrls.append(1.02)  # freeu_b2
    ctrls.append(0.99)  # freeu_s1
    ctrls.append(0.95)  # freeu_s2
    
    # Line 996: inpaint_ctrls = [debugging_inpaint_preprocessor, inpaint_disable_initial_latent, inpaint_engine, 
    #                          inpaint_strength, inpaint_respective_field, inpaint_advanced_masking_checkbox, 
    #                          invert_mask_checkbox, inpaint_erode_or_dilate]
    ctrls.append(False)  # debugging_inpaint_preprocessor
    ctrls.append(False)  # inpaint_disable_initial_latent
    ctrls.append('v2.6')  # inpaint_engine
    ctrls.append(1.0)  # inpaint_strength
    ctrls.append(0.618)  # inpaint_respective_field
    ctrls.append(False)  # inpaint_advanced_masking_checkbox
    ctrls.append(False)  # invert_mask_checkbox
    ctrls.append(0)  # inpaint_erode_or_dilate
    
    # Line 998-1002: save settings (conditional)
    ctrls.append(False)  # save_final_enhanced_image_only
    ctrls.append(True)  # save_metadata_to_images
    ctrls.append('fooocus')  # metadata_scheme
    
    # Line 1004: ip_ctrls - 4 controlnet images
    for _ in range(4):
        ctrls.append(None)  # ip_image
        ctrls.append(0.6)  # ip_stop
        ctrls.append(0.5)  # ip_weight
        ctrls.append(flags.default_ip)  # ip_type
    
    # Line 1005-1007: enhance settings
    ctrls.append(False)  # debugging_dino
    ctrls.append(0)  # dino_erode_or_dilate
    ctrls.append(False)  # debugging_enhance_masks_checkbox
    ctrls.append(None)  # enhance_input_image
    ctrls.append(False)  # enhance_checkbox
    ctrls.append(flags.disabled)  # enhance_uov_method
    ctrls.append(flags.enhancement_uov_before)  # enhance_uov_processing_order
    ctrls.append(flags.enhancement_uov_prompt_type_original)  # enhance_uov_prompt_type
    
    # Line 1008: enhance_ctrls - 3 enhance tabs
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
    
    # Now create the task like webui does
    # First pop the currentTask
    ctrls.pop(0)
    
    # Create task
    task = AsyncTask(args=ctrls)
    worker.async_tasks.append(task)
    print(f"Task queued: seed={task.seed}")
    
    # Wait for completion
    timeout = 120
    start = time.time()
    
    while time.time() - start < timeout:
        time.sleep(0.5)
        
        while len(task.yields) > 0:
            flag, product = task.yields.pop(0)
            if flag == 'preview':
                percentage, title, _ = product
                print(f"  {percentage}% - {title}")
            elif flag == 'finish':
                print(f"Complete! {product}")
                return product
        
        if len(task.results) > 0:
            print(f"Complete! {task.results}")
            return task.results
    
    print("Timed out")
    return None

if __name__ == "__main__":
    print("\n" + "="*60)
    print("FOOOCUS API - EXACT WEBUI STRUCTURE")
    print("="*60)
    
    # Test 1: Basic
    print("\n[TEST 1] Basic generation...")
    result = generate("a beautiful cat sitting in a garden")
    print(f"Success: {result is not None}")
    
    # Test 2: With LoRAs
    print("\n[TEST 2] With LoRAs...")
    result = generate(
        "remy, professional portrait, outdoor setting",
        [("remy.safetensors", 0.9)]
    )
    print(f"Success: {result is not None}")
    
    print("\nDone!")