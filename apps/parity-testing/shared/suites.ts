import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { appRoot, workspaceRoot } from './reference.ts';

const primitivesRoot = join(appRoot, 'primitives');

/** A suite owns its fixtures, scenarios, driver and reviewed differences. */
export function suiteNames(): string[] {
    return readdirSync(primitivesRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(primitivesRoot, entry.name, 'suite.json')))
        .map((entry) => entry.name)
        .sort();
}

export function getSuite(name: string) {
    const names = suiteNames();
    if (!names.includes(name)) {
        throw new Error(`Unknown parity primitive: ${name}. Available: ${names.join(', ')}`);
    }
    const directory = join(primitivesRoot, name);
    const { title, port } = JSON.parse(readFileSync(join(directory, 'suite.json'), 'utf8')) as {
        title: string;
        port: number;
    };
    if (typeof title !== 'string' || !title.trim() || !Number.isInteger(port) || port < 1024 || port > 65535) {
        throw new Error(`Invalid title or port in ${name}/suite.json`);
    }
    const outputDirectory = join(workspaceRoot, 'dist/parity-testing', name);
    return {
        name,
        title,
        port,
        directory,
        fixturesDirectory: join(outputDirectory, 'fixtures'),
        resultsDirectory: join(outputDirectory, 'results')
    };
}

export function suiteFromEnvironment() {
    if (!process.env.PARITY_PRIMITIVE) {
        throw new Error(
            'Set PARITY_PRIMITIVE for direct Vite/Playwright commands, or use pnpm test-parity [primitive].'
        );
    }
    return getSuite(process.env.PARITY_PRIMITIVE);
}
