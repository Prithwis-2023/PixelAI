import os
import uuid
import asyncio
import zipfile
import io
import json
from typing import Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from sse_starlette.sse import EventSourceResponse

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.api.v1 import auth, users

# ─── In-memory job store ───────────────────────────────────────────────────────
# job_id -> { status, keyword, video_path, result, log_queue }
jobs: Dict[str, Dict[str, Any]] = {}

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
DATASETS_DIR = os.path.join(os.path.dirname(__file__), "datasets")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DATASETS_DIR, exist_ok=True)

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="Pixel AI Backend", version="1.0.0")

app.mount("/static", StaticFiles(directory=DATASETS_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_job(job_id: str) -> Dict[str, Any]:
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")
    return jobs[job_id]


async def _push_log(queue: asyncio.Queue, level: str, msg: str):
    """Push a log entry to the job's SSE queue."""
    await queue.put({"level": level, "msg": msg})


# ─── Background pipeline task ─────────────────────────────────────────────────

async def _run_pipeline(job_id: str):
    job = jobs[job_id]
    queue: asyncio.Queue = job["log_queue"]
    keyword: str = job["keyword"]
    video_path: str = job["video_path"]

    try:
        job["status"] = "processing"

        await _push_log(queue, "INFO", f"Pipeline started for job {job_id}")
        await _push_log(queue, "INFO", f"Keyword: {keyword}")
        await _push_log(queue, "INFO", f"Video: {os.path.basename(video_path)}")

        # Import here to avoid circular deps and allow reload
        from extract_frames_nova import process_video

        # Run blocking code in executor to not block the event loop
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: process_video(
                video_path=video_path,
                keyword=keyword,
                output_folder=os.path.join(os.path.dirname(__file__), "temp_frames", job_id),
                log_callback=lambda lvl, msg: asyncio.run_coroutine_threadsafe(
                    _push_log(queue, lvl, msg), loop
                ).result(),
            )
        )

        job["result"] = result
        job["status"] = "done"
        await _push_log(queue, "SUCCESS", f"Extraction complete. {result.get('frame_count', 0)} frames uploaded.")

    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)
        await _push_log(queue, "ERROR", f"Pipeline failed: {e}")
    finally:
        # Signal SSE stream to close
        await queue.put(None)


async def _run_labeling(job_id: str):
    job = jobs[job_id]
    queue: asyncio.Queue = job["log_queue"]
    keyword: str = job["keyword"]
    result = job.get("result", {})

    base_url = result.get("base_cdn_url", "")
    num_frames = result.get("frame_count", 0)
    dataset_dir = os.path.join(os.path.dirname(__file__), "datasets", job_id)

    try:
        job["label_status"] = "labeling"
        await _push_log(queue, "INFO", f"Starting YOLO labeling for {num_frames} frames...")

        from label_frames_yolo import run_labeling
        loop = asyncio.get_event_loop()

        dataset_report = await loop.run_in_executor(
            None,
            lambda: run_labeling(
                keyword=keyword,
                base_url=base_url,
                num_frames=num_frames,
                dataset_dir=dataset_dir,
                log_callback=lambda lvl, msg: asyncio.run_coroutine_threadsafe(
                    _push_log(queue, lvl, msg), loop
                ).result(),
            )
        )

        job["dataset_dir"] = dataset_dir
        job["dataset_report"] = dataset_report
        job["label_status"] = "done"
        await _push_log(queue, "SUCCESS", "Labeling complete. Dataset ready for download.")

    except Exception as e:
        job["label_status"] = "error"
        await _push_log(queue, "ERROR", f"Labeling failed: {e}")
    finally:
        await queue.put(None)


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.post("/upload")
async def upload_video(
    video: UploadFile = File(...),
    keyword: str = Form(...),
):
    """
    Receive a video file + keyword. Save to disk. Return a job_id.
    """
    if not video.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    job_id = str(uuid.uuid4())[:8]

    # Save video
    ext = os.path.splitext(video.filename)[-1] or ".mp4"
    save_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")
    contents = await video.read()
    with open(save_path, "wb") as f:
        f.write(contents)

    # Create job entry
    jobs[job_id] = {
        "job_id": job_id,
        "keyword": keyword.strip(),
        "video_path": save_path,
        "video_name": video.filename,
        "video_size_mb": round(len(contents) / (1024 * 1024), 2),
        "status": "uploaded",
        "label_status": "pending",
        "result": None,
        "dataset_dir": None,
        "log_queue": asyncio.Queue(),
    }

    return {
        "job_id": job_id,
        "video_name": video.filename,
        "video_size_mb": jobs[job_id]["video_size_mb"],
        "keyword": keyword.strip(),
        "status": "uploaded",
    }


@app.post("/process/{job_id}")
async def start_processing(job_id: str, background_tasks: BackgroundTasks):
    """
    Kick off frame extraction + Nova + GitHub + Supabase pipeline in background.
    """
    job = _get_job(job_id)
    if job["status"] not in ("uploaded", "error"):
        raise HTTPException(status_code=409, detail=f"Job is already {job['status']}")

    # Reset the queue for a new stream session
    job["log_queue"] = asyncio.Queue()
    background_tasks.add_task(_run_pipeline, job_id)

    return {"job_id": job_id, "status": "processing"}


@app.get("/stream/{job_id}")
async def stream_logs(job_id: str):
    """
    SSE endpoint — streams log lines until pipeline finishes.
    """
    job = _get_job(job_id)
    queue: asyncio.Queue = job["log_queue"]

    async def event_generator():
        while True:
            entry = await queue.get()
            if entry is None:
                # Done signal
                yield {"data": json.dumps({"level": "DONE", "msg": "Pipeline finished"})}
                break
            yield {"data": json.dumps(entry)}

    return EventSourceResponse(event_generator())


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    """Poll-based status endpoint."""
    job = _get_job(job_id)
    return {
        "job_id": job_id,
        "status": job["status"],
        "label_status": job.get("label_status", "pending"),
        "keyword": job["keyword"],
        "video_name": job["video_name"],
        "video_size_mb": job["video_size_mb"],
        "result": job.get("result"),
    }


@app.get("/frames/{job_id}")
async def get_frames(job_id: str):
    """Return list of CDN frame URLs for a completed job."""
    job = _get_job(job_id)
    result = job.get("result")
    if not result:
        raise HTTPException(status_code=425, detail="Processing not yet complete")

    frame_urls = result.get("frame_urls", [])
    return {
        "job_id": job_id,
        "keyword": job["keyword"],
        "frame_count": result.get("frame_count", 0),
        "base_cdn_url": result.get("base_cdn_url", ""),
        "frames": [{"id": i + 1, "url": url} for i, url in enumerate(frame_urls)],
    }


@app.post("/label/{job_id}")
async def label_frames(job_id: str, background_tasks: BackgroundTasks):
    """Trigger YOLO auto-labeling on the extracted frames."""
    job = _get_job(job_id)
    if job["status"] != "done":
        raise HTTPException(status_code=425, detail="Extraction not yet complete")
    if job.get("label_status") == "labeling":
        raise HTTPException(status_code=409, detail="Labeling already in progress")

    # Reset queue for labeling logs
    job["log_queue"] = asyncio.Queue()
    background_tasks.add_task(_run_labeling, job_id)

    return {"job_id": job_id, "label_status": "labeling"}


@app.get("/download/{job_id}")
async def download_dataset(job_id: str):
    """Stream the labeled dataset as a ZIP file."""
    job = _get_job(job_id)
    dataset_dir = job.get("dataset_dir")

    if not dataset_dir or not os.path.exists(dataset_dir):
        raise HTTPException(status_code=404, detail="Dataset not found. Run /label first.")

    def generate_zip():
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, _, files in os.walk(dataset_dir):
                for fname in files:
                    fpath = os.path.join(root, fname)
                    arcname = os.path.relpath(fpath, dataset_dir)
                    zf.write(fpath, arcname)
        buf.seek(0)
        yield buf.read()

    keyword = job["keyword"]
    filename = f"pixel_dataset_{keyword}_{job_id}.zip"
    return StreamingResponse(
        generate_zip(),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/annotated/{job_id}")
async def get_annotated_frames(job_id: str):
    """Return list of annotated frame URLs for a completed labeling job."""
    job = _get_job(job_id)
    report = job.get("dataset_report")
    if not report:
        return {"frames": []}
    
    urls = [
        f"http://localhost:8000/static/{job_id}/annotated/{f}"
        for f in report.get("annotated_frames", [])
    ]
    return {
        "job_id": job_id,
        "frames": [{"id": i + 1, "url": u} for i, u in enumerate(urls)]
    }

@app.get("/health")
async def health():
    return {"status": "ok"}


# ─── Entry point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
