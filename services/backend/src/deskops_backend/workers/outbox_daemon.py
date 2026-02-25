import threading
import time


class OutboxDaemon:
    def __init__(self, worker, poll_interval_seconds: int, poll_limit: int, max_attempts: int):
        self.worker = worker
        self.poll_interval_seconds = poll_interval_seconds
        self.poll_limit = poll_limit
        self.max_attempts = max_attempts
        self._stop_event = threading.Event()
        self._thread = None
        self.total_processed_jobs = 0

    @property
    def is_running(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    def _loop(self) -> None:
        while not self._stop_event.is_set():
            processed = self.worker.poll_once(limit=self.poll_limit, max_attempts=self.max_attempts)
            self.total_processed_jobs += processed
            self._stop_event.wait(self.poll_interval_seconds)

    def start(self) -> None:
        if self.is_running:
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._loop, daemon=True, name="outbox-daemon")
        self._thread.start()

    def stop(self, timeout_seconds: float = 2.0) -> None:
        if self._thread is None:
            return
        self._stop_event.set()
        self._thread.join(timeout=timeout_seconds)
        self._thread = None


def run_outbox_daemon_forever(worker, poll_interval_seconds: int, poll_limit: int, max_attempts: int) -> None:
    daemon = OutboxDaemon(
        worker=worker,
        poll_interval_seconds=poll_interval_seconds,
        poll_limit=poll_limit,
        max_attempts=max_attempts,
    )
    daemon.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        daemon.stop()
