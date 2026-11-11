import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { isFloatingSpec } from './test-catalog.ts';

const project = process.env.BROWSER_PROJECT;
if (!project || !['chromium', 'firefox', 'webkit'].includes(project))
    throw new Error('BROWSER_PROJECT must name a desktop engine');
const files: unknown = JSON.parse(process.env.BROWSER_FILES ?? '[]');
if (
    !Array.isArray(files) ||
    files.some(
        (file) =>
            typeof file !== 'string' ||
            !file.startsWith('apps/visual-regression/tests/') ||
            !isFloatingSpec(file) ||
            !existsSync(file)
    )
)
    throw new Error('Invalid selected browser spec paths');
const docs = process.env.RUN_DOCS === 'true';
function run(args: string[]) {
    const result = spawnSync('pnpm', args, { stdio: 'inherit', shell: false });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}
if (files.length || docs) run(['exec', 'nx', 'run', 'radix-storybook:build-storybook']);
if (files.length)
    run([
        'exec',
        'playwright',
        'test',
        '-c',
        'apps/visual-regression/playwright.floating.config.ts',
        `--project=${project}`,
        ...files
    ]);
if (docs)
    run([
        'exec',
        'playwright',
        'test',
        '-c',
        'apps/visual-regression/playwright.docs.config.ts',
        `--project=${project}`
    ]);
