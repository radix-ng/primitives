import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';

// Inputs inherited from `RdxPopperContentWrapper` (ADR 0012 thin positioners) carry the base-class
// default expression `this.config.<key> ?? <fallback>`, where `config` is the positioner's own
// `provideRdxPopperContentConfig({...})`. Resolve it so the ArgTypes table shows the real default —
// the same resolution `tools/scripts/skills/api-contract.mjs` applies for `api-contract.json`.
const CONFIG_DEFAULT_RE = /^this\.config\.(\w+)\s*\?\?\s*([\s\S]+)$/;

function parsePositionerConfig(sourceCode?: string): Record<string, string> {
    const match = /provideRdxPopperContentConfig\(\s*\{([\s\S]*?)\}\s*\)/.exec(sourceCode ?? '');
    if (!match) return {};

    const config: Record<string, string> = {};
    for (const pair of match[1].split(',')) {
        const kv = /^\s*(\w+)\s*:\s*([\s\S]+?)\s*$/.exec(pair);
        if (kv) config[kv[1]] = kv[2].trim();
    }
    return config;
}

export default {
    init() {
        const docToCleanup = [...docJson.components, ...docJson.directives];

        // Module-level constants used as input defaults (`input(DEFAULT_MIN)`) — compodoc records their
        // value and type under `miscellaneous.variables`. Map name → { value, type } so the Default
        // column can show the concrete value (and the type can fill an otherwise-empty Type cell).
        // A name with conflicting values across files is left unresolved (value = null).
        const constants = new Map<string, { value: string | null; type: string }>();
        for (const variable of docJson.miscellaneous?.variables ?? []) {
            const value = (variable.defaultValue ?? '').trim();
            const existing = constants.get(variable.name);
            if (!existing) {
                constants.set(variable.name, { value, type: variable.type ?? '' });
            } else if (existing.value !== value) {
                existing.value = null;
            }
        }

        for (const doc of docToCleanup) {
            const config = doc.extends?.includes?.('RdxPopperContentWrapper')
                ? parsePositionerConfig(doc.sourceCode)
                : {};

            for (const input of doc.inputsClass ?? []) {
                // compodoc captures the whole `input(<default>, { …options })` call as the default.
                // Strip a trailing options object so the Default column shows just the value, e.g.
                // `undefined, { alias: 'dir' }` → `undefined`.
                let cleaned = (input.defaultValue ?? '').replace(/,\s*\{[\s\S]*\}\s*$/, '').trim();

                const inherited = CONFIG_DEFAULT_RE.exec(cleaned);
                if (inherited) {
                    // Inputs inherited from a thin positioner: resolve `this.config.<key> ?? <fallback>`.
                    cleaned = (config[inherited[1]] ?? inherited[2]).trim();
                } else if (/^\{[\s\S]*\b(?:alias|transform)\b[\s\S]*\}$/.test(cleaned)) {
                    // `input.required<T>({ alias })` / `input({ transform })` — no real default value;
                    // compodoc captured the options object. Show nothing rather than `{ alias: … }`.
                    cleaned = '';
                }

                // A bare `undefined` default (e.g. `input<T>(undefined, { alias })`) is noise.
                if (cleaned === 'undefined') {
                    cleaned = '';
                }

                // Resolve a named constant default (`input(DEFAULT_MIN)`) to its concrete value, and
                // surface its type in the description when the Type column would otherwise be empty
                // (compodoc can't infer the type of `input(DEFAULT_MIN)` without an explicit generic).
                const constant = constants.get(cleaned);
                if (constant && constant.value) {
                    cleaned = constant.value;
                    if (!input.type && constant.type) {
                        const note = `Type: \`${constant.type}\`.`;
                        input.description = input.description ? `${input.description}\n\n${note}` : note;
                    }
                }

                // Anything that ends up "empty" — no default at all, a stripped options object, or an
                // empty-string default (`input('')`) — renders as a bare `""` (Storybook prints an empty
                // summary as quotes). Normalize every such case to a dash; the type is shown in the
                // adjacent Type column.
                if (cleaned === '' || cleaned === "''" || cleaned === '""') {
                    cleaned = '—';
                }

                input.defaultValue = cleaned;
            }

            doc.propertiesClass = [];
            doc.methodsClass = [];
        }

        setCompodocJson(docJson);
    }
};
