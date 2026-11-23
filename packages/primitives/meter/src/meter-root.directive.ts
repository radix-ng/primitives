import { afterNextRender, computed, Directive, inject, input, numberAttribute, signal, Signal } from '@angular/core';
import { clamp, createContext, createLabelRegistry, injectId } from '@radix-ng/primitives/core';

export type MeterValueFormatter = (formattedValue: string, value: number) => string;

export interface MeterProps {
    value: number;
    min?: number;
    max?: number;
    locale?: Intl.LocalesArgument;
    format?: Intl.NumberFormatOptions;
    'aria-valuetext'?: string | null;
    'aria-labelledby'?: string | null;
    getAriaValueText?: MeterValueFormatter;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

export interface RdxMeterRootContext {
    labelId: Signal<string | undefined>;
    valueId: Signal<string>;
    minState: Signal<number>;
    maxState: Signal<number>;
    value: Signal<number>;
    valueState: Signal<number>;
    percentageState: Signal<number>;
    formattedValueState: Signal<string>;
    ariaValueTextState: Signal<string | undefined>;
    registerLabel: (id: string) => () => void;
}

const meterRootContext = (): RdxMeterRootContext => {
    const root = inject(RdxMeterRootDirective);

    return {
        labelId: root.labelId,
        valueId: root.valueId,
        minState: root.minState,
        maxState: root.maxState,
        value: root.value,
        valueState: root.valueState,
        percentageState: root.percentageState,
        formattedValueState: root.formattedValueState,
        ariaValueTextState: root.ariaValueTextState,
        registerLabel: (id) => root.registerLabel(id)
    };
};

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
        '[attr.aria-labelledby]': 'labelledBy()',
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
     * Locale used by `Intl.NumberFormat`. Defaults to en-US during SSR and the runtime locale after hydration.
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
    readonly ariaValueText = input<string | null>(undefined, {
        alias: 'aria-valuetext'
    });

    /**
     * Formats accessible text from the formatted value and the original supplied number.
     *
     * @group Props
     */
    readonly getAriaValueText = input<MeterValueFormatter>();

    /** Explicit IDs of the elements that provide the accessible name. */
    readonly ariaLabelledBy = input<string | null>(undefined, { alias: 'aria-labelledby' });

    /** Default ID for a Meter Label without its own ID. */
    readonly labelId = input<string>();

    /** ID of the rendered Meter Value. */
    readonly valueId = input(injectId('rdx-meter-value-'));

    private readonly labels = createLabelRegistry();
    private readonly runtimeLocale = signal<Intl.LocalesArgument | undefined>('en-US', {
        debugName: 'RdxMeterRoot.runtimeLocale'
    });
    private readonly range = computed(
        () => {
            const min = Number.isFinite(this.min()) ? this.min() : DEFAULT_MIN;
            const max = this.max();
            if (Number.isFinite(max) && max >= min) return { min, max };
            const fallback = min + DEFAULT_MAX;
            if (Number.isFinite(fallback) && fallback > min) return { min, max: fallback };
            return { min: DEFAULT_MIN, max: DEFAULT_MAX };
        },
        { debugName: 'RdxMeterRoot.range' }
    );
    readonly minState = computed(() => this.range().min, { debugName: 'RdxMeterRoot.minState' });
    readonly maxState = computed(() => this.range().max, { debugName: 'RdxMeterRoot.maxState' });

    readonly valueState = computed(
        () => {
            const value = this.value();
            const { min, max } = this.range();

            return clamp(Number.isNaN(value) ? min : value, min, max);
        },
        { debugName: 'RdxMeterRoot.valueState' }
    );

    readonly percentageState = computed(
        () => {
            const { min, max } = this.range();
            if (min === max) return this.value() > max ? 100 : 0;
            const span = max - min;
            const value = this.valueState();
            // Halving the operands keeps an interval spanning opposite finite extremes representable.
            const fraction = Number.isFinite(span) ? (value - min) / span : (value / 2 - min / 2) / (max / 2 - min / 2);
            return fraction * 100;
        },
        { debugName: 'RdxMeterRoot.percentageState' }
    );

    private readonly numberFormatter = computed(
        () => new Intl.NumberFormat(this.locale() ?? this.runtimeLocale(), this.format() ?? { style: 'percent' }),
        { debugName: 'RdxMeterRoot.numberFormatter' }
    );

    readonly formattedValueState = computed(
        () => this.numberFormatter().format(this.format() ? this.valueState() : this.percentageState() / 100),
        { debugName: 'RdxMeterRoot.formattedValueState' }
    );

    readonly ariaValueTextState = computed(
        () => {
            const explicitText = this.ariaValueText();
            if (explicitText !== undefined) return explicitText ?? undefined;
            const formatted = this.formattedValueState();
            return this.getAriaValueText()?.(formatted, this.value()) ?? formatted;
        },
        { debugName: 'RdxMeterRoot.ariaValueTextState' }
    );

    protected readonly labelledBy = computed(
        () => {
            const authored = this.ariaLabelledBy();
            return authored === undefined ? this.labels.labelId() : (authored ?? undefined);
        },
        { debugName: 'RdxMeterRoot.labelledBy' }
    );

    constructor() {
        afterNextRender(() => this.runtimeLocale.set(undefined));
    }

    /** @ignore */
    registerLabel(id: string): () => void {
        return this.labels.registerLabel(id);
    }
}
