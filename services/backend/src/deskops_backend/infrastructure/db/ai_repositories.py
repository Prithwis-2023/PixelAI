import json

from sqlalchemy import select

from deskops_backend.infrastructure.db.tables import AiOutputRow, AiRunRow, PromptVersionRow


class InMemoryAiRepository:
    def __init__(self):
        self._runs: list[dict] = []
        self._outputs: list[dict] = []
        self._prompts: dict[str, dict] = {}

    def create_run(
        self,
        *,
        task: str,
        provider: str,
        model_id: str,
        status: str,
        latency_ms: int,
        error_message: str | None,
        input_metadata: dict,
        usage: dict | None,
    ) -> int:
        run_id = len(self._runs) + 1
        self._runs.append(
            {
                "id": run_id,
                "task": task,
                "provider": provider,
                "model_id": model_id,
                "status": status,
                "latency_ms": latency_ms,
                "error_message": error_message,
                "input_metadata": input_metadata,
                "usage": usage,
            }
        )
        return run_id

    def save_output(
        self,
        *,
        run_id: int,
        task: str,
        prompt_version: str,
        schema_valid: bool,
        fallback_used: bool,
        output_payload: dict,
    ) -> int:
        output_id = len(self._outputs) + 1
        self._outputs.append(
            {
                "id": output_id,
                "run_id": run_id,
                "task": task,
                "prompt_version": prompt_version,
                "schema_valid": schema_valid,
                "fallback_used": fallback_used,
                "output_payload": output_payload,
            }
        )
        return output_id

    def list_runs(self) -> list[dict]:
        return list(self._runs)

    def save_prompt_version(self, *, task: str, version: str, content: str) -> None:
        self._prompts[version] = {"task": task, "version": version, "content": content}

    def list_prompt_versions(self) -> list[dict]:
        return list(self._prompts.values())


class PostgresAiRepository:
    def __init__(self, session_factory=None):
        self._session_factory = session_factory

    def _get_session_factory(self):
        if self._session_factory is not None:
            return self._session_factory
        from deskops_backend.infrastructure.db.session import SessionLocal

        return SessionLocal

    def create_run(
        self,
        *,
        task: str,
        provider: str,
        model_id: str,
        status: str,
        latency_ms: int,
        error_message: str | None,
        input_metadata: dict,
        usage: dict | None,
    ) -> int:
        SessionFactory = self._get_session_factory()
        with SessionFactory.begin() as session:
            row = AiRunRow(
                task=task,
                provider=provider,
                model_id=model_id,
                status=status,
                latency_ms=latency_ms,
                error_message=error_message,
                input_metadata_json=json.dumps(input_metadata, ensure_ascii=True),
                usage_json=json.dumps(usage, ensure_ascii=True) if usage is not None else None,
            )
            session.add(row)
            session.flush()
            return int(row.id)

    def save_output(
        self,
        *,
        run_id: int,
        task: str,
        prompt_version: str,
        schema_valid: bool,
        fallback_used: bool,
        output_payload: dict,
    ) -> int:
        SessionFactory = self._get_session_factory()
        with SessionFactory.begin() as session:
            row = AiOutputRow(
                run_id=run_id,
                task=task,
                prompt_version=prompt_version,
                schema_valid=schema_valid,
                fallback_used=fallback_used,
                output_json=json.dumps(output_payload, ensure_ascii=True),
            )
            session.add(row)
            session.flush()
            return int(row.id)

    def list_runs(self) -> list[dict]:
        SessionFactory = self._get_session_factory()
        with SessionFactory() as session:
            rows = session.scalars(select(AiRunRow).order_by(AiRunRow.id.desc()).limit(200)).all()
            return [
                {
                    "id": row.id,
                    "task": row.task,
                    "provider": row.provider,
                    "model_id": row.model_id,
                    "status": row.status,
                    "latency_ms": row.latency_ms,
                    "error_message": row.error_message,
                }
                for row in rows
            ]

    def save_prompt_version(self, *, task: str, version: str, content: str) -> None:
        SessionFactory = self._get_session_factory()
        with SessionFactory.begin() as session:
            existing = session.scalar(select(PromptVersionRow).where(PromptVersionRow.version == version))
            if existing is not None:
                return
            session.add(PromptVersionRow(task=task, version=version, content=content))

    def list_prompt_versions(self) -> list[dict]:
        SessionFactory = self._get_session_factory()
        with SessionFactory() as session:
            rows = session.scalars(select(PromptVersionRow).order_by(PromptVersionRow.id.desc())).all()
            return [
                {"task": row.task, "version": row.version, "created_at": row.created_at.isoformat()} for row in rows
            ]
