import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

/** Always retain command output and launch failures, even when spawn never reaches an executable. */
export async function runLogged(
    label,
    command,
    args,
    { cwd, env = process.env, output, commands, checkpoint = () => {}, allowFailure = false }
) {
    const step = { label, command, args, cwd, log: `${label}.log`, startedAt: new Date().toISOString() };
    commands.push(step);
    let log = '';
    try {
        const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
        for (const stream of [child.stdout, child.stderr]) stream?.on('data', (chunk) => (log += chunk));
        child.on('error', (error) => {
            step.spawnError = { code: error.code ?? null, message: error.message };
            log += `Process launch failed: ${error.code ?? error.name}: ${error.message}\n`;
        });
        step.code = await new Promise((resolve) => child.on('close', resolve));
    } finally {
        step.finishedAt = new Date().toISOString();
        writeFileSync(path.join(output, step.log), log);
        writeFileSync(path.join(output, `${label}.json`), JSON.stringify(step, null, 2) + '\n');
        checkpoint();
    }
    if (!allowFailure && (step.spawnError || step.code !== 0))
        throw new Error(
            `${label}: ${step.spawnError?.code ?? `exit ${step.code}`}; see ${path.join(output, step.log)}\n${log.slice(-3000)}`
        );
    return { ...step, text: log.trim() };
}
