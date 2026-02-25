import test from "node:test";
import assert from "node:assert/strict";
import { rankTopOpportunities, scoreOpportunity } from "../../packages/core/src/opportunity-score.mjs";

test("scoreOpportunity favors success probability", () => {
  const highSuccess = scoreOpportunity({
    successProbability: 0.95,
    riskScore: 0.5,
    normalizedTimeSaved: 0.4
  });
  const lowSuccess = scoreOpportunity({
    successProbability: 0.7,
    riskScore: 0.6,
    normalizedTimeSaved: 0.8
  });

  assert.ok(highSuccess.score > lowSuccess.score);
});

test("rankTopOpportunities returns descending order", () => {
  const ranked = rankTopOpportunities([
    { candidateId: "a", metrics: { successProbability: 0.6, riskScore: 0.2, normalizedTimeSaved: 0.7 } },
    { candidateId: "b", metrics: { successProbability: 0.9, riskScore: 0.4, normalizedTimeSaved: 0.4 } }
  ]);

  assert.equal(ranked[0].candidateId, "b");
});
