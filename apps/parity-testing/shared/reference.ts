import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    renameSync,
    rmSync,
    writeFileSync
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export interface ReferenceSpec {
    repository: string;
    commit: string;
    packageVersion: string;
    paths: string[];
}
export interface ReferenceManifest {
    commit: string;
    packageVersion: string;
    digest: string;
}
export interface PreparedReference extends ReferenceManifest {
    directory: string;
}

export const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const workspaceRoot = resolve(appRoot, '../..');
export const reference: ReferenceSpec = JSON.parse(readFileSync(join(appRoot, 'reference.json'), 'utf8'));
const defaultCache = join(workspaceRoot, 'node_modules/.cache/radix-ng-parity');

/** Keep TypeScript and Vite on the same archived sources, without duplicating the commit in paths. */
export function writeReferencePaths(prepared: PreparedReference): void {
    const base = JSON.parse(readFileSync(join(workspaceRoot, 'tsconfig.base.json'), 'utf8')) as {
        compilerOptions: { paths: Record<string, string[]> };
    };
    const paths = Object.fromEntries(
        Object.entries(base.compilerOptions.paths).map(([key, values]) => [
            key,
            values.map((value) => resolve(workspaceRoot, value))
        ])
    );
    paths['@base-ui/react/*'] = [`${prepared.directory}/packages/react/src/*`];
    paths['@base-ui/utils/*'] = [`${prepared.directory}/packages/utils/src/*`];
    writeFileSync(
        join(defaultCache, 'tsconfig.paths.json'),
        `${JSON.stringify(
            {
                extends: join(workspaceRoot, 'tsconfig.base.json'),
                compilerOptions: { paths }
            },
            null,
            2
        )}\n`
    );
}

export function sourceDigest(directory: string): string {
    const hash = createHash('sha256');
    function visit(current: string): void {
        for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) =>
            a.name.localeCompare(b.name, 'en')
        )) {
            const path = join(current, entry.name);
            if (entry.isDirectory()) visit(path);
            else if (entry.name !== '.reference.json') {
                hash.update(relative(directory, path).replaceAll('\\', '/'));
                hash.update('\0');
                hash.update(readFileSync(path));
                hash.update('\0');
            }
        }
    }
    visit(directory);
    return hash.digest('hex');
}

/** Archive committed objects, never a checkout's working files or its node_modules. */
export function prepareReference({
    source = process.env.BASE_UI_SOURCE,
    cacheRoot = defaultCache,
    spec = reference
}: { source?: string; cacheRoot?: string; spec?: ReferenceSpec } = {}): PreparedReference {
    const destination = join(cacheRoot, spec.commit);
    const manifestPath = join(destination, '.reference.json');
    if (existsSync(destination)) {
        const manifest: ReferenceManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        if (manifest.commit !== spec.commit || manifest.digest !== sourceDigest(destination)) {
            throw new Error(
                `Base UI reference cache changed: ${destination}. Remove this cache directory and prepare it again.`
            );
        }
        return { directory: destination, ...manifest };
    }
    mkdirSync(cacheRoot, { recursive: true });
    const temporary = mkdtempSync(join(cacheRoot, 'extract-'));
    try {
        if (!source) {
            source = join(cacheRoot, 'upstream.git');
            if (!existsSync(source)) execFileSync('git', ['init', '--bare', source], { stdio: 'pipe' });
            execFileSync('git', ['-C', source, 'fetch', '--depth=1', spec.repository, spec.commit], { stdio: 'pipe' });
        }
        const archive = execFileSync('git', ['-C', source, 'archive', '--format=tar', spec.commit, ...spec.paths], {
            maxBuffer: 128 * 1024 * 1024
        });
        execFileSync('tar', ['-x', '-C', temporary], { input: archive });
        const packageVersion = JSON.parse(readFileSync(join(temporary, 'packages/react/package.json'), 'utf8')).version;
        if (packageVersion !== spec.packageVersion)
            throw new Error(`Unexpected reference package version: ${packageVersion}`);
        const manifest = { commit: spec.commit, packageVersion, digest: sourceDigest(temporary) };
        writeFileSync(join(temporary, '.reference.json'), `${JSON.stringify(manifest, null, 2)}\n`);
        renameSync(temporary, destination);
        return { directory: destination, ...manifest };
    } finally {
        rmSync(temporary, { recursive: true, force: true });
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const prepared = prepareReference();
    writeReferencePaths(prepared);
    console.log(`Base UI ${prepared.packageVersion} @ ${prepared.commit}\nSHA-256 ${prepared.digest}`);
}
