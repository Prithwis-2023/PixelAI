const baseUrl = process.env.DESKOPS_BACKEND_URL ?? 'http://localhost:4310';

function makeEvent(eventId, result = 'success') {
  return {
    eventId,
    occurredAt: new Date().toISOString(),
    category: 'window_switch',
    result,
    source: 'desktop-agent'
  };
}

async function expectStatus(name, response, expected) {
  if (response.status !== expected) {
    const body = await response.text();
    throw new Error(`${name}: expected ${expected}, got ${response.status}, body=${body}`);
  }
}

async function postEvent(payload) {
  return fetch(`${baseUrl}/v1/telemetry/events`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function run() {
  console.log(`[smoke] base url: ${baseUrl}`);

  const health = await fetch(`${baseUrl}/health`);
  await expectStatus('health', health, 200);
  console.log('[smoke] health ok');

  const eventId = `evt_smoke_${Date.now()}`;
  await expectStatus('telemetry valid', await postEvent(makeEvent(eventId)), 202);
  console.log('[smoke] telemetry valid -> 202');

  await expectStatus('telemetry duplicate', await postEvent(makeEvent(eventId)), 409);
  console.log('[smoke] telemetry duplicate -> 409');

  await expectStatus(
    'telemetry invalid_result',
    await postEvent(makeEvent(`evt_smoke_invalid_${Date.now()}`, 'not_allowed')),
    400
  );
  console.log('[smoke] telemetry invalid_result -> 400');
}

run().catch((error) => {
  console.error(`[smoke] failed: ${error.message}`);
  process.exit(1);
});
