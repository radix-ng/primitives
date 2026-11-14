import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export const workspaceRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
export function revision() {
    const git = (args: string[]) => execFileSync('git', args, { cwd: workspaceRoot, encoding: 'utf8' });
    const hash = createHash('sha256');
    for (const root of [
        'tools/agent-testing',
        'tools/playwright',
        'apps/radix-playground/src/app/agent-runtime',
        'apps/radix-playground/src/app/pages'
    ]) {
        function visit(path: string) {
            for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) =>
                a.name.localeCompare(b.name, 'en')
            )) {
                const file = join(path, entry.name);
                if (entry.isDirectory()) visit(file);
                else {
                    hash.update(relative(workspaceRoot, file));
                    hash.update('\0');
                    hash.update(readFileSync(file));
                    hash.update('\0');
                }
            }
        }
        visit(join(workspaceRoot, root));
    }
    return {
        commit: git(['rev-parse', 'HEAD']).trim(),
        dirty: Boolean(git(['status', '--porcelain']).trim()),
        patchSha256: createHash('sha256')
            .update(git(['diff', '--binary', 'HEAD']))
            .digest('hex'),
        sourceSha256: hash.digest('hex')
    };
}

/** Reports receive only allowlisted configuration. Exact secrets are redacted again before serialization. */
export function artifactWriter(root: string, label: string, secrets: readonly string[] = []) {
    mkdirSync(root, { recursive: true });
    const directory = mkdtempSync(join(root, `${label.replace(/[^a-z0-9_-]/gi, '_')}-`));
    const serialize = (value: unknown) =>
        JSON.stringify(
            value,
            (_key, item: unknown) =>
                typeof item === 'string'
                    ? secrets.filter(Boolean).reduce((text, secret) => text.replaceAll(secret, '[REDACTED]'), item)
                    : item,
            2
        );
    return {
        directory,
        json(name: string, value: unknown) {
            writeFileSync(join(directory, name), serialize(value) + '\n', { mode: 0o600 });
        },
        event(event: unknown) {
            appendFileSync(join(directory, 'events.jsonl'), JSON.stringify(JSON.parse(serialize(event))) + '\n', {
                mode: 0o600
            });
        }
    };
}
