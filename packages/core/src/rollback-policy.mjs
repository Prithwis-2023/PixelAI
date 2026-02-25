export function resolveFailureAction(failure) {
  switch (failure.type) {
    case "PRE_SUBMIT_VALIDATION":
      return {
        action: "ABORT",
        rollbackNeeded: false,
        nextStep: "prompt_user_to_fix_input"
      };
    case "POST_SUBMIT_UNCERTAIN":
      return {
        action: "HUMAN_REVIEW",
        rollbackNeeded: false,
        nextStep: "run_read_after_write_verification"
      };
    case "DUPLICATE_DETECTED":
      return {
        action: "ABORT",
        rollbackNeeded: false,
        nextStep: "mark_as_duplicate_and_skip"
      };
    case "PARTIAL_SUCCESS":
      return {
        action: "RETRY_FROM_CHECKPOINT",
        rollbackNeeded: false,
        nextStep: "resume_from_failed_step"
      };
    case "AUTH_ERROR":
      return {
        action: "ABORT",
        rollbackNeeded: false,
        nextStep: "reauthenticate_google_oauth"
      };
    default:
      return {
        action: "HUMAN_REVIEW",
        rollbackNeeded: false,
        nextStep: "capture_diagnostics_and_pause"
      };
  }
}
