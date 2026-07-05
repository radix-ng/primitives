import { setCompodocJson } from '@storybook/addon-docs/angular';
import rawDocJson from '../documentation.json';

// Minimal shape of the slice of compodoc's `documentation.json` this plugin touches. The file is
// 11+ MB, and TypeScript's inference over a JSON literal that large is both slow and unreliable —
// tsserver bails out and widens the default export to `{}`, while `tsc` produces a 150-member union
// whose members lack the fields accessed below. Describing only what we use and casting through
// `unknown` makes the type-check deterministic and cheap, and matches the runtime data (e.g. compodoc
// records `extends` as an array of base-class names).
interface CompodocJsDocTag {
    tagName?: { escapedText?: string };
    comment?: unknown;
}

interface CompodocInput {
    name?: string;
    defaultValue?: string;
    type?: string;
    description?: string;
    jsdoctags?: CompodocJsDocTag[];
}

interface CompodocDoc {
    extends?: string[];
    sourceCode?: string;
    inputsClass?: CompodocInput[];
    propertiesClass?: unknown[];
    methodsClass?: unknown[];
}

interface CompodocVariable {
    name: string;
    defaultValue?: string;
    type?: string;
}

interface CompodocJson {
    components: CompodocDoc[];
    directives: CompodocDoc[];
    miscellaneous?: { variables?: CompodocVariable[] };
}

const docJson = rawDocJson as unknown as CompodocJson;

// Inputs inherited from `RdxPopperContentWrapper` (ADR 0012 thin positioners) carry the base-class
// default expression `this.config.<key> ?? <fallback>`, where `config` is the positioner's own
// `provideRdxPopperContentConfig({...})`. Resolve it so the ArgTypes table shows the real default —
// the same resolution `tools/scripts/skills/api-contract.mjs` applies for `api-contract.json`.
const CONFIG_DEFAULT_RE = /^this\.config\.(\w+)\s*\?\?\s*([\s\S]+)$/;

// A bare `this.config.<key>` (no `?? fallback`) — e.g. `input<number>(this.config.delayMs)`, backed
// by an `injectXxxConfig()` default the plugin can't statically resolve. Storybook coerces the raw
// expression to the input's declared type, so a numeric input renders `this.config.delayMs` as `NaN`.
const BARE_CONFIG_RE = /^this\.config\.(\w+)$/;

// Read the authored `@defaultValue` JSDoc tag (compodoc wraps its comment in HTML, e.g. `<p>0</p>`)
// so an otherwise-unresolvable default can still show its real value.
function jsDocDefault(input: CompodocInput): string {
    const tag = input.jsdoctags?.find((t) => t.tagName?.escapedText === 'defaultValue');
    const comment = typeof tag?.comment === 'string' ? tag.comment : '';
    return comment.replace(/<[^>]+>/g, '').trim();
}

// Inputs that default to an auto-generated unique id (`input(injectId('rdx-…-'))`). The raw
// `injectId('…')` call is meaningless in the Default column — replace it with a clear marker that
// keeps the id prefix as a hint (e.g. `Auto-generated (rdx-progress-label-*)`).
const AUTO_ID_RE = /^injectId\(\s*'([^']*)'\s*\)$/;

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
                const bareConfig = BARE_CONFIG_RE.exec(cleaned);
                if (inherited) {
                    // Inputs inherited from a thin positioner: resolve `this.config.<key> ?? <fallback>`.
                    cleaned = (config[inherited[1]] ?? inherited[2]).trim();
                } else if (bareConfig) {
                    // Bare `this.config.<key>` — resolve to the positioner config value if any, else the
                    // authored `@defaultValue` JSDoc tag (e.g. avatar `delayMs` → `0`), else empty so it
                    // renders as a dash below instead of the raw expression / `NaN`.
                    cleaned = (config[bareConfig[1]] ?? jsDocDefault(input)).trim();
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

                // `injectId('rdx-…-')`: keep the id prefix as a hint in the Default column and explain
                // the auto-generation in the description, rather than crowding the Default cell.
                const autoId = AUTO_ID_RE.exec(cleaned);
                if (autoId) {
                    cleaned = `${autoId[1]}*`;
                    const note = 'Auto-generated unique id when not set.';
                    input.description = input.description ? `${input.description}\n\n${note}` : note;
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
