import os
import ffmpeg 
import cv2
import numpy as np
import base64
import json
import boto3
import requests
from supabase import create_client, Client
from skimage.metrics import structural_similarity as ssim
from dotenv import load_dotenv

load_dotenv()

# configuration
# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
NOVA_MODEL_ID = "amazon.nova-lite-v1:0"

# GitHub CDN configuration
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = os.getenv("GITHUB_REPO") # Format: "username/repo-name"
GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_TABLE = os.getenv("SUPABASE_TABLE", "video_storage")

VIDEO_PATH = "input_video.mp4"
FPS = 2
SSIM_THRESHOLD = 0.50

# init 
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name=AWS_REGION
)

# Initialize Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# frame distinctness check using Structural Similarity Index (SSIM)
def is_distinct(prev_frame, curr_frame, threshold=0.50):
    if prev_frame is None:
        return True

    prev_frame_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    curr_frame_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)
    score, _ = ssim(prev_frame_gray, curr_frame_gray, full=True)

    return score < threshold

# github upload
def upload_to_github(file_path, repo_path):
    """
    Uploads a file to GitHub and returns the raw CDN URL.
    """
    if not GITHUB_TOKEN or not GITHUB_REPO:
        return None

    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{repo_path}"
    
    with open(file_path, "rb") as f:
        content = base64.b64encode(f.read()).decode("utf-8")

    # Check if file exists to get SHA (for update) - though we usually want unique paths
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    data = {
        "message": f"Upload frame {repo_path}",
        "content": content,
        "branch": GITHUB_BRANCH
    }

    # First attempt to see if it exists
    get_res = requests.get(url, headers=headers)
    if get_res.status_code == 200:
        data["sha"] = get_res.json()["sha"]

    put_res = requests.put(url, headers=headers, json=data)
    
    if put_res.status_code in [200, 201]:
        # Return Raw CDN Link
        return f"https://raw.githubusercontent.com/{GITHUB_REPO}/{GITHUB_BRANCH}/{repo_path}"
    else:
        print(f"GitHub Upload Failed: {put_res.text}")
        return None

# nova analysis
def analyze_frame_with_nova(image_path):
    with open(image_path, "rb") as image_file:
        image_bytes = image_file.read()
        encoded_image = base64.b64encode(image_bytes).decode('utf-8')

    prompt = """
    You are selecting frames for training train detection AI model.

    Describe the scene briefly.
    Is it relevant for training a train detection model? (yes/no)

    Respond with raw JSON only. Do NOT use markdown or code blocks.
    {
        "relevant": true/false,
        "label": "short scene label",
        "confidence": 0-1
    }    
    """

    body = json.dumps({
        "inferenceConfig": {
            "max_new_tokens": 1000,
            "temperature": 0.1,
            "top_p": 0.9,
        },
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "image": {
                            "format": "png",
                            "source": {
                                "bytes": encoded_image
                            }
                        }
                    },
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    })

    try:
        response = bedrock_runtime.invoke_model(
            modelId=NOVA_MODEL_ID,
            body=body
        )
        
        response_body = json.loads(response.get('body').read())
        text_response = response_body['output']['message']['content'][0]['text']
        
        if text_response.strip().startswith("```"):
            lines = text_response.strip().split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].strip().endswith("```"):
                lines = lines[:-1]
            text_response = "\n".join(lines).strip()
            
        return json.loads(text_response)
    except Exception as e:
        print(f"Failed to analyze frame {image_path}: {e}")
        return None

# main pipeline
def process_video(video_path, output_folder="temp_frames"):
    os.makedirs(output_folder, exist_ok=True)

    print(f"Extracting frames from {video_path} at {FPS} FPS...")
    output_pattern = os.path.join(output_folder, 'frame_%04d.png')
    try:
        (
            ffmpeg
            .input(video_path)
            .output(output_pattern, vf=f"fps={FPS}")
            .run(quiet=True, overwrite_output=True)
        )
    except Exception as e:
        print(f"FFMPEG error: {e}")
        return

    prev_frame = None
    frames = sorted(os.listdir(output_folder))
    print(f"Found {len(frames)} frames. Filtering and Uploading...")

    video_id = os.path.splitext(os.path.basename(video_path))[0]
    processed_count = 0

    for frame_name in frames:
        frame_path = os.path.join(output_folder, frame_name)
        curr_frame = cv2.imread(frame_path)
        if curr_frame is None:
            continue

        if not is_distinct(prev_frame, curr_frame, threshold=SSIM_THRESHOLD):
            os.remove(frame_path)
            continue
        
        prev_frame = curr_frame
            
        # nova analysis
        print(f"Analyzing {frame_name} with Nova AI...")
        nova_result = analyze_frame_with_nova(frame_path)

        if nova_result is None:
            continue
        
        # GitHub Upload
        sequential_frame_name = f"frame_{processed_count + 1:04d}.png"
        cdn_url = upload_to_github(frame_path, f"frames/{video_id}/{sequential_frame_name}")
        
        if cdn_url:
            processed_count += 1
        
        result_payload = {
            "original_frame": frame_name,
            "sequential_frame": sequential_frame_name,
            "analysis": nova_result,
            "cdn_url": cdn_url
        }

        print(f"Result: {json.dumps(result_payload, indent=2)}")

    # Calculate and store Base CDN URL in Supabase
    if supabase and GITHUB_REPO:
        base_cdn_url = f"https://raw.githubusercontent.com/{GITHUB_REPO}/{GITHUB_BRANCH}/frames/{video_id}/"
        print(f"Saving Base CDN URL to Supabase: {base_cdn_url}")
        try:
            supabase.table(SUPABASE_TABLE).insert({
                "repo_name": GITHUB_REPO,
                "base_url": base_cdn_url,
                "number_of_frames": processed_count
            }).execute()
            print("Successfully saved to Supabase!")
        except Exception as e:
            print(f"Failed to save to Supabase: {e}")

    print("Video process complete!")

if __name__ == "__main__":
    if os.path.exists(VIDEO_PATH):
        process_video(VIDEO_PATH)
    else:
        mp4_files = [f for f in os.listdir('.') if f.endswith('.mp4')]
        if mp4_files:
            print(f"'{VIDEO_PATH}' not found. Using '{mp4_files[0]}' instead.")
            process_video(mp4_files[0])
        else:
            print(f"No .mp4 video files found in current directory.")
