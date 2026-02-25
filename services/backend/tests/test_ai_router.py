import pathlib
import sys
import unittest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.ai.router import AiRouter


class FakeProvider:
    def generate(self, **kwargs):
        return '{"ok":true}', {"inputTokens": 10, "outputTokens": 12}


class AiRouterTest(unittest.TestCase):
    def test_generate_returns_text_usage_and_latency(self):
        router = AiRouter(
            provider=FakeProvider(),
            model_id="amazon.nova-lite-v1:0",
            max_tokens=200,
            temperature=0.2,
            timeout_seconds=10,
        )
        result = router.generate("hello")
        self.assertIn("text_output", result)
        self.assertIn("usage", result)
        self.assertIn("latency_ms", result)
        self.assertEqual(result["model_id"], "amazon.nova-lite-v1:0")


if __name__ == "__main__":
    unittest.main()
