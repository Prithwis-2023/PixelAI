import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const baseUrl = process.env.DESKOPS_BACKEND_URL ?? 'http://localhost:4310';
const parsedBaseUrl = new URL(baseUrl);
const backendPort = parsedBaseUrl.port || '4310';
const isLocalBackendHost =
  parsedBaseUrl.hostname === 'localhost' || parsedBaseUrl.hostname === '127.0.0.1';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(desktopDir, '..', '..', 'services', 'backend');

async function waitForHealth(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        return true;
      }
    } catch {
      // Keep polling while server boots.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function hasRunningBackend() {
  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

function runSmokeBackend() {
  return new Promise((resolve, reject) => {
    const smoke = spawn('node', ['scripts/smoke-backend.mjs'], {
      cwd: desktopDir,
      env: { ...process.env, DESKOPS_BACKEND_URL: baseUrl },
      stdio: 'inherit'
    });
    smoke.on('error', reject);
    smoke.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`smoke backend exited with code ${code}`));
      }
    });
  });
}

async function main() {
  let backendProcess = null;
  try {
    const alreadyRunning = await hasRunningBackend();

    if (!alreadyRunning && isLocalBackendHost) {
      console.log('[smoke:e2e] backend is not running, starting local backend...');
      backendProcess = spawn(
        'uv',
        [
          'run',
          'uvicorn',
          'deskops_backend.main:app',
          '--host',
          '127.0.0.1',
          '--port',
          backendPort,
          '--app-dir',
          'src'
        ],
        {
          cwd: backendDir,
          env: process.env,
          stdio: 'inherit'
        }
      );

      const healthy = await waitForHealth(40000);
      if (!healthy) {
        throw new Error('backend health check did not become ready within 40s');
      }
    } else if (alreadyRunning) {
      console.log('[smoke:e2e] reusing already running backend');
    } else {
      console.log('[smoke:e2e] DESKOPS_BACKEND_URL is not local, skipping auto-start');
    }

    await runSmokeBackend();
    console.log('[smoke:e2e] complete');
  } finally {
    if (backendProcess) {
      backendProcess.kill('SIGTERM');
    }
  }
}

main().catch((error) => {
  console.error(`[smoke:e2e] failed: ${error.message}`);
  process.exit(1);
});
