interface Step {
    name: string;
    value: number;
    percent: number;
    min?: number;
    max?: number;
    now?: number;
    locale?: string;
    format?: Intl.NumberFormatOptions;
    describeValue?: boolean;
    customizeValue?: boolean;
    ariaText?: string;
    text?: string;
    visible?: string;
    showLabel?: boolean;
    labelId?: string;
    labelledBy?: string;
    accessibleName?: string;
    direction?: 'ltr' | 'rtl';
}

export const cases: Record<string, Step[]> = {
    range: [
        { name: 'zero at the minimum', value: 0, percent: 0 },
        { name: 'value below the range', value: -10, now: 0, percent: 0 },
        { name: 'position relative to a custom range', value: 75, min: 50, max: 150, percent: 25 },
        { name: 'value above the range', value: 200, max: 150, now: 150, percent: 100 },
        { name: 'equal bounds at the value', value: 5, min: 5, max: 5, percent: 0 },
        { name: 'value above equal bounds', value: 6, min: 5, max: 5, now: 5, percent: 100 }
    ],
    'non-finite': [
        { name: 'NaN maps to the minimum', value: NaN, min: 10, max: 110, now: 10, percent: 0 },
        { name: 'negative infinity clamps to the minimum', value: -Infinity, now: 0, percent: 0 },
        { name: 'positive infinity clamps to the maximum', value: Infinity, now: 100, percent: 100 },
        { name: 'finite update restores measurement', value: 40, percent: 40 }
    ],
    format: [
        { name: 'localized percentage', value: 42, percent: 42, locale: 'de-DE', text: '42\u00a0%' },
        {
            name: 'formatted number is clamped and callbacks receive the original number',
            value: 1100,
            max: 1000,
            now: 1000,
            percent: 100,
            locale: 'de-DE',
            format: { minimumFractionDigits: 1 },
            describeValue: true,
            customizeValue: true,
            text: '1.000,0 / raw 1100',
            visible: '1.000,0 (1100)'
        },
        {
            name: 'explicit ARIA text wins over the callback',
            value: 35,
            percent: 35,
            describeValue: true,
            ariaText: 'Storage available',
            text: 'Storage available',
            visible: '35%'
        }
    ],
    label: [
        {
            name: 'authored association names the meter without a Label',
            value: 25,
            percent: 25,
            showLabel: false,
            labelledBy: 'external-meter',
            accessibleName: 'External storage'
        },
        {
            name: 'authored association persists across label mounting',
            value: 25,
            percent: 25,
            labelId: 'mounted-label',
            labelledBy: 'external-meter',
            accessibleName: 'External storage'
        },
        { name: 'mounted label supplies the default name', value: 25, percent: 25, labelId: 'mounted-label' },
        { name: 'updated label ID is reflected on Root', value: 25, percent: 25, labelId: 'updated-label' },
        {
            name: 'unmounting clears the label relationship',
            value: 25,
            percent: 25,
            showLabel: false,
            accessibleName: 'Fallback storage'
        },
        { name: 'the remounted label registers its generated ID', value: 25, percent: 25 }
    ],
    linear: [
        { name: 'LTR starts on the left', value: 25, percent: 25, direction: 'ltr' },
        { name: 'RTL starts on the right', value: 25, percent: 25, direction: 'rtl' },
        { name: 'changing value resizes the RTL fill', value: 60, percent: 60, direction: 'rtl' },
        {
            name: 'changing both bounds resizes the fill in place',
            value: 60,
            min: 30,
            max: 90,
            percent: 50,
            direction: 'rtl'
        },
        { name: 'zero gives a zero-width fill', value: 0, percent: 0, direction: 'ltr' }
    ],
    svg: [
        { name: 'authored circle starts at 25 percent', value: 25, percent: 25 },
        { name: 'authored circle updates to 75 percent', value: 75, percent: 75 }
    ]
};

type Reference = { commit: string; packageVersion: string; digest: string };
declare global {
    const __PARITY_REFERENCE__: Reference;
    interface Window {
        meterParity: Reference;
    }
}

export function installFixture() {
    window.meterParity = __PARITY_REFERENCE__;
    const name = new URLSearchParams(location.search).get('case') ?? 'range';
    return { steps: cases[name] ?? cases.range, svg: name === 'svg' };
}

export function describeMeter(formatted: string, value: number): string {
    return formatted + ' / raw ' + value;
}

export function displayMeter(formatted: string, value: number): string {
    return formatted + ' (' + value + ')';
}
