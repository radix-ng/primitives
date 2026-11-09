import { execFileSync, type ExecFileSyncOptions } from 'node:child_process';
import { relative } from 'node:path';
import { prepareReference, workspaceRoot, writeReferencePaths } from './shared/reference.ts';
import { getSuite, suiteNames } from './shared/suites.ts';

try {
    const buildOnly = process.argv.includes('--build-only');
    const args = process.argv.slice(2).filter((arg) => arg !== '--build-only');
    const primitive = args[0] && !args[0].startsWith('-') ? args.shift() : undefined;
    const suites = (primitive ? [primitive] : suiteNames()).map(getSuite);
    if (!suites.length) throw new Error('No parity suites found in primitives/.');
    const prepared = prepareReference();
    writeReferencePaths(prepared);
    console.log(`Parity reference: Base UI ${prepared.commit} (${prepared.digest})`);
    for (const suite of suites) {
        console.log(`\n${suite.title} parity`);
        const options: ExecFileSyncOptions = {
            cwd: workspaceRoot,
            stdio: 'inherit',
            env: { ...process.env, PARITY_PRIMITIVE: suite.name }
        };
        execFileSync(
            'pnpm',
            ['exec', 'ngc', '-p', relative(workspaceRoot, `${suite.directory}/tsconfig.json`), '--noEmit'],
            options
        );
        execFileSync('pnpm', ['exec', 'vite', 'build', '--config', 'apps/parity-testing/vite.config.mts'], options);
        if (!buildOnly) {
            execFileSync(
                'pnpm',
                ['exec', 'playwright', 'test', '--config', 'apps/parity-testing/playwright.config.ts', ...args],
                options
            );
        }
    }
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode =
        typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number'
            ? error.status
            : 1;
}
