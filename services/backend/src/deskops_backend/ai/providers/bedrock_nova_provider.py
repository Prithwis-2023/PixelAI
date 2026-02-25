import json


class BedrockNovaProvider:
    def __init__(
        self,
        region: str,
        *,
        aws_access_key_id: str | None = None,
        aws_secret_access_key: str | None = None,
        aws_session_token: str | None = None,
        aws_profile: str | None = None,
    ):
        self._client = None
        self._init_error = None
        try:
            import boto3
            from botocore.config import Config

            if aws_profile:
                session = boto3.Session(profile_name=aws_profile, region_name=region)
                self._client = session.client("bedrock-runtime", config=Config(retries={"max_attempts": 2}))
            else:
                kwargs = {
                    "region_name": region,
                    "config": Config(retries={"max_attempts": 2}),
                }
                if aws_access_key_id and aws_secret_access_key:
                    kwargs["aws_access_key_id"] = aws_access_key_id
                    kwargs["aws_secret_access_key"] = aws_secret_access_key
                if aws_session_token:
                    kwargs["aws_session_token"] = aws_session_token
                self._client = boto3.client("bedrock-runtime", **kwargs)
        except Exception as exc:  # noqa: BLE001
            self._init_error = str(exc)

    def generate(
        self,
        *,
        model_id: str,
        prompt: str,
        max_tokens: int,
        temperature: float,
        timeout_seconds: int,
    ) -> tuple[str, dict]:
        if self._client is None:
            raise RuntimeError(f"bedrock_client_unavailable:{self._init_error}")
        body = {
            "messages": [{"role": "user", "content": [{"text": prompt}]}],
            "inferenceConfig": {
                "maxTokens": max_tokens,
                "temperature": temperature,
            },
        }
        response = self._client.invoke_model(
            modelId=model_id,
            body=json.dumps(body),
            accept="application/json",
            contentType="application/json",
        )
        payload = json.loads(response["body"].read())

        text_output = (
            payload.get("output", {})
            .get("message", {})
            .get("content", [{}])[0]
            .get("text", "")
        )
        usage = payload.get("usage", {})
        return text_output, usage

    @property
    def is_ready(self) -> bool:
        return self._client is not None

    @property
    def init_error(self) -> str | None:
        return self._init_error
