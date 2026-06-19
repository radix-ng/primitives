/**
 * The direction in which the active tab moved relative to the previously active tab.
 * Mirrors Base UI's `Tabs.Tab.ActivationDirection`.
 */
export type RdxTabsActivationDirection = 'left' | 'right' | 'up' | 'down' | 'none';

/** A value that identifies a tab / panel pair. */
export type RdxTabsValue = string | number | null;

/** Metadata registered for each tab in the composite list. */
export interface RdxTabsTabMetadata {
    [key: string]: unknown;
    disabled: boolean;
    id: string;
    value: RdxTabsValue;
}

/** Metadata registered for each panel in the composite list. */
export interface RdxTabsPanelMetadata {
    [key: string]: unknown;
    id: string;
    value: RdxTabsValue;
}

export function makeTabId(baseId: string, value: RdxTabsValue): string {
    return `${baseId}-tab-${value}`;
}

export function makePanelId(baseId: string, value: RdxTabsValue): string {
    return `${baseId}-panel-${value}`;
}
