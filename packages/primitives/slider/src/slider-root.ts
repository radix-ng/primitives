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
import { RdxCompositeList } from '@radix-ng/primitives/composite';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    injectControlValueAccessor,
    injectDocument,
    injectId,
    NumberInput,
    RdxCancelableChangeEventDetails,
    RdxControlValueAccessor
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
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
export type RdxSliderThumbAlignment = 'center' | 'edge' | 'edge-client-only';
export type RdxSliderValueChangeReason = 'input-change' | 'track-press' | 'drag' | 'keyboard' | 'none';
export type RdxSliderValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxSliderValueChangeReason> & {
    activeThumbIndex: number;
};
export type RdxSliderValueCommitReason = RdxSliderValueChangeReason;

export interface RdxSliderValueCommitEventDetails {
    reason: RdxSliderValueCommitReason;
    event: Event;
    trigger: HTMLElement | undefined;
}

export interface RdxSliderValueChangeEvent {
    value: SliderValue;
    eventDetails: RdxSliderValueChangeEventDetails;
}

export interface RdxSliderValueCommitEvent {
    value: SliderValue;
    eventDetails: RdxSliderValueCommitEventDetails;
}

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

function cloneChangeEventWithTarget(event: Event, value: SliderValue, name: string | undefined): Event {
    const EventCtor = event.constructor as typeof Event;
    let clonedEvent: Event;
    try {
        clonedEvent = new EventCtor(event.type, event);
    } catch {
        clonedEvent = new Event(event.type, event);
    }

    Object.defineProperty(clonedEvent, 'target', {
        writable: true,
        value: { value, name }
    });

    return clonedEvent;
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
        RdxCompositeList,
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
    private readonly document = injectDocument();

    readonly id = input<string>(injectId('rdx-slider-'));

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
    readonly dirInput = input<'ltr' | 'rtl' | undefined>(undefined, { alias: 'dir' });
    readonly dir = injectDirection(this.dirInput);

    /**
     * How thumbs behave when they meet in a range slider.
     * @default 'push'
     */
    readonly thumbCollisionBehavior = input<ThumbCollisionBehavior>('push');

    /**
     * How the thumbs align with the control when the value is at min/max.
     * `center` aligns the thumb center to the control edge; `edge`/`edge-client-only`
     * inset thumbs so their outer edge aligns to the control edge.
     * @default 'center'
     */
    readonly thumbAlignment = input<RdxSliderThumbAlignment>('center');

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
    readonly onValueChange = output<RdxSliderValueChangeEvent>();

    /** Emitted when interaction ends, with the final value — useful for committing to a backend. */
    readonly onValueCommitted = output<RdxSliderValueCommitEvent>();

    /** @ignore */
    readonly controlRef = signal<HTMLElement | null>(null);

    /** @ignore Active thumb index (-1 when none). */
    readonly active = signal(-1);
    /** @ignore Last thumb index that was focused/used, drives z-index stacking. */
    readonly lastUsedThumbIndex = signal(-1);
    /** @ignore Whether a pointer drag is in progress. */
    readonly dragging = signal(false);
    /** @ignore Edge-aligned thumb/indicator positions, in control-relative percentages. */
    readonly indicatorPosition = signal<[number | undefined, number | undefined]>([undefined, undefined]);

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
    lastChangeEvent: Event | undefined;

    /** @ignore */
    readonly isDisabled = computed(() => !!this.cva.disabled());
    /** @ignore */
    readonly inset = computed(() => this.thumbAlignment() !== 'center');
    /** @ignore */
    readonly renderBeforeHydration = computed(() => this.thumbAlignment() === 'edge');

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
    setIndicatorPosition(index: number, position: number | undefined): void {
        this.indicatorPosition.update(([start, end]) => {
            if (index === 0) {
                return [position, end];
            }
            if (index === this.values().length - 1) {
                return [start, position];
            }
            return [start, end];
        });
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
    setValue(nextValues: number[], reason: RdxSliderValueChangeReason, event?: Event, activeThumbIndex = -1): boolean {
        const next: SliderValue = this.range() ? nextValues : nextValues[0];
        const current = this.outputValue();
        const hasNaN = Array.isArray(next) ? next.some((v) => Number.isNaN(v)) : Number.isNaN(next);
        if (hasNaN || areValuesEqual(next, current)) {
            return false;
        }

        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const changeEvent = cloneChangeEventWithTarget(event ?? new Event('slider.value-change'), next, this.name());
        const { eventDetails: baseEventDetails } = createCancelableChangeEventDetails(reason, changeEvent, trigger);
        const eventDetails = Object.assign(baseEventDetails, { activeThumbIndex }) as RdxSliderValueChangeEventDetails;
        this.onValueChange.emit({ value: next, eventDetails });
        if (eventDetails.isCanceled()) {
            return false;
        }

        this.lastChangeReason = reason;
        this.lastChangeEvent = eventDetails.event;
        this.value.set(next);
        this.cva.setValue(next);
        return true;
    }

    /** @ignore Keyboard / native input path: clamps to neighbours, commits immediately. */
    handleInputChange(
        valueInput: number,
        index: number,
        reason: RdxSliderValueChangeReason = 'keyboard',
        event?: Event
    ): void {
        if (this.isDisabled()) {
            return;
        }
        const result = getSliderValue(valueInput, index, this.min(), this.max(), this.range(), this.values());
        if (!validateMinimumDistance(result, this.step(), this.minStepsBetweenValues())) {
            return;
        }
        const arr = Array.isArray(result) ? result : [result];
        const applied = this.setValue(arr, reason, event, index);
        this.cva.markAsTouched();
        if (applied) {
            this.commitValue(event, reason);
        }
    }

    /** @ignore Emits the committed value at the end of a pointer drag. */
    commitValue(
        event?: Event,
        reason: RdxSliderValueCommitReason = this.lastChangeReason as RdxSliderValueCommitReason
    ): void {
        const commitEvent = event ?? this.lastChangeEvent ?? new Event('slider.value-commit');
        const trigger = commitEvent.currentTarget instanceof HTMLElement ? commitEvent.currentTarget : undefined;
        this.onValueCommitted.emit({
            value: this.outputValue(),
            eventDetails: {
                reason,
                event: commitEvent,
                trigger
            }
        });
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

    /** @ignore */
    getOwnerWindow(): Window | undefined {
        return this.document.defaultView ?? undefined;
    }
}
