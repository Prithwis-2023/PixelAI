const WEIGHTS = {
  successProbability: 0.6,
  inverseRisk: 0.25,
  timeSaved: 0.15
};

function clamp01(value) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function scoreOpportunity(input) {
  const successProbability = clamp01(Number(input.successProbability ?? 0));
  const riskScore = clamp01(Number(input.riskScore ?? 0));
  const normalizedTimeSaved = clamp01(Number(input.normalizedTimeSaved ?? 0));
  const inverseRisk = 1 - riskScore;

  const total =
    successProbability * WEIGHTS.successProbability +
    inverseRisk * WEIGHTS.inverseRisk +
    normalizedTimeSaved * WEIGHTS.timeSaved;

  return {
    score: Number(total.toFixed(4)),
    breakdown: {
      successProbability,
      inverseRisk,
      normalizedTimeSaved
    },
    weights: { ...WEIGHTS }
  };
}

export function rankTopOpportunities(candidates, limit = 3) {
  return [...candidates]
    .map((candidate) => ({
      ...candidate,
      scoring: scoreOpportunity(candidate.metrics)
    }))
    .sort((a, b) => b.scoring.score - a.scoring.score)
    .slice(0, limit);
}
