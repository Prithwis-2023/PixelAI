from deskops_backend.application.container import container
from deskops_backend.settings import settings
from deskops_backend.workers.outbox_daemon import run_outbox_daemon_forever


def main() -> None:
    if not container.outbox_enabled:
        raise SystemExit("Outbox worker is not enabled. Set USE_IN_MEMORY_REPOSITORIES=false.")
    run_outbox_daemon_forever(
        worker=container.outbox_worker,
        poll_interval_seconds=settings.outbox_poll_interval_seconds,
        poll_limit=settings.outbox_poll_limit,
        max_attempts=settings.outbox_max_attempts,
    )


if __name__ == "__main__":
    main()
