import { computed, Directive, inject, input, numberAttribute } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

let meterId = 0;

export type MeterValueFormatter = (formattedValue: string, value: number) => string;

export interface MeterProps {
    value: number;
    min?: number;
    max?: number;
    locale?: Intl.LocalesArgument;
    format?: Intl.NumberFormatOptions;
    ariaValueText?: string;
    getAriaValueText?: MeterValueFormatter;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

const isValidNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const meterRootContext = () => {
    const root = injectMeterRoot();

    return {
        labelId: root.labelId,
        valueId: root.valueId,
        minState: root.minState,
        maxState: root.maxState,
        valueState: root.valueState,
        percentageState: root.percentageState,
        formattedValueState: root.formattedValueState,
        ariaValueTextState: root.ariaValueTextState
    };
};

export type RdxMeterRootContext = ReturnType<typeof meterRootContext>;

export const [injectMeterRootContext, provideMeterRootContext] = createContext<RdxMeterRootContext>(
    'RdxMeterRoot',
    'components/meter'
);

/**
 * Provides meter state and accessibility attributes.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxMeterRoot]',
    exportAs: 'rdxMeterRoot',
    providers: [provideMeterRootContext(meterRootContext)],
    host: {
        role: 'meter',
        '[attr.aria-labelledby]': 'labelId()',
        '[attr.aria-describedby]': 'valueId()',
        '[attr.aria-valuemin]': 'minState()',
        '[attr.aria-valuemax]': 'maxState()',
        '[attr.aria-valuenow]': 'valueState()',
        '[attr.aria-valuetext]': 'ariaValueTextState()',
        '[attr.data-value]': 'valueState()',
        '[attr.data-min]': 'minState()',
        '[attr.data-max]': 'maxState()',
        '[attr.data-percent]': 'percentageState()'
    }
})
export class RdxMeterRootDirective {
    /**
     * Current meter value.
     *
     * @group Props
     */
    readonly value = input.required<number, unknown>({ transform: numberAttribute });

    /**
     * Minimum meter value.
     *
     * @group Props
     * @defaultValue 0
     */
    readonly min = input(DEFAULT_MIN, { transform: numberAttribute });

    /**
     * Maximum meter value.
     *
     * @group Props
     * @defaultValue 100
     */
    readonly max = input(DEFAULT_MAX, { transform: numberAttribute });

    /**
     * Locale used by `Intl.NumberFormat` when formatting the displayed value.
     *
     * @group Props
     */
    readonly locale = input<Intl.LocalesArgument>();

    /**
     * Number formatting options for the displayed value.
     *
     * @group Props
     */
    readonly format = input<Intl.NumberFormatOptions>();

    /**
     * Human-readable text alternative for the current value.
     *
     * @group Props
     */
    readonly ariaValueText = input<string | undefined>(undefined, {
        alias: 'aria-valuetext'
    });

    /**
     * Formats a human-readable text alternative for the current value.
     *
     * @group Props
     */
    readonly getAriaValueText = input<MeterValueFormatter>();

    readonly labelId = input(`rdx-meter-label-${meterId++}`);
    readonly valueId = input(`rdx-meter-value-${meterId++}`);

    readonly minState = computed(() => (isValidNumber(this.min()) ? this.min() : DEFAULT_MIN));
    readonly maxState = computed(() => {
        const min = this.minState();
        const max = this.max();

        return isValidNumber(max) && max > min ? max : min + DEFAULT_MAX;
    });

    readonly valueState = computed(() => {
        const value = this.value();

        return clamp(isValidNumber(value) ? value : this.minState(), this.minState(), this.maxState());
    });

    readonly percentageState = computed(() => {
        const min = this.minState();
        const max = this.maxState();

        return ((this.valueState() - min) / (max - min)) * 100;
    });

    readonly formattedValueState = computed(() => {
        const format = this.format();

        if (format) {
            return new Intl.NumberFormat(this.locale(), format).format(this.valueState());
        }

        return new Intl.NumberFormat(this.locale(), { style: 'percent' }).format(this.percentageState() / 100);
    });

    readonly ariaValueTextState = computed(() => {
        const explicitText = this.ariaValueText();

        if (explicitText !== undefined) {
            return explicitText;
        }

        return this.getAriaValueText()?.(this.formattedValueState(), this.valueState());
    });
}

function injectMeterRoot(): RdxMeterRootDirective {
    return inject(RdxMeterRootDirective);
}
