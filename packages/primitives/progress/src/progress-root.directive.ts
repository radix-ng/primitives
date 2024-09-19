import { Directive, inject, InjectionToken, Input, numberAttribute, OnChanges, SimpleChanges } from '@angular/core';

let idIterator = 0;

const MIN_PERCENT = 0;
const DEFAULT_MAX = 100;
const PROGRESS_NAME = 'Radix Progress';

const RdxProgressToken = new InjectionToken<RdxProgressRootDirective>('RdxProgressDirective');

/**
 * Injects the current instance of RdxProgressRootDirective.
 * @returns The instance of RdxProgressRootDirective.
 */
export function injectProgress(): RdxProgressRootDirective {
    return inject(RdxProgressToken);
}

export type ProgressState = 'indeterminate' | 'complete' | 'loading';

export interface ProgressProps {
    value?: number | null | undefined;
    max?: number;
    getValueLabel?: string;
}

/**
 * Directive to manage progress bar state and attributes.
 *
 * This directive provides a way to create a progress bar with customizable value and max attributes.
 * It handles aria attributes for accessibility and provides different states like 'indeterminate', 'complete', and 'loading'.
 */
@Directive({
    selector: '[rdxProgressRoot]',
    exportAs: 'rdxProgressRoot',
    standalone: true,
    providers: [{ provide: RdxProgressToken, useExisting: RdxProgressRootDirective }],
    host: {
        role: 'progressbar',
        '[id]': 'id',
        '[attr.aria-valuemax]': 'max',
        '[attr.aria-valuemin]': '0',
        '[attr.aria-valuenow]': 'value',
        '[attr.aria-valuetext]': 'valueLabel(value, max)',
        '[attr.data-state]': 'state',
        '[attr.data-value]': 'value',
        '[attr.data-max]': 'max',
        // set tab index to -1 so screen readers will read the aria-label
        // Note: there is a known issue with JAWS that does not read progressbar aria labels on FireFox
        tabindex: '-1'
    }
})
export class RdxProgressRootDirective implements ProgressProps, OnChanges {
    /**
     * The unique ID for the progress bar.
     * @default 'rdx-progress-bar-{idIterator}'
     */
    @Input() id = `rdx-progress-bar-${idIterator++}`;

    /**
     * The current value of the progress bar.
     * @default 0
     */
    @Input({ alias: 'rdxValue', transform: numberAttribute }) value = MIN_PERCENT;

    /**
     * The maximum value of the progress bar.
     * @default 100
     */
    @Input({ alias: 'rdxMax', transform: numberAttribute }) max = DEFAULT_MAX;

    /**
     * Function to generate the value label.
     */
    @Input('rdxValueLabel') valueLabel: (value: number, max: number) => string = (value, max) =>
        this.defaultGetValueLabel(value, max);

    /**
     * Lifecycle hook that is called when any data-bound property of a directive changes.
     * @param changes - The changed properties.
     * @ignore
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes['max'] && !this.isValidMaxNumber(this.max)) {
            console.error(this.getInvalidMaxError(`${this.max}`, PROGRESS_NAME));
        }

        if (changes['value'] && this.value !== null && !this.isValidValueNumber(this.value, this.max)) {
            console.error(this.getInvalidValueError(`${this.value}`, PROGRESS_NAME));
        }
    }

    /**
     * Get the state of the progress bar.
     * @returns 'indeterminate' | 'loading' | 'complete'
     * @ignore
     */
    get state(): ProgressState {
        return this.getProgressState(this.value, this.max);
    }

    private getProgressState(value: number | undefined | null, maxValue: number): ProgressState {
        return value == null ? 'indeterminate' : value === maxValue ? 'complete' : 'loading';
    }

    private defaultGetValueLabel(value: number, max: number) {
        return `${Math.round((value / max) * 100)}%`;
    }

    private isValidMaxNumber(max: unknown): max is number {
        return this.isNumber(max) && !isNaN(max) && max > 0;
    }

    private isNumber(value: unknown): value is number {
        return typeof value === 'number';
    }

    private isValidValueNumber(value: unknown, max: number): value is number {
        return this.isNumber(value) && !isNaN(value) && value <= max && value >= 0;
    }

    private getInvalidMaxError(propValue: string, componentName: string): string {
        return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
    }

    private getInvalidValueError(propValue: string, componentName: string): string {
        return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
    - a positive number
    - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
    - \`null\` or \`undefined\` if the progress is indeterminate.

    Defaulting to \`null\`.`;
    }
}
