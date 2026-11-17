import type { Settings } from './contract';
export interface ValueSettings {
    kind: 'defaults' | 'initial' | 'external' | 'typing' | 'hover' | 'escape' | 'select' | 'mode' | 'external-preview';
    controlled: boolean;
    mode?: 'list' | 'both' | 'inline' | 'none';
    value?: string;
    autoHighlight?: boolean | 'always';
    virtualized?: boolean;
}
export const valueItems = ['Alpha', 'Alpine', 'Beta', 'Gamma'];
const cases: Record<`value-${string}`, Settings> = {};
const add = (name: string, value: ValueSettings) => {
    cases[`value-${name}`] = { valueState: value };
};
add('defaults', { kind: 'defaults', controlled: false, value: ' Beta ' });
for (const controlled of [false, true]) {
    const owner = controlled ? 'controlled' : 'uncontrolled';
    for (const mode of ['list', 'both', 'inline', 'none'] as const) {
        for (const value of [' Beta ', '   '])
            add(`initial-${owner}-${mode}-${value.trim() ? 'padded' : 'blank'}`, {
                kind: 'initial',
                controlled,
                mode,
                value
            });
        for (const autoHighlight of [false, true, 'always'] as const)
            add(`typing-${owner}-${mode}-${String(autoHighlight)}`, {
                kind: 'typing',
                controlled,
                mode,
                autoHighlight
            });
    }
    for (const mode of ['both', 'inline'] as const) {
        for (const kind of ['hover', 'escape', 'select', 'mode'] as const)
            add(`${kind}-${owner}-${mode}`, { kind, controlled, mode });
        add(`typing-virtual-${owner}-${mode}`, {
            kind: 'typing',
            controlled,
            mode,
            autoHighlight: true,
            virtualized: true
        });
    }
    for (const mode of ['list', 'both'] as const)
        add(`initial-virtual-${owner}-${mode}`, {
            kind: 'initial',
            controlled,
            mode,
            value: ' Beta ',
            virtualized: true
        });
}
for (const mode of ['list', 'both', 'inline', 'none'] as const)
    add(`external-${mode}`, { kind: 'external', controlled: true, mode, value: 'Beta' });
for (const mode of ['both', 'inline'] as const)
    add(`external-preview-${mode}`, { kind: 'external-preview', controlled: true, mode });
export const valueCases = cases;
