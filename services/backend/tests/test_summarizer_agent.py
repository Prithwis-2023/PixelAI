import pathlib
import sys
import unittest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.ai.agents.summarizer_agent import SummarizerAgent


class SummarizerAgentTest(unittest.TestCase):
    def test_parse_output(self):
        agent = SummarizerAgent()
        raw = '{"day_summary":"done","work_categories":[{"name":"crm","duration_minutes":20,"frequency":4}],"repetitive_patterns":[]}'
        parsed = agent.parse_output(raw)
        self.assertEqual(parsed["day_summary"], "done")

    def test_fallback(self):
        agent = SummarizerAgent()
        out = agent.fallback({"event_count": 3}, "bad_output")
        self.assertIn("day_summary", out)


if __name__ == "__main__":
    unittest.main()
