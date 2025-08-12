"""
Local test script to verify RunPod worker integration
Tests the queue system without needing RunPod deployment
"""

import requests
import time
import json
import sys
import os

# Configuration
NEXTJS_URL = "http://localhost:3000"  # Your local Next.js dev server
TEST_PROMPTS = [
    "remy in a blue bikini on the beach",
    "remy wearing casual clothes in a coffee shop",
    "remy professional headshot portrait"
]

def submit_request(prompt, user_id="test-user"):
    """Submit a generation request to Next.js"""
    response = requests.post(
        f"{NEXTJS_URL}/api/generate",
        json={
            "prompt": prompt,
            "userId": user_id,
            "userName": "Test User",
            "requestType": "test",
            "urgency": "normal"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Request submitted: ID {data['requestId']}")
        return data['requestId']
    else:
        print(f"❌ Failed to submit: {response.text}")
        return None

def check_queue():
    """Check the current queue status"""
    response = requests.get(f"{NEXTJS_URL}/api/generate/queue")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n📊 Queue Status:")
        print(f"  Total: {data['queueLength']}")
        print(f"  Pending: {data['stats']['pending']}")
        print(f"  Processing: {data['stats']['processing']}")
        print(f"  Completed: {data['stats']['completed']}")
        print(f"  Failed: {data['stats'].get('failed', 0)}")
        return data
    else:
        print(f"❌ Failed to get queue: {response.text}")
        return None

def simulate_worker():
    """Simulate a RunPod worker processing requests"""
    print("\n🤖 Starting local worker simulation...")
    print(f"   Polling {NEXTJS_URL}/api/generate/queue")
    
    while True:
        try:
            # Get queue
            queue_data = requests.get(f"{NEXTJS_URL}/api/generate/queue").json()
            
            # Find pending request
            pending = None
            for req in queue_data.get('queue', []):
                if req['status'] == 'pending':
                    pending = req
                    break
            
            if pending:
                print(f"\n📥 Found pending request: {pending['id']}")
                print(f"   Prompt: {pending['prompt'][:50]}...")
                
                # Update to processing
                requests.post(
                    f"{NEXTJS_URL}/api/generate/update",
                    json={
                        "requestId": pending['id'],
                        "status": "processing",
                        "workerId": "local-test"
                    }
                )
                print(f"   Status → processing")
                
                # Simulate generation (5 seconds)
                for i in range(5):
                    time.sleep(1)
                    print(f"   Generating... {(i+1)*20}%")
                
                # Update to completed
                requests.post(
                    f"{NEXTJS_URL}/api/generate/update",
                    json={
                        "requestId": pending['id'],
                        "status": "completed",
                        "workerId": "local-test",
                        "result": {
                            "imageData": "base64_simulated_image_data_here",
                            "imagePath": f"/outputs/image_{pending['id']}.png"
                        }
                    }
                )
                print(f"   ✅ Completed!")
            else:
                print(".", end="", flush=True)
                time.sleep(2)
                
        except KeyboardInterrupt:
            print("\n\n🛑 Worker stopped")
            break
        except Exception as e:
            print(f"\n❌ Worker error: {e}")
            time.sleep(5)

def test_full_flow():
    """Test the complete flow"""
    print("="*60)
    print("TESTING NEXT.JS + RUNPOD INTEGRATION")
    print("="*60)
    
    # Check initial queue
    print("\n1️⃣ Checking initial queue state...")
    check_queue()
    
    # Submit test requests
    print("\n2️⃣ Submitting test requests...")
    request_ids = []
    for prompt in TEST_PROMPTS:
        req_id = submit_request(prompt)
        if req_id:
            request_ids.append(req_id)
        time.sleep(0.5)
    
    # Check queue after submission
    print("\n3️⃣ Queue after submission:")
    check_queue()
    
    # Ask to start worker
    print("\n4️⃣ Worker Simulation")
    print("   Run 'python local_test.py --worker' in another terminal")
    print("   Or press Enter to skip worker simulation...")
    input()
    
    # Final queue check
    print("\n5️⃣ Final queue state:")
    check_queue()
    
    print("\n" + "="*60)
    print("✅ Test complete!")
    print("="*60)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--worker":
        # Run as worker
        simulate_worker()
    else:
        # Run test flow
        test_full_flow()
        print("\nTo simulate a worker, run:")
        print("  python local_test.py --worker")