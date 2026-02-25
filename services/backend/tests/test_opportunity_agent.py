import pathlib
import sys
import unittest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.ai.agents.opportunity_agent import OpportunityAgent


class OpportunityAgentTest(unittest.TestCase):
    def test_parse_output(self):
        agent = OpportunityAgent()
        raw = (
            '{"candidates":[{"candidate_id":"c1","name":"x","success_probability":0.8,'
            '"risk_score":0.2,"normalized_time_saved":0.5,"score":0.73,"reason":"ok"}]}'
        )
        parsed = agent.parse_output(raw)
        self.assertEqual(parsed["candidates"][0]["candidate_id"], "c1")

    def test_fallback(self):
        agent = OpportunityAgent()
        out = agent.fallback({}, "failed")
        self.assertGreaterEqual(len(out["candidates"]), 1)


if __name__ == "__main__":
    unittest.main()
