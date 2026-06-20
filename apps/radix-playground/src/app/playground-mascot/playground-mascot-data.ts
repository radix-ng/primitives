import { MASCOT_DOCS_INDEX } from './playground-mascot-docs.generated';

export interface InspectedAttribute {
    readonly name: string;
    readonly value: string;
}

export interface InspectedElement {
    readonly label: string;
    readonly attrs: readonly InspectedAttribute[];
    readonly source: 'Clicked' | 'Focused';
}

export interface LiveStateChange {
    readonly id: number;
    readonly target: string;
    readonly name: string;
    readonly previousValue: string;
    readonly value: string;
}

export interface PinGeometry {
    readonly badgeX: number;
    readonly badgeY: number;
    readonly label: string;
    readonly targetX: number;
    readonly targetY: number;
    readonly targetWidth: number;
    readonly targetHeight: number;
}

export interface MascotDocsEntry {
    readonly id: string;
    readonly primitive?: string;
    readonly title: string;
    readonly summary: string;
    readonly bullets: readonly string[];
    readonly keywords: readonly string[];
    readonly href: string;
    readonly exampleHref?: string;
    readonly source: 'Docs' | 'Guide' | 'Skill';
}

export interface MascotDocsResult extends MascotDocsEntry {
    readonly score: number;
}

export const DEFAULT_MASCOT_HINTS = [
    'Pick a primitive and I will point out its keyboard and state behavior.',
    'Turn on inspect, then focus or click a demo control to see its live attributes.',
    'Most primitives expose behavior through data-* and ARIA attributes, not styles.'
];

export const MASCOT_HINTS: Record<string, readonly string[]> = {
    overview: DEFAULT_MASCOT_HINTS,
    accordion: [
        'Accordion triggers are great for checking data-state changes between open and closed.',
        'Try keyboard focus on a trigger, then press Enter or Space.',
        'Inspect a panel after opening it to see which attributes changed.'
    ],
    checkbox: [
        'Checkbox is a compact state demo: checked, unchecked, and sometimes indeterminate.',
        'Focus it with Tab, then press Space to toggle.',
        'Inspect the control and watch aria-checked update.'
    ],
    dialog: [
        'Open the dialog and check where focus lands first.',
        'Escape should close the dialog and return focus to the trigger.',
        'Inspect mode can show the trigger state before and after opening.'
    ],
    popover: [
        'Popover is useful for checking anchor, side, and open state.',
        'Open it, then click outside to confirm dismissal behavior.',
        'Inspect the trigger to see the state reflected in attributes.'
    ],
    select: [
        'Open Select with Enter or Space, then move through items with ArrowDown.',
        'A highlighted option should expose data-highlighted while focus stays managed.',
        'After picking an item, inspect the trigger to confirm the value changed visually.'
    ],
    slider: [
        'Drag the thumb, or focus it and use arrow keys for precise changes.',
        'Inspect the thumb to see aria-valuenow and related range metadata.',
        'Range primitives should stay usable without a mouse.'
    ],
    switch: [
        'Switch is the fastest state check: click it or press Space while focused.',
        'Inspect the control and watch aria-checked move with the visual state.',
        'Disabled switches should not toggle or accept focus in the same way.'
    ],
    tabs: [
        'Move between tabs with ArrowLeft and ArrowRight.',
        'Inspect the active tab and panel to compare selected state.',
        'Tabs should keep one panel active and associate tabs with their panels.'
    ]
};

export const RDX_ATTRIBUTE_LABELS: Record<string, string> = {
    rdxaccordionheader: 'rdxAccordionHeader',
    rdxaccordionitem: 'rdxAccordionItem',
    rdxaccordionpanel: 'rdxAccordionPanel',
    rdxaccordionroot: 'rdxAccordionRoot',
    rdxaccordiontrigger: 'rdxAccordionTrigger',
    rdxcheckboxindicator: 'rdxCheckboxIndicator',
    rdxcheckboxroot: 'rdxCheckboxRoot',
    rdxdialogcontent: 'rdxDialogContent',
    rdxdialogdescription: 'rdxDialogDescription',
    rdxdialogoverlay: 'rdxDialogOverlay',
    rdxdialogportal: 'rdxDialogPortal',
    rdxdialogroot: 'rdxDialogRoot',
    rdxdialogtitle: 'rdxDialogTitle',
    rdxdialogtrigger: 'rdxDialogTrigger',
    rdxpopoveranchor: 'rdxPopoverAnchor',
    rdxpopovercontent: 'rdxPopoverContent',
    rdxpopoverportal: 'rdxPopoverPortal',
    rdxpopoverroot: 'rdxPopoverRoot',
    rdxpopovertrigger: 'rdxPopoverTrigger',
    rdxselectedvalue: 'rdxSelectedValue',
    rdxselectgroup: 'rdxSelectGroup',
    rdxselectitem: 'rdxSelectItem',
    rdxselectitemindicator: 'rdxSelectItemIndicator',
    rdxselectitemtext: 'rdxSelectItemText',
    rdxselectlist: 'rdxSelectList',
    rdxselectpopup: 'rdxSelectPopup',
    rdxselectpositioner: 'rdxSelectPositioner',
    rdxselectroot: 'rdxSelectRoot',
    rdxselecttrigger: 'rdxSelectTrigger',
    rdxselectvalue: 'rdxSelectValue',
    rdxsliderrange: 'rdxSliderRange',
    rdxsliderroot: 'rdxSliderRoot',
    rdxsliderthumb: 'rdxSliderThumb',
    rdxslidertrack: 'rdxSliderTrack',
    rdxswitchroot: 'rdxSwitchRoot',
    rdxswitchthumb: 'rdxSwitchThumb',
    rdxtabspanel: 'rdxTabsPanel',
    rdxtabsroot: 'rdxTabsRoot',
    rdxtabstab: 'rdxTabsTab',
    rdxtabslist: 'rdxTabsList'
};

export const isStateAttribute = (name: string) =>
    name.startsWith('data-') || name.startsWith('aria-') || name === 'role' || name === 'value';

export function searchMascotDocs(query: string, routeKey: string): readonly MascotDocsResult[] {
    const normalizedQuery = normalizeSearchText(query);
    const tokens = normalizedQuery.split(' ').filter(Boolean);
    const scopedEntries = MASCOT_DOCS_INDEX.filter((entry) => !entry.primitive || entry.primitive === routeKey);

    if (!tokens.length) {
        return scopedEntries
            .map((entry) => ({
                ...entry,
                score: entry.primitive === routeKey ? 6 : 1
            }))
            .sort(sortDocsResults)
            .slice(0, 3);
    }

    return MASCOT_DOCS_INDEX.map((entry) => ({ ...entry, score: scoreDocsEntry(entry, tokens, routeKey) }))
        .filter((entry) => entry.score > 0)
        .sort(sortDocsResults)
        .slice(0, 3);
}

function scoreDocsEntry(entry: MascotDocsEntry, tokens: readonly string[], routeKey: string): number {
    const title = normalizeSearchText(entry.title);
    const summary = normalizeSearchText(entry.summary);
    const bullets = normalizeSearchText(entry.bullets.join(' '));
    const keywords = normalizeSearchText(entry.keywords.join(' '));
    let score = entry.primitive === routeKey ? 3 : 0;

    for (const token of tokens) {
        if (entry.primitive === token) {
            score += 5;
        }

        if (title.includes(token)) {
            score += 4;
        }

        if (keywords.includes(token)) {
            score += 3;
        }

        if (summary.includes(token)) {
            score += 2;
        }

        if (bullets.includes(token)) {
            score += 1;
        }
    }

    return score;
}

function sortDocsResults(a: MascotDocsResult, b: MascotDocsResult): number {
    if (b.score !== a.score) {
        return b.score - a.score;
    }

    return a.title.localeCompare(b.title);
}

function normalizeSearchText(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9а-яё-]+/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
