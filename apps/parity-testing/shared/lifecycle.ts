// Shared fixture settings only. Each primitive owns its state, actions and observed contract.
export const lifecycleCases = [
    'lifecycle-keep',
    'lifecycle-css-exit',
    'lifecycle-css-keep',
    'lifecycle-deferred',
    'lifecycle-deferred-keep',
    'lifecycle-fast-reopen',
    'lifecycle-cancel-hold',
    'lifecycle-late-hold',
    'lifecycle-reopen-css',
    'lifecycle-modal-keep'
] as const;
export type LifecycleCase = (typeof lifecycleCases)[number];

export function lifecycleConfig(name: string) {
    if (!lifecycleCases.includes(name as LifecycleCase)) return undefined;
    return {
        keepMounted: name.endsWith('keep'),
        animated: ['lifecycle-css-exit', 'lifecycle-css-keep', 'lifecycle-reopen-css', 'lifecycle-late-hold'].includes(
            name
        ),
        deferred: name.includes('deferred') || name === 'lifecycle-fast-reopen',
        canceled: name === 'lifecycle-cancel-hold',
        late: name === 'lifecycle-late-hold'
    };
}

// A real CSS exit with a measurable duration; both implementations observe its natural finish.
export const exitClass = ' data-[ending-style]:animate-[pulse_400ms_linear]';

// Hold a real CSS exit until the scenario finishes it through native WAAPI or removes its Root.
export const heldExitClass =
    ' data-[ending-style]:animate-[pulse_30s_linear] data-[ending-style]:[animation-play-state:paused]';
