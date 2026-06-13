/** The primitives showcased in the playground. Drives both the sidebar nav and the router config. */
export interface PrimitiveLink {
    readonly path: string;
    readonly label: string;
}

export const PRIMITIVES: readonly PrimitiveLink[] = [
    { path: 'accordion', label: 'Accordion' },
    { path: 'checkbox', label: 'Checkbox' },
    { path: 'dialog', label: 'Dialog' },
    { path: 'popover', label: 'Popover' },
    { path: 'select', label: 'Select' },
    { path: 'slider', label: 'Slider' },
    { path: 'switch', label: 'Switch' },
    { path: 'tabs', label: 'Tabs' }
];
