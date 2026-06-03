import { numberOrUndefined, toValidatedNumber, useNumberFormatter, useNumberParser } from './number-field.utils';
import { provideNumberFieldRootContext } from './number-field-context';
import { Direction, InputMode, NumberFieldChangeReason, REASONS } from './types';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    model,
    numberAttribute,
    output,
    signal,
    untracked
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    injectControlValueAccessor,
    injectId,
    NumberInput,
    RdxCancelableChangeEventDetails,
    RdxControlValueAccessor,
    RdxFormUiControlBase,
    RdxFormUiTouchTarget,
    RdxFormValueControl
} from '@radix-ng/primitives/core';

const INPUT_REASONS: NumberFieldChangeReason[] = [
    REASONS.inputChange,
    REASONS.inputClear,
    REASONS.inputBlur,
    REASONS.inputPaste,
    REASONS.none
];

export type RdxNumberFieldValueChangeEventDetails = RdxCancelableChangeEventDetails<NumberFieldChangeReason>;

export interface RdxNumberFieldValueChangeEvent {
    value: number | null;
    eventDetails: RdxNumberFieldValueChangeEventDetails;
}

/**
 * Groups all parts of the number field and manages its state, parsing/formatting
 * and value-change logic. A single directive drives the whole family — parts read
 * signals and call methods off it through the root context.
 *
 * @see https://base-ui.com/react/components/number-field
 */
@Directive({
    selector: 'div[rdxNumberFieldRoot]',
    exportAs: 'rdxNumberFieldRoot',
    providers: [provideNumberFieldRootContext(() => inject(RdxNumberFieldRoot))],
    hostDirectives: [
        {
            directive: RdxControlValueAccessor,
            inputs: ['value: value', 'disabled']
        }
    ],
    host: {
        role: 'group',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-required]': 'required() ? "" : undefined',
        '[attr.data-invalid]': 'invalidState() ? "" : undefined',
        '[attr.data-valid]': 'invalidState() ? undefined : ""',
        '[attr.data-touched]': 'touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() ? "" : undefined',
        '[attr.data-scrubbing]': 'isScrubbing() ? "" : undefined'
    }
})
export class RdxNumberFieldRoot extends RdxFormUiControlBase implements RdxFormValueControl<number | null> {
    /** @ignore */
    protected readonly cva = injectControlValueAccessor<number | null>();

    /** The id of the input element. */
    readonly id = input<string>(injectId('rdx-number-field-'));

    /** The minimum value of the field. */
    readonly min = input<number | undefined, NumberInput>(undefined, { transform: numberOrUndefined });

    /** The maximum value of the field. */
    readonly max = input<number | undefined, NumberInput>(undefined, { transform: numberOrUndefined });

    /**
     * Amount to increment and decrement with the buttons, arrow keys and scrub area.
     * @default 1
     */
    readonly step = input<number, NumberInput>(1, { transform: numberAttribute });

    /**
     * The step used when incrementing while the Alt key is held. Snaps to multiples of this value.
     * @default 0.1
     */
    readonly smallStep = input<number, NumberInput>(0.1, { transform: numberAttribute });

    /**
     * The step used when incrementing while the Shift key is held. Snaps to multiples of this value.
     * @default 10
     */
    readonly largeStep = input<number, NumberInput>(10, { transform: numberAttribute });

    /**
     * Whether the value should snap to the nearest step when incrementing or decrementing.
     * @default false
     */
    readonly snapOnStep = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * When `true`, direct text entry may go outside the `min`/`max` range without clamping.
     * Step interactions (arrow keys, buttons, wheel, scrub) still clamp.
     * @default false
     */
    readonly allowOutOfRange = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the value can be changed with the mouse wheel while the input is focused.
     * @default false
     */
    readonly allowWheelScrub = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Options used to format the input value (forwarded to `Intl.NumberFormat`). */
    readonly format = input<Intl.NumberFormatOptions>();

    /** The locale used to parse and format the value. */
    readonly locale = input<string>('en');

    /**
     * When `true`, the user cannot interact with the field.
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * When `true`, the field is focusable but its value cannot be changed.
     * @default false
     */
    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * When `true`, the user must enter a value before the owning form can be submitted.
     * @default false
     */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Name of the hidden input rendered by `[rdxNumberFieldHiddenInput]`, for form submission. */
    readonly name = input<string>();

    /** Id of the form the hidden input belongs to. Useful when it is rendered outside the form. */
    readonly form = input<string>();

    /** The uncontrolled value of the field when it is initially rendered. */
    readonly defaultValue = input<number>();

    /** The controlled value of the field. Use with `(onValueChange)` or two-way `[(value)]`. */
    readonly value = model<number | null>(null);

    /** Emitted when the value changes (during interaction or programmatically). */
    readonly onValueChange = output<RdxNumberFieldValueChangeEvent>();

    /**
     * Emitted when the value is committed: on blur after typing, or when a pointer is released
     * after scrubbing or pressing a button. Fires together with `onValueChange` for keyboard input.
     */
    readonly onValueCommitted = output<number | null>();

    /** @ignore The formatted text shown in the input element. */
    readonly inputValue = signal('');

    /** @ignore Whether a scrub gesture is in progress. */
    readonly isScrubbing = signal(false);

    /** @ignore The native input element, registered by `[rdxNumberFieldInput]`. */
    readonly inputEl = signal<HTMLInputElement | undefined>(undefined);

    /**
     * @ignore Gate that prevents the formatted value from overwriting in-progress typing.
     * Plain field (not a signal): it is toggled imperatively inside event handlers.
     */
    allowInputSync = true;
    /** @ignore Last value produced by `setValue`, used to report the committed value. */
    lastChangedValue: number | null = null;
    /** @ignore Whether a programmatic change is awaiting a commit. */
    hasPendingCommit = false;

    /** @ignore */
    readonly isDisabled = computed(() => !!this.cva.disabled());

    /** @ignore */
    readonly invalidState = this.formUi.invalidState;
    /** @ignore */
    readonly touchedState = this.formUi.touchedState;
    /** @ignore */
    readonly dirtyState = this.formUi.dirtyState;

    private readonly formatter = useNumberFormatter(this.locale, this.format);
    private readonly parser = useNumberParser(this.locale, this.format);

    /** @ignore The current numeric value (`null` when empty). */
    readonly currentValue = computed<number | null>(() => this.cva.value() ?? null);

    /** @ignore */
    readonly minWithDefault = computed(() => this.min() ?? Number.MIN_SAFE_INTEGER);
    /** @ignore */
    readonly maxWithDefault = computed(() => this.max() ?? Number.MAX_SAFE_INTEGER);
    /** @ignore */
    readonly minWithZeroDefault = computed(() => this.min() ?? 0);

    /** @ignore Whether incrementing further is a no-op (value already at max). */
    readonly isIncrementDisabled = computed(() => {
        const value = this.currentValue();
        return value != null && value >= this.maxWithDefault();
    });
    /** @ignore Whether decrementing further is a no-op (value already at min). */
    readonly isDecrementDisabled = computed(() => {
        const value = this.currentValue();
        return value != null && value <= this.minWithDefault();
    });

    /** @ignore Software-keyboard hint based on whether the format allows fractional digits. */
    readonly inputMode = computed<InputMode>(() => {
        const hasDecimals = (this.formatter().resolvedOptions().maximumFractionDigits ?? 0) > 0;
        return hasDecimals ? 'decimal' : 'numeric';
    });

    constructor() {
        super();

        // Apply the uncontrolled initial value once it is provided.
        effect(() => {
            const dv = this.defaultValue();
            if (dv !== undefined) {
                untracked(() => {
                    this.value.set(dv);
                    this.cva.setValue(dv);
                });
            }
        });

        // Keep the visible input in sync with the value whenever it changes externally or the
        // formatting options change. Skipped while the user is typing (`allowInputSync === false`).
        effect(() => {
            const formatted = this.formatNumber(this.currentValue());
            untracked(() => {
                if (this.allowInputSync && this.inputValue() !== formatted) {
                    this.inputValue.set(formatted);
                }
            });
        });
    }

    /** @ignore Formats a numeric value to its display string (empty for `null`/`NaN`). */
    formatNumber(value: number | null): string {
        if (value === null || Number.isNaN(value)) {
            return '';
        }
        return this.formatter().format(value);
    }

    /** @ignore Parses a display string to a number, returning `null` when not parseable. */
    parseNumber(text: string): number | null {
        const parsed = this.parser().parse(text);
        return Number.isNaN(parsed) ? null : parsed;
    }

    /** @ignore Whether `text` is a valid partial number for the current locale and bounds. */
    isValidPartial(text: string): boolean {
        return this.parser().isValidPartialNumber(text, this.min(), this.max());
    }

    /** @ignore The step magnitude for an interaction, honouring Alt (small) and Shift (large). */
    getStepAmount(event?: { altKey?: boolean; shiftKey?: boolean }): number {
        if (event?.altKey) {
            return this.smallStep();
        }
        if (event?.shiftKey) {
            return this.largeStep();
        }
        return this.step();
    }

    /** @ignore Registers the native input element. */
    registerInput(el: HTMLInputElement): void {
        this.inputEl.set(el);
    }

    /** @ignore Sets the displayed text without changing the numeric value. */
    setInputValue(text: string): void {
        this.inputValue.set(text);
    }

    /**
     * @ignore Mark the field touched — CVA for Reactive forms, plus the `touched` model + `touch`
     * output for Signal Forms.
     */
    markAsTouched(): void {
        this.formUi.markAsTouched();
    }

    /** @ignore Bridge the CVA into `markAsTouched` (dual). */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return injectControlValueAccessor<number | null>();
    }

    /**
     * @ignore
     * Validates and applies a candidate value, emitting `onValueChange` when it changes.
     * Returns whether a change was fired.
     */
    setValue(
        unvalidatedValue: number | null,
        reason: NumberFieldChangeReason,
        event?: Event,
        direction?: Direction
    ): boolean {
        const keyState = event as (Event & { altKey?: boolean; shiftKey?: boolean }) | undefined;
        // Step interactions always clamp; direct text entry may go out of range when allowed.
        const shouldClamp = !this.allowOutOfRange() || !INPUT_REASONS.includes(reason);

        const validatedValue = toValidatedNumber(unvalidatedValue, {
            step: direction ? this.getStepAmount(keyState) * direction : undefined,
            minWithDefault: this.minWithDefault(),
            maxWithDefault: this.maxWithDefault(),
            minWithZeroDefault: this.minWithZeroDefault(),
            format: this.format(),
            locale: this.locale(),
            snapOnStep: this.snapOnStep(),
            small: keyState?.altKey ?? false,
            clamp: shouldClamp
        });

        const value = this.currentValue();
        const isInputReason = INPUT_REASONS.includes(reason);
        const shouldFireChange =
            validatedValue !== value ||
            (isInputReason && (unvalidatedValue !== value || this.allowInputSync === false));

        if (shouldFireChange) {
            const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
            const { eventDetails } = createCancelableChangeEventDetails(
                reason,
                event ?? new Event('number-field.value-change'),
                trigger
            );
            this.onValueChange.emit({ value: validatedValue, eventDetails });
            if (eventDetails.isCanceled()) {
                return false;
            }

            this.applyValue(validatedValue);
            this.hasPendingCommit = true;
        }

        this.lastChangedValue = validatedValue;

        if (this.allowInputSync) {
            this.setInputValue(this.formatNumber(validatedValue));
        }

        return shouldFireChange;
    }

    /**
     * @ignore
     * Increments (or decrements) the value by `amount * direction`, starting from `currentValue`
     * when supplied (the live, possibly-dirty input value) or the committed value otherwise.
     */
    incrementValue(
        amount: number,
        params: { direction: Direction; currentValue?: number | null; event?: Event; reason: NumberFieldChangeReason }
    ): boolean {
        const prev = params.currentValue == null ? this.currentValue() : params.currentValue;
        const nextValue = typeof prev === 'number' ? prev + amount * params.direction : Math.max(0, this.min() ?? 0);
        return this.setValue(nextValue, params.reason, params.event, params.direction);
    }

    /** @ignore Emits the committed value at the end of an interaction. */
    commitValue(value: number | null): void {
        this.hasPendingCommit = false;
        this.onValueCommitted.emit(value);
    }

    private applyValue(value: number | null): void {
        this.value.set(value);
        this.cva.setValue(value);
        this.formUi.markDirty();
    }
}
