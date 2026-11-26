export type Value = number | number[];
export type Collision = 'push' | 'swap' | 'none';
export type Alignment = 'center' | 'edge' | 'edge-client-only';

type Notification = { value: Value; reason: string; eventType: string };
type Change = Notification & { activeThumbIndex: number; target: { name: string; value: Value } };

interface Probe {
    reference: { commit: string; packageVersion: string; digest: string };
    changes: Change[];
    commits: Notification[];
    native: string[];
    cancelsChange: boolean;
    cancelsReset: boolean;
}

declare global {
    const __PARITY_REFERENCE__: Probe['reference'];
    interface Window {
        sliderParity: Probe;
    }
}

export const scenario = new URLSearchParams(location.search).get('case') ?? '';
export const collision: Collision = scenario === 'swap' || scenario === 'none' ? scenario : 'push';
export const alignment: Alignment = scenario === 'edge' || scenario === 'edge-client-only' ? scenario : 'center';
export const field = scenario === 'field' || scenario === 'fieldset-disabled';
export const range = ['push', 'swap', 'none', 'range-labels', 'reset', 'controlled-range', 'field'].includes(scenario);
export const externalForm = scenario === 'reset' ? 'values' : undefined;
export const direction = scenario === 'rtl' ? 'rtl' : 'ltr';
export const orientation = scenario === 'vertical' ? 'vertical' : 'horizontal';
export const initialDefault =
    scenario === 'initial-min'
        ? undefined
        : range
          ? [20, 60]
          : scenario === 'precision'
            ? 0.35
            : scenario === 'off-grid'
              ? 42
              : scenario === 'one-thumb-array'
                ? [20]
                : 20;
export const initialControlled: Value | undefined =
    scenario === 'controlled'
        ? 0
        : scenario === 'controlled-drag'
          ? 20
          : scenario === 'controlled-range'
            ? [20, 60]
            : undefined;
export const initialMin = scenario === 'initial-min' ? 20 : scenario === 'precision' ? 0.05 : 0;
export const max = scenario === 'precision' ? 0.95 : 100;
export const step = scenario === 'precision' ? 0.1 : scenario === 'off-grid' ? 5 : 1;
export const thumbNames = range ? ['Minimum', 'Maximum'] : [undefined];

export function installProbe(): void {
    window.sliderParity = {
        reference: __PARITY_REFERENCE__,
        changes: [],
        commits: [],
        native: [],
        cancelsChange: false,
        cancelsReset: false
    };
    document.addEventListener('reset', (event) => {
        if (window.sliderParity.cancelsReset) event.preventDefault();
    });
    for (const type of ['input', 'change']) {
        document.addEventListener(
            type,
            (event) => {
                if (event.target instanceof HTMLInputElement && event.target.name === 'volume') {
                    window.sliderParity.native.push(type);
                }
            },
            true
        );
    }
}

export function recordChange(
    value: Value,
    details: { reason: string; event: Event; activeThumbIndex: number; cancel(): void }
): void {
    const { reason, event, activeThumbIndex } = details;
    const { name, value: targetValue } = event.target as unknown as Change['target'];
    window.sliderParity.changes.push({
        value,
        reason,
        activeThumbIndex,
        eventType: event.type,
        target: { name, value: targetValue }
    });
    if (window.sliderParity.cancelsChange) details.cancel();
}

export function recordCommit(value: Value, { reason, event }: { reason: string; event: Event }): void {
    window.sliderParity.commits.push({ value, reason, eventType: event.type });
}
