import type { Settings } from './contract';
import type { NavigationSettings } from './navigation';
const cases: Record<`read-only-${string}`, Settings> = {};
const add = (name: string, settings: Partial<NavigationSettings>) => {
    cases[`read-only-${name}`] = {
        navigation: { kind: 'read-only', autoHighlight: false, loop: true, readOnly: true, ...settings }
    };
};
for (const virtualized of [false, true]) {
    const list = virtualized ? 'virtual' : 'dom';
    for (const mode of ['none', 'list', 'both', 'inline'] as const)
        for (const direction of ['ArrowDown', 'ArrowUp'] as const)
            add(`browse-${list}-${mode}-${direction}`, {
                readOnlyCase: 'browse',
                mode,
                virtualized,
                direction,
                opener: 'arrow'
            });
    for (const mode of ['list', 'both'] as const)
        for (const opener of ['input', 'trigger'] as const)
            add(`browse-${list}-${mode}-${opener}`, {
                readOnlyCase: 'browse',
                mode,
                virtualized,
                opener,
                direction: 'ArrowDown'
            });
    for (const mode of ['both', 'inline'] as const)
        for (const previewOrigin of ['typing', 'keyboard'] as const)
            add(`preview-${list}-${mode}-${previewOrigin}`, {
                readOnlyCase: 'preview',
                mode,
                virtualized,
                previewOrigin,
                readOnly: false,
                autoHighlight: previewOrigin === 'typing'
            });
}
for (const direction of ['ArrowDown', 'ArrowUp'] as const)
    add(`trigger-key-${direction}`, { readOnlyCase: 'browse', mode: 'both', opener: 'trigger-key', direction });
for (const mode of ['none', 'list', 'both', 'inline'] as const)
    add(`enter-without-highlight-${mode}`, { readOnlyCase: 'enter', mode, initialOpen: true });
for (const dir of ['ltr', 'rtl'] as const) {
    add(`grid-${dir}`, { readOnlyCase: 'grid', mode: 'both', grid: true, dir, initialOpen: true });
    for (const grid of [false, true])
        add(`caret-${grid ? 'grid' : 'list'}-${dir}`, {
            readOnlyCase: 'caret',
            mode: 'both',
            grid,
            dir,
            initialOpen: true,
            value: 'Seed'
        });
}
export const readOnlyCases = cases;
