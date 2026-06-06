import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    model,
    numberAttribute,
    output,
    signal,
    Signal
} from '@angular/core';
import { _IdGenerator, injectControlValueAccessor, RdxControlValueAccessor } from '@radix-ng/primitives/core';
import { provideSliderRootContext } from './slider-context';
import {
    areValuesEqual,
    asc,
    clamp,
    formatNumber,
    getSliderValue,
    SliderOrientation,
    ThumbCollisionBehavior,
    validateMinimumDistance
} from './slider.utils';

export type SliderValue = number | number[];

/** Minimal shape a thumb registers with the root, used for hit-testing and focus. */
export interface RdxSliderThumbRef {
    /** The thumb wrapper element. */
    readonly element: HTMLElement;
    /** The nested `input[type=range]`, registered once it is initialised. */
    inputElement: HTMLInputElement | null;
    /** Whether this thumb is disabled (own state OR root disabled). */
    readonly disabled: Signal<boolean>;
}

function sortByDomOrder(list: readonly RdxSliderThumbRef[]): RdxSliderThumbRef[] {
    return list.slice().sort((a, b) => {
        const position = a.element.compareDocumentPosition(b.element);

        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
            return -1;
        }

        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
            return 1;
        }
        return 0;
    });
}

/**
 * Groups all parts of the slider and owns its state, value-change logic and
 * thumb registration. A single directive drives both orientations — there are no
 * separate horizontal/vertical components.
 *
 * @see https://base-ui.com/react/components/slider
 */
@Directive({
    selector: 'div[rdxSliderRoot]',
    exportAs: 'rdxSliderRoot',
    providers: [provideSliderRootContext(() => inject(RdxSliderRoot))],
    hostDirectives: [
        {
            directive: RdxControlValueAccessor,
            inputs: ['value: value', 'disabled']
        }
    ],
    host: {
        role: 'group',
        '[id]': 'id()',
        '[attr.aria-labelledby]': 'ariaLabelledBy()',
        '[attr.dir]': 'dir()',
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-dragging]': 'dragging() ? "" : undefined'
    }
})
export class RdxSliderRoot {
    /** @ignore */
    protected readonly cva = injectControlValueAccessor<SliderValue>();

    readonly id = input<string>(inject(_IdGenerator).getId('rdx-slider-'));

    /**
     * The minimum value of the slider.
     * @default 0
     */
    readonly min = input<number, NumberInput>(0, { transform: numberAttribute });

    /**
     * The maximum value of the slider.
     * @default 100
     */
    readonly max = input<number, NumberInput>(100, { transform: numberAttribute });

    /**
     * The granularity with which the value can change through user interaction.
     * @default 1
     */
    readonly step = input<number, NumberInput>(1, { transform: numberAttribute });

    /**
     * The granularity with which the value changes on Page Up / Page Down keys and Shift + Arrow keys.
     * @default 10
     */
    readonly largeStep = input<number, NumberInput>(10, { transform: numberAttribute });

    /**
     * The minimum number of steps that must separate two thumbs in a range slider.
     * @default 0
     */
    readonly minStepsBetweenValues = input<number, NumberInput>(0, { transform: numberAttribute });

    /**
     * The orientation of the slider.
     * @default 'horizontal'
     */
    readonly orientation = input<SliderOrientation>('horizontal');

    /**
     * The reading direction. Mirrors the horizontal axis when set to `'rtl'`.
     * @default 'ltr'
     */
    readonly dir = input<'ltr' | 'rtl'>('ltr');

    /**
     * How thumbs behave when they meet in a range slider.
     * @default 'push'
     */
    readonly thumbCollisionBehavior = input<ThumbCollisionBehavior>('push');

    /** Options forwarded to `Intl.NumberFormat` when displaying and announcing values. */
    readonly format = input<Intl.NumberFormatOptions>();

    /** Locale used for value formatting. */
    readonly locale = input<string>();

    /** Name of the hidden inputs rendered by each thumb, for form submission. */
    readonly name = input<string>();

    /** Id of the form the slider belongs to. */
    readonly form = input<string>();

    /**
     * When `true`, the user cannot interact with the slider.
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** The uncontrolled value of the slider when it is initially rendered. */
    readonly defaultValue = input<SliderValue>();

    /** The controlled value of the slider. Use with `(onValueChange)` or two-way `[(value)]`. */
    readonly value = model<SliderValue>();

    readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

    /** Emitted when the value changes (during interaction). */
    readonly onValueChange = output<SliderValue>();

    /** Emitted when interaction ends, with the final value — useful for committing to a backend. */
    readonly onValueCommitted = output<SliderValue>();

    /** @ignore */
    readonly controlRef = signal<HTMLElement | null>(null);

    /** @ignore Active thumb index (-1 when none). */
    readonly active = signal(-1);
    /** @ignore Last thumb index that was focused/used, drives z-index stacking. */
    readonly lastUsedThumbIndex = signal(-1);
    /** @ignore Whether a pointer drag is in progress. */
    readonly dragging = signal(false);

    /** @ignore Pointer-drag scratch state (not reactive). */
    pressedThumbIndex = -1;
    /** @ignore */
    pressedThumbCenterOffset: number | null = null;
    /** @ignore */
    pressedInput: HTMLInputElement | null = null;
    /** @ignore Snapshot of values at drag start, the baseline for push/swap. */
    pressedValues: number[] | null = null;
    /** @ignore */
    lastChangeReason = 'none';

    /** @ignore */
    readonly isDisabled = computed(() => !!this.cva.disabled());

    /** @ignore The current value source (controlled value, else default, else min). */
    private readonly currentRaw = computed<SliderValue>(() => this.cva.value() ?? this.defaultValue() ?? this.min());

    /** Whether the slider has multiple thumbs (the value is an array). */
    readonly range = computed(() => Array.isArray(this.cva.value() ?? this.defaultValue()));

    /** The clamped values rendered to the user, sorted ascending for range sliders. */
    readonly values = computed<number[]>(() => {
        const raw = this.currentRaw();
        const min = this.min();
        const max = this.max();
        const arr = (Array.isArray(raw) ? raw.slice() : [raw]).map((v) => clamp(v, min, max));
        return this.range() ? arr.sort(asc) : arr;
    });

    private readonly thumbs = signal<RdxSliderThumbRef[]>([]);
    /** Registered thumbs in DOM order. */
    readonly thumbList = this.thumbs.asReadonly();

    /** @ignore */
    registerThumb(thumb: RdxSliderThumbRef): void {
        this.thumbs.update((list) => sortByDomOrder([...list, thumb]));
    }

    /** @ignore */
    unregisterThumb(thumb: RdxSliderThumbRef): void {
        this.thumbs.update((list) => list.filter((t) => t !== thumb));
    }

    /** @ignore */
    thumbIndexOf(thumb: RdxSliderThumbRef): number {
        return this.thumbList().indexOf(thumb);
    }

    /** @ignore */
    setActive(index: number): void {
        this.active.set(index);
        if (index !== -1) {
            this.lastUsedThumbIndex.set(index);
        }
    }

    /** @ignore */
    focusThumb(index: number): void {
        this.thumbList()[index]?.inputElement?.focus({ preventScroll: true });
    }

    /** @ignore */
    formatValue(value: number): string {
        return formatNumber(value, this.locale(), this.format());
    }

    /** @ignore Output value matching the original value shape (number vs array). */
    private outputValue(): SliderValue {
        const raw = this.cva.value();
        if (raw !== undefined) {
            return raw;
        }
        return this.range() ? this.values() : this.values()[0];
    }

    /**
     * @ignore
     * Applies a new full set of values, preserving the single/range value shape.
     * Returns `false` when the value did not change.
     */
    setValue(nextValues: number[], reason: string): boolean {
        const next: SliderValue = this.range() ? nextValues : nextValues[0];
        const current = this.outputValue();
        const hasNaN = Array.isArray(next) ? next.some((v) => Number.isNaN(v)) : Number.isNaN(next);
        if (hasNaN || areValuesEqual(next, current)) {
            return false;
        }
        this.lastChangeReason = reason;
        this.value.set(next);
        this.cva.setValue(next);
        this.onValueChange.emit(next);
        return true;
    }

    /** @ignore Keyboard / native input path: clamps to neighbours, commits immediately. */
    handleInputChange(valueInput: number, index: number, reason = 'keyboard'): void {
        if (this.isDisabled()) {
            return;
        }
        const result = getSliderValue(valueInput, index, this.min(), this.max(), this.range(), this.values());
        if (!validateMinimumDistance(result, this.step(), this.minStepsBetweenValues())) {
            return;
        }
        const arr = Array.isArray(result) ? result : [result];
        const applied = this.setValue(arr, reason);
        this.cva.markAsTouched();
        if (applied) {
            this.onValueCommitted.emit(this.outputValue());
        }
    }

    /** @ignore Emits the committed value at the end of a pointer drag. */
    commitValue(): void {
        this.onValueCommitted.emit(this.outputValue());
    }

    /** @ignore */
    markAsTouched(): void {
        this.cva.markAsTouched();
    }

    /** @ignore */
    setDragging(dragging: boolean): void {
        this.dragging.set(dragging);
    }

    /** @ignore */
    resetPressedThumb(): void {
        this.pressedThumbIndex = -1;
        this.pressedThumbCenterOffset = null;
        this.pressedInput = null;
    }
}
