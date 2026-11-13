import type { MenuEntry } from '../../../shared/menu-collection';

export const highlightCases = [
    'highlight-keyboard',
    'highlight-typeahead',
    'highlight-explicit-label',
    'highlight-pointer',
    'highlight-disabled-hover',
    'highlight-insert',
    'highlight-replace',
    'highlight-reorder',
    'highlight-label-update',
    'highlight-explicit-label-update',
    'highlight-retained',
    'highlight-submenu-ltr',
    'highlight-submenu-rtl'
] as const;

export function highlightConfig(name: string) {
    return (highlightCases as readonly string[]).includes(name)
        ? {
              nested: name.includes('submenu'),
              retained: name === 'highlight-retained',
              mutation: [
                  'highlight-insert',
                  'highlight-replace',
                  'highlight-reorder',
                  'highlight-label-update',
                  'highlight-explicit-label-update'
              ].includes(name)
          }
        : undefined;
}

export function changeHighlightEntries(items: MenuEntry[], name: string): MenuEntry[] {
    if (name === 'highlight-insert') return [{ id: 'new', label: 'New action', disabled: false }, ...items];
    if (name === 'highlight-replace') return [{ id: 'new', label: 'New action', disabled: false }, ...items.slice(1)];
    if (name === 'highlight-reorder') return [...items].reverse();
    return items.map((item) => (item.id === 'alpha' ? { ...item, label: 'Updated action' } : item));
}

export interface HighlightRecord {
    layer: 'main' | 'sub';
    item: string | null;
    label: string | null;
    reason: string;
    native: boolean;
    event: 'keyboard' | 'mouse' | 'other';
    key: string | null;
}

/** Native source identity is checked directly; raw event types accompany the differential report. */
export function createHighlightRecorder() {
    const native = new WeakSet<Event>();
    for (const type of [
        'keydown',
        'keyup',
        'mousemove',
        'mouseenter',
        'mouseleave',
        'pointermove',
        'pointerenter',
        'pointerleave',
        'pointerout'
    ])
        document.addEventListener(type, (event) => native.add(event), true);
    const changes: HighlightRecord[] = [];
    const raw: { type: string; trusted: boolean }[] = [];
    return {
        changes,
        raw,
        record(
            layer: 'main' | 'sub',
            item: HTMLElement | undefined,
            details: { label?: string; reason: string; event: Event }
        ) {
            changes.push({
                layer,
                item: item?.getAttribute('data-testid') ?? null,
                label: details.label ?? null,
                reason: details.reason,
                native: native.has(details.event),
                event:
                    details.event instanceof KeyboardEvent
                        ? 'keyboard'
                        : details.event instanceof MouseEvent
                          ? 'mouse'
                          : 'other',
                key: details.event instanceof KeyboardEvent ? details.event.key : null
            });
            raw.push({ type: details.event.type, trusted: details.event.isTrusted });
        }
    };
}
