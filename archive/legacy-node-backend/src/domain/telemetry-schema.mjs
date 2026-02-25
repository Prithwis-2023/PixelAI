export function validateTelemetryEvent(event) {
  const required = ["eventId", "occurredAt", "category", "result"];
  for (const key of required) {
    if (!event || typeof event[key] !== "string" || event[key].trim() === "") {
      return { valid: false, reason: `missing_or_invalid_${key}` };
    }
  }

  if (!["success", "failed", "review"].includes(event.result)) {
    return { valid: false, reason: "invalid_result" };
  }

  if (Number.isNaN(new Date(event.occurredAt).getTime())) {
    return { valid: false, reason: "invalid_occurredAt" };
  }

  return { valid: true };
}
