import { afterNextRender, computed, Directive, inject, input, numberAttribute, signal, Signal } from '@angular/core';
import { clamp, createContext, createLabelRegistry, injectId } from '@radix-ng/primitives/core';

const attr = (value: boolean) => (value ? '' : undefined);

export type ProgressState = 'indeterminate' | 'complete' | 'progressing';

export type ProgressValueFormatter = (value: number, min: number, max: number) => string;
export type ProgressAriaValueFormatter = (formattedValue: string, value: number | null) => string;

export interface ProgressProps {
    value?: number | null;
    min?: number;
    max?: number;
    valueLabel?: ProgressValueFormatter;
    locale?: Intl.LocalesArgument;
    format?: Intl.NumberFormatOptions;
    getAriaValueText?: ProgressAriaValueFormatter;
    'aria-valuetext'?: string | null;
    'aria-labelledby'?: string | null;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

function rangeFraction(value: number, min: number, max: number): number {
    const span = max - min;
    // Subtraction can overflow when the range spans opposite finite extremes.
    return Number.isFinite(span) ? (value - min) / span : (value / 2 - min / 2) / (max / 2 - min / 2);
}

export interface RdxProgressRootContext {
    labelId: Signal<string>;
    valueId: Signal<string>;
    minState: Signal<number>;
    maxState: Signal<number>;
    valueState: Signal<number | null>;
    percentageState: Signal<number | null>;
    valueLabelState: Signal<string | undefined>;
    progressState: Signal<ProgressState>;
    completeState: Signal<boolean>;
    progressingState: Signal<boolean>;
    indeterminateState: Signal<boolean>;
    registerLabel: (id: string) => () => void;
}

const progressRootContext = (): RdxProgressRootContext => {
    const root = injectProgressRoot();

    return {
        labelId: root.labelId,
        valueId: root.valueId,
        minState: root.minState,
        maxState: root.maxState,
        valueState: root.valueState,
        percentageState: root.percentageState,
        valueLabelState: root.valueLabelState,
        progressState: root.progressState,
        completeState: root.completeState,
        progressingState: root.progressingState,
        indeterminateState: root.indeterminateState,
        registerLabel: (id) => root.registerLabel(id)
    };
};

export const [injectProgressRootContext, provideProgressRootContext] = createContext<RdxProgressRootContext>(
    'RdxProgressRoot',
    'components/progress'
);

/**
 * Provides progress state and accessibility attributes.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxProgressRoot]',
    exportAs: 'rdxProgressRoot',
    providers: [provideProgressRootContext(progressRootContext)],
    host: {
        role: 'progressbar',
        '[attr.aria-labelledby]': 'labelledBy()',
        // min/max are always present (Base UI + APG), only `aria-valuenow` is dropped when indeterminate.
        '[attr.aria-valuemin]': 'minState()',
        '[attr.aria-valuemax]': 'maxState()',
        '[attr.aria-valuenow]': 'valueState() ?? undefined',
        '[attr.aria-valuetext]': 'ariaValueText()',
        '[attr.data-value]': 'valueState() ?? undefined',
        '[attr.data-min]': 'minState()',
        '[attr.data-max]': 'maxState()',
        '[attr.data-complete]': 'dataAttr(completeState())',
        '[attr.data-progressing]': 'dataAttr(progressingState())',
        '[attr.data-indeterminate]': 'dataAttr(indeterminateState())'
    }
})
export class RdxProgressRootDirective {
    private readonly defaultValueLabel: ProgressValueFormatter = (value, min, max) =>
        this.numberFormatter().format(this.format() ? value : rangeFraction(value, min, max));

    /**
     * Current progress value. Null and non-finite values indicate indeterminate progress.
     *
     * @group Props
     * @defaultValue null
     */
    readonly value = input<number | null, number | null>(null, { transform: (value) => this.valueTransform(value) });

    /**
     * Minimum progress value.
     *
     * @group Props
     * @defaultValue 0
     */
    readonly min = input(DEFAULT_MIN, { transform: numberAttribute });

    /**
     * Maximum progress value.
     *
     * @group Props
     * @defaultValue 100
     */
    readonly max = input(DEFAULT_MAX, { transform: numberAttribute });

    /**
     * Formats the clamped value for `rdxProgressValue` and the default accessible value text.
     *
     * @group Props
     */
    readonly valueLabel = input<ProgressValueFormatter, ProgressValueFormatter | undefined>(this.defaultValueLabel, {
        transform: (formatter) => formatter ?? this.defaultValueLabel
    });

    /** Locale used by the number formatter. */
    readonly locale = input<Intl.LocalesArgument>();

    /** Number format for the clamped value. The default formats the percentage of the range. */
    readonly format = input<Intl.NumberFormatOptions>();

    /** Formats accessible value text using the visible text and the original supplied value. */
    readonly getAriaValueText = input<ProgressAriaValueFormatter>();

    /** Explicit accessible value text. */
    readonly ariaValueTextInput = input<string | null>(undefined, { alias: 'aria-valuetext' });

    /** Explicit IDs of the elements that provide the accessible name. */
    readonly ariaLabelledBy = input<string | null>(undefined, { alias: 'aria-labelledby' });

    readonly labelId = input(injectId('rdx-progress-label-'));
    readonly valueId = input(injectId('rdx-progress-value-'));

    private readonly labels = createLabelRegistry();
    private readonly runtimeLocale = signal<Intl.LocalesArgument | undefined>('en-US');
    private readonly range = computed(() => {
        const min = Number.isFinite(this.min()) ? this.min() : DEFAULT_MIN;
        const max = this.max();
        if (Number.isFinite(max) && max > min) return { min, max };
        const fallback = min + DEFAULT_MAX;
        if (Number.isFinite(fallback) && fallback > min) return { min, max: fallback };
        return { min: DEFAULT_MIN, max: DEFAULT_MAX };
    });
    readonly minState = computed(() => this.range().min);
    readonly maxState = computed(() => this.range().max);
    private readonly numberFormatter = computed(
        () => new Intl.NumberFormat(this.locale() ?? this.runtimeLocale(), this.format() ?? { style: 'percent' })
    );

    readonly valueState = computed(() => {
        const value = this.value();

        if (value === null || !Number.isFinite(value)) {
            return null;
        }

        return clamp(value, this.minState(), this.maxState());
    });

    readonly percentageState = computed(() => {
        const value = this.valueState();

        if (value === null) {
            return null;
        }

        const { min, max } = this.range();
        return rangeFraction(value, min, max) * 100;
    });

    readonly valueLabelState = computed(() => {
        const value = this.valueState();

        if (value === null) return undefined;
        const { min, max } = this.range();
        return this.valueLabel()(value, min, max);
    });

    /** `aria-valuetext`: the formatted label, or an explicit "indeterminate progress" (Base UI parity). */
    readonly ariaValueText = computed(() => {
        const authored = this.ariaValueTextInput();
        if (authored !== undefined) return authored ?? undefined;
        const formatted = this.valueLabelState();
        return this.getAriaValueText()?.(formatted ?? '', this.value()) ?? formatted ?? 'indeterminate progress';
    });
    protected readonly labelledBy = computed(() => {
        const authored = this.ariaLabelledBy();
        return authored === undefined ? this.labels.labelId() : authored;
    });

    readonly progressState = computed<ProgressState>(() => {
        const value = this.valueState();

        if (value === null) {
            return 'indeterminate';
        }

        if (value === this.maxState()) {
            return 'complete';
        }

        return 'progressing';
    });

    readonly completeState = computed(() => this.progressState() === 'complete');
    readonly progressingState = computed(() => this.progressState() === 'progressing');
    readonly indeterminateState = computed(() => this.progressState() === 'indeterminate');

    protected readonly dataAttr = attr;

    /** Whether a `rdxProgressLabel` is currently registered. */
    readonly hasLabel = computed(() => this.labels.labelId() !== undefined);

    constructor() {
        afterNextRender(() => this.runtimeLocale.set(undefined));
    }

    /** @ignore */
    registerLabel(id: string): () => void {
        return this.labels.registerLabel(id);
    }

    private valueTransform(value: number | null): number | null {
        return value === null ? null : numberAttribute(value);
    }
}

function injectProgressRoot(): RdxProgressRootDirective {
    return inject(RdxProgressRootDirective);
}
