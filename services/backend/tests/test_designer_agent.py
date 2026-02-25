import pathlib
import sys
import unittest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from deskops_backend.ai.agents.designer_agent import DesignerAgent


class DesignerAgentTest(unittest.TestCase):
    def test_parse_output(self):
        agent = DesignerAgent()
        raw = (
            '{"workflow_name":"wf","steps":[{"step_id":"s1","action":"fill","target":"crm"}],'
            '"exception_paths":["x"],"rollback":{"strategy":"manual","checkpoints":["c1"]}}'
        )
        parsed = agent.parse_output(raw)
        self.assertEqual(parsed["workflow_name"], "wf")

    def test_fallback(self):
        agent = DesignerAgent()
        out = agent.fallback({"workflow_name": "w1"}, "error")
        self.assertEqual(out["workflow_name"], "w1")


if __name__ == "__main__":
    unittest.main()
