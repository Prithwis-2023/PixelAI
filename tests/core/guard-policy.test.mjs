import test from "node:test";
import assert from "node:assert/strict";
import { evaluateGuard } from "../../packages/core/src/guard-policy.mjs";

test("guard blocks when required permissions are missing", () => {
  const result = evaluateGuard({
    permissions: {
      macOSAccessibility: false,
      macOSScreenRecording: true,
      googleSheetsReadWrite: true
    },
    oauth: { expiresAt: "2099-01-01T00:00:00.000Z" },
    runSafety: { detectedDuplicateIdempotencyKey: false, crmSelectorConfidence: 0.95 }
  });

  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasons.includes("missing_macos_accessibility_permission"));
});

test("guard requires confirmation for low selector confidence", () => {
  const result = evaluateGuard({
    permissions: {
      macOSAccessibility: true,
      macOSScreenRecording: true,
      googleSheetsReadWrite: true
    },
    oauth: { expiresAt: "2099-01-01T00:00:00.000Z" },
    runSafety: { detectedDuplicateIdempotencyKey: false, crmSelectorConfidence: 0.8 }
  });

  assert.equal(result.decision, "CONFIRM_REQUIRED");
});

test("guard blocks when oauth expiry format is invalid", () => {
  const result = evaluateGuard({
    permissions: {
      macOSAccessibility: true,
      macOSScreenRecording: true,
      googleSheetsReadWrite: true
    },
    oauth: { expiresAt: "not-a-date" },
    runSafety: { detectedDuplicateIdempotencyKey: false, crmSelectorConfidence: 0.95 }
  });

  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasons.includes("oauth_token_expired"));
});
