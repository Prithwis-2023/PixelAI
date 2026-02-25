function isTokenExpired(runContext) {
  if (!runContext.oauth?.expiresAt) return true;
  const expiresAtMs = new Date(runContext.oauth.expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) return true;
  return Date.now() >= expiresAtMs;
}

export function evaluateGuard(runContext) {
  const reasons = [];

  if (!runContext.permissions?.macOSAccessibility) {
    reasons.push("missing_macos_accessibility_permission");
  }
  if (!runContext.permissions?.macOSScreenRecording) {
    reasons.push("missing_screen_recording_permission");
  }
  if (!runContext.permissions?.googleSheetsReadWrite) {
    reasons.push("missing_google_sheets_scope");
  }
  if (isTokenExpired(runContext)) {
    reasons.push("oauth_token_expired");
  }
  if (runContext.runSafety?.detectedDuplicateIdempotencyKey) {
    reasons.push("duplicate_idempotency_key");
  }

  if (reasons.length > 0) {
    return {
      decision: "BLOCK",
      reasons
    };
  }

  if (runContext.runSafety?.crmSelectorConfidence < 0.85) {
    return {
      decision: "CONFIRM_REQUIRED",
      reasons: ["low_selector_confidence"]
    };
  }

  return {
    decision: "ALLOW",
    reasons: []
  };
}
