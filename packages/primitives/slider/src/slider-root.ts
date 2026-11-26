import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    Directive,
    ElementRef,
    inject,
    input,
    model,
    numberAttribute,
    output,
    signal,
    Signal,
    untracked
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createLabelRegistry,
    getActiveElement,
    injectDocument,
    injectId,
    NumberInput,
    provideFormUiState,
    provideValueAccessor,
    RdxCancelableChangeEventDetails,
    RdxFormUiControlBase,
    RdxFormUiStateHost,
    RdxFormUiTouchTarget,
    useElementRegistry,
    useNativeFormReset,
    watch
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
    readonly inputId: Signal<string | undefined>;
    /** Whether this thumb is disabled (own state OR root disabled). */
    readonly disabled: Signal<boolean>;
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
    providers: [
        provideSliderRootContext(() => inject(RdxSliderRoot)),
        provideFormUiState(() => inject(RdxSliderRoot).formUi),
        provideValueAccessor(RdxSliderRoot)
    ],
    hostDirectives: [RdxFormUiStateHost],
    host: {
        role: 'group',
        '[id]': 'id()',
        '[attr.aria-labelledby]': 'labelledBy()',
        '[attr.dir]': 'dir()',
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-dragging]': 'dragging() ? "" : undefined'
    }
})
// NOTE: does not `implements RdxFormValueControl` — the slider value is a `number | number[]` union,
// while `min`/`max` are scalar `number`s; the shim ties `min`/`max` to `NonNullable<TValue>`, which the
// union can't satisfy. The runtime contract (value model + the inherited `FormUiControl` state) holds.
export class RdxSliderRoot extends RdxFormUiControlBase implements ControlValueAccessor {
    private readonly document = injectDocument();
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

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

    /** Name of the native range input rendered by each thumb, for form submission. */
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

    /** Editable model for Angular Forms and `[(value)]`. Null displays the minimum. */
    readonly value = model<SliderValue | null>();

    /** Parent-owned value. Edit requests leave it in place until the parent supplies a new value. */
    readonly controlledValue = input<SliderValue | null>();

    readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
    /** @ignore */
    readonly labelRegistry = createLabelRegistry();
    /** @ignore */
    readonly labelledBy = computed(() => this.ariaLabelledBy() ?? this.labelRegistry.labelId());

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

    /** @ignore */
    readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
    private readonly formDisabled = signal(false);
    private readonly initialDefault = signal<SliderValue | undefined>(undefined);
    private initialEditableValue: SliderValue | null | undefined;
    private onChange?: (value: SliderValue | null) => void;
    private onTouched?: () => void;
    /** @ignore */
    readonly inset = computed(() => this.thumbAlignment() !== 'center');

    private readonly currentRaw = computed<SliderValue>(() => {
        const controlled = this.controlledValue();
        const value = controlled === undefined ? this.value() : controlled;
        if (value === null) return this.min();
        return value ?? this.initialDefault() ?? this.defaultValue() ?? this.min();
    });

    /** Whether the slider has multiple thumbs (the value is an array). */
    readonly range = computed(() => Array.isArray(this.currentRaw()));

    /** The clamped values rendered to the user, sorted ascending for range sliders. */
    readonly values = computed<number[]>(() => {
        const raw = this.currentRaw();
        const min = this.min();
        const max = this.max();
        const arr = (Array.isArray(raw) ? raw.slice() : [raw]).map((v) => clamp(v, min, max));
        return this.range() ? arr.sort(asc) : arr;
    });

    private readonly thumbs = useElementRegistry<RdxSliderThumbRef>();
    /** Registered thumbs in DOM order. */
    readonly thumbList = this.thumbs.items;

    /** Input ids registered by thumbs, in DOM order. */
    readonly thumbInputIds = computed(() =>
        this.thumbList()
            .map((thumb) => thumb.inputId())
            .filter((inputId): inputId is string => typeof inputId === 'string' && inputId.length > 0)
    );

    constructor() {
        super();

        watch([], () => {
            const fallback = this.defaultValue() ?? this.min();
            const value = this.value();
            this.initialDefault.set(Array.isArray(fallback) ? [...fallback] : fallback);
            this.initialEditableValue = Array.isArray(value) ? [...value] : value;
        });

        useNativeFormReset(
            () => {
                const input = this.thumbList().find((thumb) => thumb.inputElement)?.inputElement;
                if (input) return input.form;
                const form = this.form();
                const owner = form === undefined ? this.element.closest('form') : this.document.getElementById(form);
                return owner?.localName === 'form' ? (owner as HTMLFormElement) : null;
            },
            () => {
                if (this.controlledValue() === undefined && !this.resetNgControl(undefined)) {
                    const value = this.initialEditableValue;
                    this.value.set(Array.isArray(value) ? [...value] : value);
                }
                this.reset();
            }
        );

        afterRenderEffect(() => {
            if (!this.isDisabled()) return;
            const focused = getActiveElement(this.document);
            if (focused && this.thumbList().some(({ inputElement }) => inputElement === focused)) {
                (focused as HTMLElement).blur();
            }
            this.setActive(-1);
        });
    }

    /** @ignore */
    registerThumb(thumb: RdxSliderThumbRef): () => void {
        return this.thumbs.register(thumb);
    }

    /** @ignore */
    thumbIndexOf(thumb: RdxSliderThumbRef): number {
        return this.thumbs.indexOf(thumb.element);
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

    /**
     * @ignore
     * Applies a new full set of values, preserving the single/range value shape.
     * Returns `false` when the value did not change.
     */
    setValue(nextValues: number[], reason: RdxSliderValueChangeReason, event?: Event, activeThumbIndex = -1): boolean {
        if (this.isDisabled()) return false;
        const next: SliderValue = this.range() ? nextValues : nextValues[0];
        const current = this.currentRaw();
        const hasNaN = Array.isArray(next) ? next.some((v) => Number.isNaN(v)) : Number.isNaN(next);
        if (
            hasNaN ||
            areValuesEqual(next, current) ||
            !validateMinimumDistance(next, this.step(), this.minStepsBetweenValues())
        ) {
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

        if (this.controlledValue() === undefined) {
            this.value.set(next);
            this.onChange?.(next);
            this.formUi.markDirty();
        }
        return true;
    }

    /** @ignore Keyboard / native input path: clamps to neighbours, commits immediately. */
    handleInputChange(
        valueInput: number,
        index: number,
        reason: RdxSliderValueChangeReason = 'keyboard',
        event?: Event
    ): void {
        if (
            this.isDisabled() ||
            event?.defaultPrevented ||
            this.thumbList()[index]?.disabled() ||
            this.values()[index] === undefined
        ) {
            return;
        }
        const result = getSliderValue(valueInput, index, this.min(), this.max(), this.range(), this.values());
        if (!validateMinimumDistance(result, this.step(), this.minStepsBetweenValues())) {
            return;
        }
        const arr = Array.isArray(result) ? result : [result];
        const applied = this.setValue(arr, reason, event, index);
        this.markAsTouched();
        if (applied) {
            this.commitValue(result, event, reason);
        }
    }

    /** @ignore Emits the committed value at the end of a pointer drag. */
    commitValue(value: SliderValue, event: Event | undefined, reason: RdxSliderValueCommitReason): void {
        const commitEvent = event ?? new Event('slider.value-commit');
        const trigger = commitEvent.currentTarget instanceof HTMLElement ? commitEvent.currentTarget : undefined;
        this.onValueCommitted.emit({
            value,
            eventDetails: {
                reason,
                event: commitEvent,
                trigger
            }
        });
    }

    /** @ignore Bridge the CVA into `markAsTouched` (dual). */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return { markAsTouched: () => this.onTouched?.() };
    }

    /** @ignore */
    writeValue(value: SliderValue | null): void {
        untracked(() => this.value.set(value));
    }

    /** @ignore */
    registerOnChange(fn: (value: SliderValue | null) => void): void {
        this.onChange = fn;
    }

    /** @ignore */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** @ignore */
    setDisabledState(disabled: boolean): void {
        this.formDisabled.set(disabled);
    }

    /** @ignore Mark touched: CVA (Reactive/template) + `touched` model + `touch` (Signal Forms). */
    markAsTouched(): void {
        this.formUi.markAsTouched();
    }

    /** @ignore */
    setDragging(dragging: boolean): void {
        this.dragging.set(dragging);
    }

    /** @ignore */
    getOwnerWindow(): Window | undefined {
        return this.document.defaultView ?? undefined;
    }
}
