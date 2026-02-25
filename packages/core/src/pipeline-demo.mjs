import { rankTopOpportunities } from "./opportunity-score.mjs";
import { evaluateGuard } from "./guard-policy.mjs";
import { resolveFailureAction } from "./rollback-policy.mjs";

const candidates = [
  {
    candidateId: "cand_01",
    name: "Sheets row to CRM contact update",
    metrics: {
      successProbability: 0.9,
      riskScore: 0.2,
      normalizedTimeSaved: 0.6
    }
  },
  {
    candidateId: "cand_02",
    name: "Daily lead status sync",
    metrics: {
      successProbability: 0.8,
      riskScore: 0.35,
      normalizedTimeSaved: 0.7
    }
  }
];

const top = rankTopOpportunities(candidates, 3);
console.log("Top candidates:", top.map((c) => ({ id: c.candidateId, score: c.scoring.score })));

const guardResult = evaluateGuard({
  permissions: {
    macOSAccessibility: true,
    macOSScreenRecording: true,
    googleSheetsReadWrite: true
  },
  oauth: {
    expiresAt: "2099-01-01T00:00:00.000Z"
  },
  runSafety: {
    detectedDuplicateIdempotencyKey: false,
    crmSelectorConfidence: 0.9
  }
});
console.log("Guard decision:", guardResult);

const failureResolution = resolveFailureAction({ type: "POST_SUBMIT_UNCERTAIN" });
console.log("Failure resolution:", failureResolution);
