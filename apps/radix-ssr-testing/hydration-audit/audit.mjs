import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { closeSync, openSync } from 'node:fs';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';

const option = (name, fallback) => process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;
const phase = 'runtime';
const project = option('project', 'all');
const selected = option('case', undefined);
const port = Number(option('port', '4491'));
if (!['all', 'chromium', 'firefox', 'webkit'].includes(project)) throw new Error(`Unknown project ${project}`);
const fixture = 'apps/radix-ssr-testing/hydration-audit';
const output = resolve('dist/portal-hydration-audit');
const distribution = output;
const environment = { ...process.env, PORTAL_AUDIT_PHASE: phase, PORTAL_AUDIT_PORT: String(port) };
async function command(executable, args) {
    const child = spawn(executable, args, { stdio: 'inherit', env: environment });
    const [code, signal] = await once(child, 'exit');
    if (signal) throw new Error(`${executable} terminated by ${signal}`);
    return code;
}
async function check(executable, args) {
    const code = await command(executable, args);
    if (code !== 0) throw new Error(`${executable} failed with exit code ${code}`);
}

if (!process.argv.includes('--skip-build')) {
    await check('pnpm', ['exec', 'ngc', '-p', `${fixture}/tsconfig.json`, '--noEmit']);
    await check('pnpm', ['exec', 'tsc', '-p', `${fixture}/tsconfig.tools.json`]);
    await check('pnpm', ['exec', 'vite', 'build', '-c', `${fixture}/vite.config.mts`]);
    await check('pnpm', ['exec', 'vite', 'build', '-c', `${fixture}/vite.server.config.mts`]);
}
const browserBuild = JSON.parse(await readFile(resolve(distribution, 'browser/audit-build.json'), 'utf8'));
const serverBuild = JSON.parse(await readFile(resolve(distribution, 'server/audit-build.json'), 'utf8'));
if (JSON.stringify(browserBuild) !== JSON.stringify(serverBuild)) throw new Error('Client/server audit builds differ');
for (const [file, hash] of Object.entries({ ...browserBuild.runtime, ...browserBuild.fixture })) {
    const current = createHash('sha256')
        .update(await readFile(file))
        .digest('hex');
    if (current !== hash) throw new Error(`Stale audit build: ${file}`);
}

// Refuse an occupied port; the audit never reuses or stops an unrelated application.
const socket = createServer();
socket.listen(port, '127.0.0.1');
await once(socket, 'listening');
await new Promise((done, reject) => socket.close((error) => (error ? reject(error) : done())));
await mkdir(resolve(output, 'results'), { recursive: true });
const log = openSync(resolve(output, `results/server-${phase}.log`), 'w');
const preview = spawn('pnpm', ['exec', 'vite', 'preview', '-c', `${fixture}/vite.config.mts`], {
    env: environment,
    stdio: ['ignore', log, log],
    detached: process.platform !== 'win32'
});
try {
    const url = `http://127.0.0.1:${port}`;
    let available = false;
    for (let attempt = 0; attempt < 100; attempt++) {
        if (preview.exitCode !== null) throw new Error('Audit preview exited before startup');
        try {
            const response = await fetch(`${url}/audit-build.json`);
            available = response.ok && (await response.json()).phase === phase;
        } catch {
            // Preview may not have started listening yet.
        }
        if (available) break;
        await setTimeout(100);
    }
    if (!available) throw new Error('Audit preview did not start');
    environment.PORTAL_AUDIT_URL = url;
    for (const engine of project === 'all' ? ['chromium', 'firefox', 'webkit'] : [project]) {
        const report = resolve(output, `results/${phase}-${engine}.json`);
        await rm(report, { force: true });
        const code = await command(process.execPath, [
            `${fixture}/run.ts`,
            `--project=${engine}`,
            ...(selected ? [`--case=${selected}`] : [])
        ]);
        const result = JSON.parse(await readFile(report, 'utf8'));
        if (!result.observations.length) throw new Error(`No observations for ${engine}`);
        if (code !== 0) process.exitCode = 1;
    }
} finally {
    if (preview.pid && preview.exitCode === null) {
        if (process.platform === 'win32') preview.kill();
        else process.kill(-preview.pid, 'SIGTERM');
        await once(preview, 'exit');
    }
    closeSync(log);
}
