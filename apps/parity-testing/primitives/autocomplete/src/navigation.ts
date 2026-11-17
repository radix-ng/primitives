import type { Settings } from './contract';
export interface NavigationSettings {
    kind: 'list' | 'grid' | 'space' | 'caret' | 'disabled' | 'grid-closed' | 'modifiers' | 'read-only';
    readOnly?: boolean;
    readOnlyCase?: 'browse' | 'preview' | 'enter' | 'grid' | 'caret';
    opener?: 'arrow' | 'input' | 'trigger' | 'trigger-key';
    previewOrigin?: 'typing' | 'keyboard';
    mode?: 'none' | 'list' | 'both' | 'inline';
    autoHighlight: boolean | 'always';
    loop: boolean;
    direction?: 'ArrowDown' | 'ArrowUp';
    virtualized?: boolean;
    initialOpen?: boolean;
    dir?: 'ltr' | 'rtl';
    value?: string;
    grid?: boolean;
    ragged?: boolean;
    disabledAt?: number;
    spaceHighlight?: boolean;
}
const cases: Record<`navigation-${string}`, Settings> = {};
const add = (name: string, navigation: NavigationSettings) => {
    cases[`navigation-${name}`] = { navigation };
};
for (const virtualized of [false, true])
    for (const autoHighlight of [false, true, 'always'] as const)
        for (const loop of [false, true])
            for (const direction of ['ArrowDown', 'ArrowUp'] as const)
                add(
                    `list-${virtualized ? 'virtual' : 'dom'}-${String(autoHighlight)}-${loop ? 'loop' : 'clamp'}-${direction}`,
                    {
                        kind: 'list',
                        virtualized,
                        autoHighlight,
                        loop,
                        direction
                    }
                );
for (const autoHighlight of [false, true, 'always'] as const)
    for (const loop of [false, true])
        for (const direction of ['ArrowDown', 'ArrowUp'] as const)
            add(`list-open-${String(autoHighlight)}-${loop ? 'loop' : 'clamp'}-${direction}`, {
                kind: 'list',
                initialOpen: true,
                autoHighlight,
                loop,
                direction
            });
for (const dir of ['ltr', 'rtl'] as const)
    for (const autoHighlight of [false, 'always'] as const)
        for (const loop of [false, true])
            for (const direction of ['ArrowDown', 'ArrowUp'] as const)
                add(`grid-${dir}-${String(autoHighlight)}-${loop ? 'loop' : 'clamp'}-${direction}`, {
                    kind: 'grid',
                    dir,
                    autoHighlight,
                    loop,
                    direction,
                    initialOpen: true
                });
for (const dir of ['ltr', 'rtl'] as const)
    for (const loop of [false, true])
        for (const direction of ['ArrowDown', 'ArrowUp'] as const)
            add(`grid-ragged-${dir}-${loop ? 'loop' : 'clamp'}-${direction}`, {
                kind: 'grid',
                dir,
                autoHighlight: false,
                loop,
                direction,
                initialOpen: true,
                ragged: true
            });
for (const dir of ['ltr', 'rtl'] as const) {
    add(`grid-closed-${dir}`, { kind: 'grid-closed', dir, autoHighlight: false, loop: true });
    for (const grid of [false, true])
        add(`caret-${grid ? 'grid' : 'list'}-${dir}`, {
            kind: 'caret',
            dir,
            autoHighlight: false,
            loop: true,
            initialOpen: true,
            value: 'draft',
            grid
        });
}
for (const virtualized of [false, true])
    for (const direction of ['ArrowDown', 'ArrowUp'] as const)
        add(`disabled-${virtualized ? 'virtual' : 'dom'}-${direction}`, {
            kind: 'disabled',
            virtualized,
            direction,
            autoHighlight: false,
            loop: true,
            initialOpen: true,
            disabledAt: 1
        });
for (const virtualized of [false, true])
    for (const value of ['', 'draft'])
        for (const spaceHighlight of [false, true])
            add(
                `space-${virtualized ? 'virtual' : 'dom'}-${value ? 'text' : 'empty'}-${spaceHighlight ? 'highlight' : 'none'}`,
                {
                    kind: 'space',
                    virtualized,
                    value,
                    spaceHighlight,
                    autoHighlight: false,
                    loop: true,
                    initialOpen: true
                }
            );
add('modifiers', { kind: 'modifiers', autoHighlight: false, loop: true, initialOpen: true });
export const navigationCases = cases;
export const isGrid = (p: NavigationSettings) => p.kind === 'grid' || p.kind === 'grid-closed' || p.grid === true;
export const navigationItems = (p: NavigationSettings) =>
    isGrid(p)
        ? p.ragged
            ? ['Alpha', 'Beta', 'Gamma', 'Delta']
            : ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']
        : ['Alpha', 'Beta', 'Gamma'];
export function installKeyProbe() {
    document.addEventListener(
        'keydown',
        (event) => {
            if ((event.target as HTMLElement)?.dataset.testid !== 'input') return;
            setTimeout(() =>
                window.autocompleteParity.keys.push({
                    key: event.key,
                    prevented: event.defaultPrevented,
                    trusted: event.isTrusted,
                    ctrl: event.ctrlKey,
                    meta: event.metaKey,
                    alt: event.altKey,
                    shift: event.shiftKey
                })
            );
        },
        true
    );
}
