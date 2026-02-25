import pathlib
import sys
import time
import unittest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.workers.outbox_daemon import OutboxDaemon


class FakeWorker:
    def __init__(self):
        self.calls = 0

    def poll_once(self, limit: int, max_attempts: int) -> int:
        self.calls += 1
        return 1


class OutboxDaemonTest(unittest.TestCase):
    def test_daemon_runs_and_stops(self):
        worker = FakeWorker()
        daemon = OutboxDaemon(worker, poll_interval_seconds=0, poll_limit=10, max_attempts=3)
        daemon.start()
        time.sleep(0.01)
        daemon.stop()
        self.assertGreater(worker.calls, 0)
        self.assertGreater(daemon.total_processed_jobs, 0)
        self.assertFalse(daemon.is_running)


if __name__ == "__main__":
    unittest.main()
