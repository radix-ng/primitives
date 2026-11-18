import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const stylesheet = 'apps/radix-storybook/.storybook/demo-styles.css';
const read = (file) => readFileSync(path.join(workspaceRoot, file), 'utf8');
const walk = (directory) =>
    readdirSync(path.join(workspaceRoot, directory), { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() && entry.name !== 'node_modules'
            ? walk(path.join(directory, entry.name))
            : entry.isFile()
              ? [path.join(directory, entry.name)]
              : []
    );
export function resolveLocal(from, specifier) {
    if (!specifier.startsWith('.') || specifier.includes('?')) return undefined;
    const base = path.join(path.dirname(from), specifier);
    return [base, `${base}.ts`, `${base}.html`, path.join(base, 'index.ts')].find(
        (file) => existsSync(path.join(workspaceRoot, file)) && /\.(?:ts|html)$/.test(file)
    );
}
export function dependencies(file, found = new Set()) {
    if (found.has(file)) return found;
    found.add(file);
    const text = read(file);
    for (const match of text.matchAll(/(?:from\s*|templateUrl:\s*)['"]([^'"]+)['"]/g)) {
        const dependency = resolveLocal(file, match[1]);
        if (dependency) dependencies(dependency, found);
    }
    return found;
}
export function portableStoryGroups() {
    const groups = [];
    for (const csf of walk('packages/primitives').filter((file) => file.endsWith('.stories.ts'))) {
        const text = read(csf);
        const sources = [...text.matchAll(/import\s+\w+\s+from\s+['"]([^'"]+\?raw)['"]/g)]
            .map((match) => resolveLocal(csf, match[1].replace(/\?raw$/, '')))
            .filter(Boolean);
        const files = new Set(sources.flatMap((file) => [...dependencies(file)]));
        if (
            [...files].some((file) =>
                /\bdemo-(?:button|input|focus|surface|select|accordion|menu|dialog|drawer|toast|combobox|calendar|checkbox|radio|avatar|tooltip|navigation|menubar|cropper|editable|otp|label|arrow)/.test(
                    read(file)
                )
            )
        ) {
            groups.push({ csf, sources, files: [...files] });
        }
    }
    return groups;
}
