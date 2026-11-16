/**
 * The direction in which the active tab moved relative to the previously active tab.
 * Mirrors Base UI's `Tabs.Tab.ActivationDirection`.
 */
export type RdxTabsActivationDirection = 'left' | 'right' | 'up' | 'down' | 'none';

/** A tab / panel identity, compared with strict equality. Objects and functions retain their identity. */
export type RdxTabsValue = unknown;

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
