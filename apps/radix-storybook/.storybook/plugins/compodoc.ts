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

        for (const doc of docToCleanup) {
            const config = doc.extends?.includes?.('RdxPopperContentWrapper')
                ? parsePositionerConfig(doc.sourceCode)
                : {};

            for (const input of doc.inputsClass ?? []) {
                const cleaned = (input.defaultValue ?? '').replace(/,\s*\{[\s\S]*\}\s*$/, '').trim();
                const inherited = CONFIG_DEFAULT_RE.exec(cleaned);
                if (inherited) {
                    input.defaultValue = (config[inherited[1]] ?? inherited[2]).trim();
                }
            }

            doc.propertiesClass = [];
            doc.methodsClass = [];
        }

        setCompodocJson(docJson);
    }
};
