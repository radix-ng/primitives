interface Step {
    name: string;
    value: number | null;
    now: string | null;
    text: string;
    visible?: string;
    min?: number;
    max?: number;
    locale?: string;
    format?: Intl.NumberFormatOptions;
    describeValue?: boolean;
    ariaText?: string;
    showLabel?: boolean;
    labelId?: string;
    labelledBy?: string;
    accessibleName?: string;
    direction?: 'ltr' | 'rtl';
    width?: number;
}

export const cases: Record<string, Step[]> = {
    range: [
        { name: 'zero is determinate', value: 0, now: '0', text: '0%' },
        { name: 'negative values clamp to the minimum', value: -20, now: '0', text: '0%' },
        { name: 'a custom range normalizes the fraction', value: 75, min: 50, max: 150, now: '75', text: '25%' },
        { name: 'the maximum completes the task', value: 150, min: 50, max: 150, now: '150', text: '100%' },
        { name: 'overshoot clamps to the maximum', value: 160, min: 50, max: 150, now: '150', text: '100%' },
        {
            name: 'external range updates restore a progressing value',
            value: 150,
            min: 50,
            max: 250,
            now: '150',
            text: '50%'
        }
    ],
    'non-finite': [
        { name: 'null is indeterminate', value: null, now: null, text: 'indeterminate progress' },
        { name: 'NaN is indeterminate', value: NaN, now: null, text: 'indeterminate progress' },
        { name: 'positive infinity is indeterminate', value: Infinity, now: null, text: 'indeterminate progress' },
        { name: 'negative infinity is indeterminate', value: -Infinity, now: null, text: 'indeterminate progress' },
        { name: 'a finite update restores the value and fill', value: 40, now: '40', text: '40%' }
    ],
    format: [
        { name: 'localized percentage', value: 42, now: '42', text: '42\u00a0%', locale: 'de-DE' },
        {
            name: 'format uses the clamped value and ARIA receives the raw value',
            value: 1100,
            max: 1000,
            now: '1000',
            visible: '1.000,0',
            text: '1.000,0 / raw 1100',
            locale: 'de-DE',
            format: { minimumFractionDigits: 1 },
            describeValue: true
        },
        {
            name: 'an indeterminate value can have a custom announcement',
            value: null,
            now: null,
            text: 'Waiting for transfer',
            describeValue: true
        },
        {
            name: 'explicit ARIA text takes precedence over the callback',
            value: 30,
            now: '30',
            text: 'Transfer in progress',
            visible: '30%',
            describeValue: true,
            ariaText: 'Transfer in progress'
        }
    ],
    label: [
        {
            name: 'external name works without a mounted Label',
            value: 10,
            now: '10',
            text: '10%',
            showLabel: false,
            labelledBy: 'external-progress',
            accessibleName: 'External progress'
        },
        {
            name: 'the authored name stays in place when Label mounts',
            value: 10,
            now: '10',
            text: '10%',
            labelId: 'mounted-label',
            labelledBy: 'external-progress',
            accessibleName: 'External progress'
        },
        {
            name: 'the mounted Label supplies the name after clearing the override',
            value: 10,
            now: '10',
            text: '10%',
            labelId: 'mounted-label'
        },
        {
            name: 'the relationship follows an updated Label id',
            value: 10,
            now: '10',
            text: '10%',
            labelId: 'updated-label'
        },
        {
            name: 'unmounting Label restores the fallback name',
            value: 10,
            now: '10',
            text: '10%',
            showLabel: false,
            accessibleName: 'Fallback progress'
        },
        { name: 'remounting Label restores the association', value: 10, now: '10', text: '10%', labelId: 'new-label' }
    ],
    linear: [
        { name: 'LTR fill starts on the left', value: 25, now: '25', text: '25%', direction: 'ltr', width: 50 },
        { name: 'RTL fill starts on the right', value: 25, now: '25', text: '25%', direction: 'rtl', width: 50 },
        {
            name: 'changing the value resizes the RTL fill',
            value: 60,
            now: '60',
            text: '60%',
            direction: 'rtl',
            width: 120
        },
        {
            name: 'indeterminate uses the authored fallback width',
            value: null,
            now: null,
            text: 'indeterminate progress',
            direction: 'rtl',
            width: 20
        },
        { name: 'zero restores automatic width', value: 0, now: '0', text: '0%', direction: 'ltr', width: 0 }
    ],
    svg: [
        { name: 'circle at 25 percent', value: 25, now: '25', text: '25%' },
        { name: 'circle updates to 75 percent', value: 75, now: '75', text: '75%' },
        {
            name: 'circle clears its stroke dash when indeterminate',
            value: null,
            now: null,
            text: 'indeterminate progress'
        }
    ]
};

type Reference = { commit: string; packageVersion: string; digest: string };
declare global {
    const __PARITY_REFERENCE__: Reference;
    interface Window {
        progressParity: Reference;
    }
}

export function installFixture() {
    window.progressParity = __PARITY_REFERENCE__;
    const name = new URLSearchParams(location.search).get('case') ?? 'range';
    return { steps: cases[name] ?? cases.range, svg: name === 'svg' };
}

export function describeProgress(formatted: string, value: number | null): string {
    return value === null ? 'Waiting for transfer' : formatted + ' / raw ' + value;
}
