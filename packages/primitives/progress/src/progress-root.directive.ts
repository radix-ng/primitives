import { computed, Directive, inject, input, numberAttribute, Signal } from '@angular/core';
import { createContext, injectId } from '@radix-ng/primitives/core';

const attr = (value: boolean) => (value ? '' : undefined);

export type ProgressState = 'indeterminate' | 'complete' | 'progressing';

export type ProgressValueFormatter = (value: number, min: number, max: number) => string;

export interface ProgressProps {
    value?: number | null;
    min?: number;
    max?: number;
    valueLabel?: ProgressValueFormatter;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

const isValidNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

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
        indeterminateState: root.indeterminateState
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
        '[attr.aria-labelledby]': 'labelId()',
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
    /**
     * Current progress value. Set to `null` for indeterminate progress.
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
     * Formats the current value for assistive technologies and `rdxProgressValue`.
     *
     * @group Props
     */
    readonly valueLabel = input<ProgressValueFormatter>((value, min, max) => this.defaultValueLabel(value, min, max));

    readonly labelId = input(injectId('rdx-progress-label-'));
    readonly valueId = input(injectId('rdx-progress-value-'));

    readonly minState = computed(() => (isValidNumber(this.min()) ? this.min() : DEFAULT_MIN));
    readonly maxState = computed(() => {
        const min = this.minState();
        const max = this.max();

        return isValidNumber(max) && max > min ? max : min + DEFAULT_MAX;
    });

    readonly valueState = computed(() => {
        const value = this.value();

        if (value === null || !isValidNumber(value)) {
            return null;
        }

        return clamp(value, this.minState(), this.maxState());
    });

    readonly percentageState = computed(() => {
        const value = this.valueState();

        if (value === null) {
            return null;
        }

        const min = this.minState();
        const max = this.maxState();

        return ((value - min) / (max - min)) * 100;
    });

    readonly valueLabelState = computed(() => {
        const value = this.valueState();

        return value === null ? undefined : this.valueLabel()(value, this.minState(), this.maxState());
    });

    /** `aria-valuetext`: the formatted label, or an explicit "indeterminate progress" (Base UI parity). */
    readonly ariaValueText = computed(
        () => this.valueLabelState() ?? (this.indeterminateState() ? 'indeterminate progress' : undefined)
    );

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

    private valueTransform(value: number | null): number | null {
        return value === null ? null : numberAttribute(value);
    }

    private defaultValueLabel(value: number, min: number, max: number) {
        return `${Math.round(((value - min) / (max - min)) * 100)}%`;
    }
}

function injectProgressRoot(): RdxProgressRootDirective {
    return inject(RdxProgressRootDirective);
}
