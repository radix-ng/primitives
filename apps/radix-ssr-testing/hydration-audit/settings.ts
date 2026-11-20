export const cases = {
    'reverse-checkbox-group': { kind: 'checkbox', placement: 'checkbox-reverse' },
    'eager-radio': { kind: 'radio', placement: 'eager' },
    'reverse-accordion-presence': { kind: 'accordion', placement: 'reverse' },
    'eager-accordion-retained': { kind: 'accordion', placement: 'eager', retain: true },
    'eager-inline': { kind: 'inline', placement: 'eager' },
    'eager-attribute': { kind: 'attribute', placement: 'eager' },
    'eager-structural': { kind: 'structural', placement: 'eager' },
    'eager-popover': { kind: 'popover', placement: 'eager' },
    'eager-popover-container': { kind: 'popover-container', placement: 'eager' },
    'eager-menu': { kind: 'menu', placement: 'eager' },
    'eager-select': { kind: 'select', placement: 'eager' },
    'eager-dialog': { kind: 'dialog', placement: 'eager' },
    'detached-dialog-close-before-trigger-hydration': { kind: 'dialog', placement: 'detached-trigger' },
    'closed-popover': { kind: 'popover', placement: 'closed' },
    'outer-defer-inline': { kind: 'inline', placement: 'outside' },
    'outer-defer-attribute': { kind: 'attribute', placement: 'outside' },
    'outer-defer-structural': { kind: 'structural', placement: 'outside' },
    'outer-defer-popover': { kind: 'popover', placement: 'outside' },
    'lazy-outer-defer-attribute': { kind: 'attribute', placement: 'lazy' },
    'lazy-outer-defer-structural': { kind: 'structural', placement: 'lazy' },
    'inner-defer-attribute': { kind: 'attribute', placement: 'inside' },
    'inner-defer-structural': { kind: 'structural', placement: 'inside' },
    'inner-defer-structural-wrapper': { kind: 'structural', placement: 'inside-wrapped' },
    'inner-client-defer-attribute': { kind: 'attribute', placement: 'inside-client' },
    'inner-client-defer-structural': { kind: 'structural', placement: 'inside-client' },
    'inner-interaction-attribute': { kind: 'attribute', placement: 'inside-interaction' },
    'inner-interaction-structural': { kind: 'structural', placement: 'inside-interaction' },
    'interaction-inline': { kind: 'inline', placement: 'interaction' },
    'interaction-attribute': { kind: 'attribute', placement: 'interaction' },
    'interaction-structural': { kind: 'structural', placement: 'interaction' },
    'client-defer-attribute': { kind: 'attribute', placement: 'client' },
    'client-defer-structural': { kind: 'structural', placement: 'client' },
    'reverse-inline': { kind: 'inline', placement: 'reverse' },
    'reverse-attribute': { kind: 'attribute', placement: 'reverse' },
    'reverse-structural': { kind: 'structural', placement: 'reverse' },
    'reverse-popover': { kind: 'popover', placement: 'reverse' },
    'reverse-popover-container': { kind: 'popover-container', placement: 'reverse' },
    'reverse-tabs-presence': { kind: 'tabs', placement: 'reverse' },
    'client-before-islands': { kind: 'inline', placement: 'client-before-islands' },
    'reverse-inline-authored': { kind: 'inline', placement: 'reverse', authoredIds: true },
    'reverse-structural-authored': { kind: 'structural', placement: 'reverse', authoredIds: true },
    'deferred-destination-attribute': { kind: 'attribute', placement: 'destination' },
    'deferred-destination-structural': { kind: 'structural', placement: 'destination' },
    'pending-destination': { kind: 'structural', placement: 'pending' },
    'pending-lazy-close': { kind: 'structural', placement: 'pending-lazy-close' },
    'pending-lazy-dispose': { kind: 'structural', placement: 'pending-lazy-dispose' },
    'pending-lazy-if-close': { kind: 'inline', placement: 'pending-lazy-if-close' },
    'pending-lazy-retarget': { kind: 'structural', placement: 'pending-lazy-retarget' }
} as const;

export type CaseName = keyof typeof cases;
export interface Settings {
    name: CaseName;
    kind:
        | 'checkbox'
        | 'accordion'
        | 'radio'
        | 'inline'
        | 'attribute'
        | 'structural'
        | 'popover'
        | 'popover-container'
        | 'tabs'
        | 'menu'
        | 'select'
        | 'dialog';
    placement:
        | 'checkbox-reverse'
        | 'eager'
        | 'closed'
        | 'detached-trigger'
        | 'outside'
        | 'lazy'
        | 'inside'
        | 'inside-wrapped'
        | 'inside-client'
        | 'inside-interaction'
        | 'interaction'
        | 'client'
        | 'reverse'
        | 'client-before-islands'
        | 'destination'
        | 'pending'
        | 'pending-lazy-close'
        | 'pending-lazy-dispose'
        | 'pending-lazy-if-close'
        | 'pending-lazy-retarget';
    authoredIds?: boolean;
    retain?: boolean;
}
export function settingsFor(url: string): Settings {
    const name = new URL(url, 'http://localhost').searchParams.get('case') ?? 'eager-inline';
    if (!(name in cases)) throw new Error(`Unknown hydration audit case: ${name}`);
    return { name: name as CaseName, ...cases[name as CaseName] };
}

export interface AuditProbe {
    ready: boolean;
    errors: string[];
    constructed: string[];
    whenStable?: () => Promise<void>;
    lazyLoaded?: boolean;
    stable?: boolean;
}

declare global {
    interface Window {
        portalHydrationAudit?: AuditProbe;
        auditServerNodes?: Record<string, Element>;
    }
}
