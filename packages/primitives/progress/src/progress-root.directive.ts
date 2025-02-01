import { computed, Directive, effect, inject, InjectionToken, input, model } from '@angular/core';
import { isNullish, isNumber } from '@radix-ng/primitives/core';

export const RdxProgressToken = new InjectionToken<RdxProgressRootDirective>('RdxProgressDirective');

/**
 * Injects the current instance of RdxProgressRootDirective.
 * @returns The instance of RdxProgressRootDirective.
 */
export function injectProgress(): RdxProgressRootDirective {
    return inject(RdxProgressToken);
}

export type ProgressState = 'indeterminate' | 'complete' | 'loading';

export interface ProgressProps {
    value?: number | null;
    max?: number;
    /**
     * A function to get the accessible label text representing the current value in a human-readable format.
     *
     *  If not provided, the value label will be read as the numeric value as a percentage of the max value.
     */
    getValueLabel?: (value: number, max: number) => string;
}

const MIN_PERCENT = 0;
const DEFAULT_MAX = 100;

/**
 * Directive to manage progress bar state and attributes.
 *
 * This directive provides a way to create a progress bar with customizable value and max attributes.
 * It handles aria attributes for accessibility and provides different states like 'indeterminate', 'complete', and 'loading'.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxProgressRoot]',
    exportAs: 'rdxProgressRoot',
    providers: [{ provide: RdxProgressToken, useExisting: RdxProgressRootDirective }],
    host: {
        role: 'progressbar',
        '[attr.aria-valuemax]': 'max()',
        '[attr.aria-valuemin]': '0',
        '[attr.aria-valuenow]': 'value()',
        '[attr.aria-valuetext]': 'label()',
        '[attr.aria-label]': 'label()',
        '[attr.data-state]': 'progressState()',
        '[attr.data-value]': 'value() ?? undefined',
        '[attr.data-max]': 'max()',
        // set tab index to -1 so screen readers will read the aria-label
        // Note: there is a known issue with JAWS that does not read progressbar aria labels on FireFox
        tabindex: '-1'
    }
})
export class RdxProgressRootDirective {
    /**
     * The current value of the progress bar.
     * @group Props
     * @defaultValue 0
     */
    readonly value = model<number>(MIN_PERCENT);

    /**
     * The maximum value of the progress bar.
     * @defaultValue 100
     * @group Props
     */
    readonly max = model<number>(DEFAULT_MAX);

    /**
     * Function to generate the value label.
     * @group Props
     */
    readonly valueLabel = input<(value: number, max: number) => string>((value, max) =>
        this.defaultGetValueLabel(value, max)
    );

    protected readonly label = computed(() => this.valueLabel()(this.value(), this.max()));

    readonly progressState = computed<ProgressState>(() => {
        if (isNullish(this.value())) {
            return 'indeterminate';
        }
        if (this.value() === this.max()) {
            return 'complete';
        }
        return 'loading';
    });

    constructor() {
        effect(() => {
            const correctedValue = this.validateValue(this.value(), this.max());
            if (correctedValue != null && correctedValue !== this.value()) {
                this.value.set(correctedValue);
            }
        });

        effect(() => {
            const correctedMax = this.validateMax(this.max());
            if (correctedMax !== this.max()) {
                this.max.set(correctedMax);
            }
        });
    }

    private validateValue(value: any, max: number): number | null {
        const isValidValueError =
            isNullish(value) || (isNumber(value) && !Number.isNaN(value) && value <= max && value >= 0);

        if (isValidValueError) return value as null;

        console.error(`Invalid prop \`value\` of value \`${value}\` supplied to \`ProgressRoot\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\`  or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`);
        return null;
    }

    private validateMax(max: number): number {
        const isValidMaxError = isNumber(max) && !Number.isNaN(max) && max > 0;

        if (isValidMaxError) return max;

        console.error(
            `Invalid prop \`max\` of value \`${max}\` supplied to \`ProgressRoot\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`
        );
        return DEFAULT_MAX;
    }

    private defaultGetValueLabel(value: number, max: number) {
        return `${Math.round((value / max) * 100)}%`;
    }
}
