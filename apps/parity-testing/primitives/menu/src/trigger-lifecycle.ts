export const multiTriggerLifecycleCases = [
    'multi-exit-css',
    'multi-exit-css-retained',
    'multi-exit-deferred',
    'multi-exit-deferred-retained',
    'multi-exit-controlled',
    'multi-exit-controlled-retained',
    'multi-exit-handle',
    'multi-exit-remove-trigger',
    'multi-exit-payload',
    'multi-switch-interrupted',
    'multi-switch-close',
    'multi-switch-remove-root'
] as const;

export function multiTriggerLifecycleConfig(name: string) {
    if (!(multiTriggerLifecycleCases as readonly string[]).includes(name)) return undefined;
    return {
        controlled: name.includes('controlled'),
        retained: name.endsWith('retained'),
        deferred: name.includes('deferred'),
        viewport: name.startsWith('multi-switch-')
    };
}
