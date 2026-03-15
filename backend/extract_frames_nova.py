import os
import ffmpeg
import cv2
import base64
import json
import boto3
import requests
from typing import Callable, Optional
from supabase import create_client, Client
from skimage.metrics import structural_similarity as ssim
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# ─── AWS / GitHub / Supabase config ──────────────────────────────────────────
AWS_REGION     = os.getenv("AWS_REGION", "us-east-1")
NOVA_MODEL_ID  = "amazon.nova-lite-v1:0"

GITHUB_TOKEN  = os.getenv("GITHUB_TOKEN")
GITHUB_REPO   = os.getenv("GITHUB_REPO")
GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")

SUPABASE_URL   = os.getenv("SUPABASE_URL")
SUPABASE_KEY   = os.getenv("SUPABASE_KEY")
SUPABASE_TABLE = os.getenv("SUPABASE_TABLE", "video_storage")

FPS            = 2
SSIM_THRESHOLD = 0.50

# ─── Clients ──────────────────────────────────────────────────────────────────
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name=AWS_REGION
)

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _log(callback: Optional[Callable], level: str, msg: str):
    print(f"[{level}] {msg}")
    if callback:
        callback(level, msg)


def is_distinct(prev_frame, curr_frame, threshold=SSIM_THRESHOLD):
    if prev_frame is None:
        return True
    prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)
    score, _ = ssim(prev_gray, curr_gray, full=True)
    return score < threshold


def upload_to_github(file_path: str, repo_path: str) -> Optional[str]:
    if not GITHUB_TOKEN or not GITHUB_REPO:
        return None

    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{repo_path}"
    with open(file_path, "rb") as f:
        content = base64.b64encode(f.read()).decode("utf-8")

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
    }
    data = {
        "message": f"Upload {repo_path}",
        "content": content,
        "branch": GITHUB_BRANCH,
    }

    get_res = requests.get(url, headers=headers)
    if get_res.status_code == 200:
        data["sha"] = get_res.json()["sha"]

    put_res = requests.put(url, headers=headers, json=data)
    if put_res.status_code in [200, 201]:
        return f"https://raw.githubusercontent.com/{GITHUB_REPO}/{GITHUB_BRANCH}/{repo_path}"

    print(f"GitHub upload failed: {put_res.text}")
    return None


def analyze_frame_with_nova(image_path: str, keyword: str) -> Optional[dict]:
    """Ask Nova whether this frame is relevant for detecting <keyword>."""
    with open(image_path, "rb") as f:
        encoded_image = base64.b64encode(f.read()).decode("utf-8")

    prompt = f"""You are selecting frames for training a {keyword} detection AI model.

Describe the scene briefly.
Is it relevant for training a {keyword} detection model? (yes/no)

Respond with raw JSON only. Do NOT use markdown or code blocks.
{{
    "relevant": true/false,
    "label": "short scene label",
    "confidence": 0-1
}}"""

    body = json.dumps({
        "inferenceConfig": {
            "max_new_tokens": 512,
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
                            "source": {"bytes": encoded_image},
                        }
                    },
                    {"text": prompt},
                ],
            }
        ],
    })

    try:
        response = bedrock_runtime.invoke_model(modelId=NOVA_MODEL_ID, body=body)
        response_body = json.loads(response.get("body").read())
        text = response_body["output"]["message"]["content"][0]["text"].strip()

        # Strip markdown fences if Nova wraps JSON anyway
        if text.startswith("```"):
            lines = text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            text = "\n".join(lines).strip()

        return json.loads(text)
    except Exception as e:
        print(f"Nova analysis failed for {image_path}: {e}")
        return None


# ─── Main pipeline ────────────────────────────────────────────────────────────

def process_video(
    video_path: str,
    keyword: str = "object",
    output_folder: str = "temp_frames",
    log_callback: Optional[Callable[[str, str], None]] = None,
) -> dict:
    """
    Full pipeline:
      1. Extract frames with ffmpeg at FPS
      2. SSIM-based deduplication
      3. Nova AI relevance filter (using keyword)
      4. Upload to GitHub CDN
      5. Record base URL in Supabase

    Returns:
        {
          "base_cdn_url": str,
          "frame_count": int,
          "frame_urls": [str, ...]
        }
    """
    os.makedirs(output_folder, exist_ok=True)

    _log(log_callback, "INFO", f"Extracting frames at {FPS} FPS from {os.path.basename(video_path)}...")
    output_pattern = os.path.join(output_folder, "frame_%04d.png")
    try:
        (
            ffmpeg
            .input(video_path)
            .output(output_pattern, vf=f"fps={FPS}")
            .run(quiet=True, overwrite_output=True)
        )
    except Exception as e:
        _log(log_callback, "ERROR", f"FFmpeg error: {e}")
        raise

    all_frames = sorted([f for f in os.listdir(output_folder) if f.endswith(".png")])
    _log(log_callback, "INFO", f"Found {len(all_frames)} raw frames. Filtering...")

    video_id = os.path.splitext(os.path.basename(video_path))[0]
    prev_frame = None
    processed_count = 0
    frame_urls = []

    for frame_name in all_frames:
        frame_path = os.path.join(output_folder, frame_name)
        curr_frame = cv2.imread(frame_path)
        if curr_frame is None:
            continue

        # SSIM deduplication
        if not is_distinct(prev_frame, curr_frame):
            os.remove(frame_path)
            continue
        prev_frame = curr_frame

        # Nova AI relevance check
        _log(log_callback, "INFO", f"Analyzing {frame_name} with Nova [{keyword}]...")
        nova_result = analyze_frame_with_nova(frame_path, keyword)

        if nova_result is None:
            _log(log_callback, "WARN", f"Nova returned no result for {frame_name}, skipping.")
            continue

        relevant = nova_result.get("relevant", False)
        label    = nova_result.get("label", "unknown")
        conf     = nova_result.get("confidence", 0)

        _log(log_callback, "INFO", f"  → relevant={relevant} label='{label}' conf={conf:.2f}")

        # Upload to GitHub CDN
        seq_name = f"frame_{processed_count + 1:04d}.png"
        cdn_url  = upload_to_github(frame_path, f"frames/{video_id}/{seq_name}")

        if cdn_url:
            frame_urls.append(cdn_url)
            processed_count += 1
            _log(log_callback, "INFO", f"  → Uploaded: {cdn_url}")
        else:
            _log(log_callback, "WARN", f"  → GitHub upload failed for {frame_name}")

    # Store base CDN URL in Supabase
    base_cdn_url = ""
    if GITHUB_REPO:
        base_cdn_url = (
            f"https://raw.githubusercontent.com/{GITHUB_REPO}/{GITHUB_BRANCH}"
            f"/frames/{video_id}/"
        )

    if supabase and base_cdn_url:
        try:
            supabase.table(SUPABASE_TABLE).insert({
                "repo_name": GITHUB_REPO,
                "base_url":  base_cdn_url,
                "number_of_frames": processed_count,
            }).execute()
            _log(log_callback, "INFO", f"Saved to Supabase: {base_cdn_url}")
        except Exception as e:
            _log(log_callback, "WARN", f"Supabase insert failed: {e}")

    _log(log_callback, "INFO", f"Pipeline done. {processed_count} frames uploaded.")

    return {
        "base_cdn_url": base_cdn_url,
        "frame_count":  processed_count,
        "frame_urls":   frame_urls,
    }


# ─── CLI entry point ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    kw = sys.argv[1] if len(sys.argv) > 1 else "object"

    VIDEO_PATH = "input_video.mp4"
    if not os.path.exists(VIDEO_PATH):
        mp4s = [f for f in os.listdir(".") if f.endswith(".mp4")]
        if mp4s:
            VIDEO_PATH = mp4s[0]
        else:
            print("No .mp4 file found.")
            sys.exit(1)

    result = process_video(VIDEO_PATH, keyword=kw)
    print(json.dumps(result, indent=2))
