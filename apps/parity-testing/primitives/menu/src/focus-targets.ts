export type FocusTargetPolicy =
    | 'callback-null'
    | 'callback-undefined'
    | 'detached'
    | 'callback-detached'
    | 'callback-ref';

interface FocusTargetCase {
    layer: 'main' | 'sub';
    policy: FocusTargetPolicy;
    key: 'Escape' | 'Tab' | 'Shift+Tab' | 'outside';
    fresh?: boolean;
    removal?: 'before' | 'close';
}

const definitions = {
    'focus-target-root-null-escape': { layer: 'main', policy: 'callback-null', key: 'Escape' },
    'focus-target-root-undefined-escape': { layer: 'main', policy: 'callback-undefined', key: 'Escape' },
    'focus-target-child-null-escape': { layer: 'sub', policy: 'callback-null', key: 'Escape' },
    'focus-target-child-undefined-escape': { layer: 'sub', policy: 'callback-undefined', key: 'Escape' },
    'focus-target-root-null-fresh': { layer: 'main', policy: 'callback-null', key: 'Escape', fresh: true },
    'focus-target-root-undefined-fresh': { layer: 'main', policy: 'callback-undefined', key: 'Escape', fresh: true },
    'focus-target-child-null-fresh': { layer: 'sub', policy: 'callback-null', key: 'Escape', fresh: true },
    'focus-target-child-undefined-fresh': { layer: 'sub', policy: 'callback-undefined', key: 'Escape', fresh: true },
    'focus-target-root-null-tab': { layer: 'main', policy: 'callback-null', key: 'Tab' },
    'focus-target-root-undefined-tab': { layer: 'main', policy: 'callback-undefined', key: 'Tab' },
    'focus-target-child-null-shift-tab': { layer: 'sub', policy: 'callback-null', key: 'Shift+Tab' },
    'focus-target-child-undefined-shift-tab': { layer: 'sub', policy: 'callback-undefined', key: 'Shift+Tab' },
    'focus-target-root-null-outside': { layer: 'main', policy: 'callback-null', key: 'outside' },
    'focus-target-root-undefined-outside': { layer: 'main', policy: 'callback-undefined', key: 'outside' },
    'focus-target-child-null-outside': { layer: 'sub', policy: 'callback-null', key: 'outside' },
    'focus-target-child-undefined-outside': { layer: 'sub', policy: 'callback-undefined', key: 'outside' },
    'focus-target-root-removed-element': { layer: 'main', policy: 'detached', key: 'Escape', removal: 'before' },
    'focus-target-child-removed-element': { layer: 'sub', policy: 'detached', key: 'Escape', removal: 'before' },
    'focus-target-root-removed-callback': {
        layer: 'main',
        policy: 'callback-detached',
        key: 'Escape',
        removal: 'before'
    },
    'focus-target-child-removed-callback': {
        layer: 'sub',
        policy: 'callback-detached',
        key: 'Escape',
        removal: 'before'
    },
    'focus-target-root-empty-ref': { layer: 'main', policy: 'callback-ref', key: 'Escape', removal: 'before' },
    'focus-target-child-empty-ref': { layer: 'sub', policy: 'callback-ref', key: 'Escape', removal: 'before' },
    'focus-target-root-remove-on-close': { layer: 'main', policy: 'detached', key: 'Escape', removal: 'close' },
    'focus-target-child-remove-on-close': { layer: 'sub', policy: 'detached', key: 'Escape', removal: 'close' }
} as const satisfies Record<string, FocusTargetCase>;

export const focusTargetCases = Object.keys(definitions) as (keyof typeof definitions)[];

export function focusTargetConfig(name: string): FocusTargetCase | undefined {
    return Object.hasOwn(definitions, name) ? definitions[name as keyof typeof definitions] : undefined;
}
