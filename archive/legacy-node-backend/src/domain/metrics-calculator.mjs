export function calculateSummary(events) {
  const totals = {
    totalEvents: events.length,
    successCount: 0,
    failedCount: 0,
    reviewCount: 0,
    byCategory: {}
  };

  for (const event of events) {
    if (event.result === "success") totals.successCount += 1;
    if (event.result === "failed") totals.failedCount += 1;
    if (event.result === "review") totals.reviewCount += 1;
    totals.byCategory[event.category] = (totals.byCategory[event.category] ?? 0) + 1;
  }

  const denominator = totals.totalEvents || 1;
  return {
    ...totals,
    successRate: Number((totals.successCount / denominator).toFixed(4)),
    failureRate: Number((totals.failedCount / denominator).toFixed(4)),
    reviewRate: Number((totals.reviewCount / denominator).toFixed(4))
  };
}
