/**
 * The direction in which the active tab moved relative to the previously active tab.
 * Mirrors Base UI's `Tabs.Tab.ActivationDirection`.
 */
export type RdxTabsActivationDirection = 'left' | 'right' | 'up' | 'down' | 'none';

/** A value that identifies a tab / panel pair. */
export type RdxTabsValue = string | number | null;

export function makeTabId(baseId: string, value: RdxTabsValue): string {
    return `${baseId}-tab-${value}`;
}

export function makePanelId(baseId: string, value: RdxTabsValue): string {
    return `${baseId}-panel-${value}`;
}
