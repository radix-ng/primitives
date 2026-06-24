import {
    afterNextRender,
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    output,
    signal
} from '@angular/core';
import { BooleanInput, NumberInput, RdxFormValueControl, RdxValidationError } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from '@radix-ng/primitives/field';

let inputId = 0;

const attr = (value: boolean) => (value ? '' : undefined);
const numberOrUndefined = (value: unknown): number | undefined =>
    value == null || value === '' ? undefined : Number(value);

/**
 * The input value. Native text inputs always produce strings, so the model is
 * `string` — matching Signal Forms' `FormValueControl<string>` round-trip.
 */
export type RdxInputValue = string;

export interface RdxInputValueChangeEventDetails {
    event: Event;
    cancel: () => void;
    isCanceled: () => boolean;
}

export interface RdxInputValueChangeEvent {
    value: string;
    eventDetails: RdxInputValueChangeEventDetails;
}

/**
 * A headless text input that can integrate with Field for accessible labeling,
 * descriptions, validation state, and data attributes.
 *
 * @group Components
 */
@Directive({
    selector: 'input[rdxInput]',
    exportAs: 'rdxInput',
    host: {
        '[attr.id]': 'id()',
        '[attr.name]': 'name() || undefined',
        '[attr.aria-describedby]': 'describedBy()',
        // Validity follows the field's tri-state `displayValid` when inside a `rdxFieldRoot` (neutral →
        // no aria-invalid, neither data-valid nor data-invalid), else the input's own binary invalidity.
        '[attr.aria-invalid]': 'displayValid() === false ? "true" : undefined',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.aria-disabled]': 'disabledState() ? "true" : undefined',
        '[attr.disabled]': 'disabledState() ? "" : undefined',
        '[attr.required]': 'requiredState() ? "" : undefined',
        '[attr.readonly]': 'readonly() ? "" : undefined',
        '[attr.minlength]': 'minLength() ?? undefined',
        '[attr.maxlength]': 'maxLength() ?? undefined',
        '[attr.pattern]': 'patternAttr()',
        '[attr.data-invalid]': 'dataAttr(displayValid() === false)',
        '[attr.data-valid]': 'dataAttr(displayValid() === true)',
        '[attr.data-disabled]': 'dataAttr(disabledState())',
        '[attr.data-required]': 'dataAttr(requiredState())',
        '[attr.data-readonly]': 'dataAttr(readonly())',
        '[attr.data-filled]': 'dataAttr(filledState())',
        '[attr.data-focused]': 'dataAttr(focusedState())',
        '[attr.data-touched]': 'dataAttr(touchedState())',
        '[attr.data-dirty]': 'dataAttr(dirtyState())',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(input)': 'onInput($event)',
        '(change)': 'syncFieldState()'
    }
})
export class RdxInputDirective implements RdxFormValueControl<RdxInputValue | undefined> {
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
    private readonly fieldRootContext = injectFieldRootContext(true);
    private initialValue = '';
    private defaultValueApplied = false;
    private readonly filledValue = signal(false);
    private readonly focusedValue = signal(false);
    private readonly dirtyValue = signal(false);

    /**
     * The input id. Field labels and descriptions use this value for accessible relationships.
     *
     * @group Props
     */
    readonly id = input(`rdx-input-${inputId++}`);

    /**
     * The name of the input, submitted with the form data and used by Form-level
     * error matching.
     *
     * @group Props
     */
    readonly name = input<string>();

    /**
     * The controlled input value.
     *
     * @group Props
     */
    readonly value = model<RdxInputValue | undefined>(undefined);

    /**
     * The initial value when the input is uncontrolled.
     *
     * @group Props
     */
    readonly defaultValue = input<RdxInputValue | undefined>(undefined);

    /**
     * Whether the input is disabled.
     *
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the input is read-only.
     *
     * @group Props
     */
    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the input is required.
     *
     * @group Props
     */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the input is invalid.
     *
     * @group Props
     */
    readonly invalid = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the input has been touched. A two-way model: the input sets it on
     * blur (emitting `touchedChange`, which Signal Forms' `[formField]` listens
     * to), and a form system can write it back.
     *
     * @group Props
     */
    readonly touched = model<boolean>(false);

    /**
     * Whether the input value has changed from its initial value. Merged with the
     * internally tracked state; a form system can own it through this input.
     *
     * @group Props
     */
    readonly dirty = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Validation errors for the input. A non-empty list marks the input invalid.
     *
     * @group Props
     */
    readonly errors = input<readonly RdxValidationError[]>([]);

    /**
     * Minimum number of characters.
     *
     * @group Props
     */
    readonly minLength = input<number | undefined, NumberInput>(undefined, { transform: numberOrUndefined });

    /**
     * Maximum number of characters.
     *
     * @group Props
     */
    readonly maxLength = input<number | undefined, NumberInput>(undefined, { transform: numberOrUndefined });

    /**
     * Patterns the value must match. Reflected to the native `pattern` attribute
     * only when exactly one pattern is provided (the attribute holds a single regex).
     *
     * @group Props
     */
    readonly pattern = input<readonly RegExp[]>([]);

    /**
     * Emits when the input value changes.
     *
     * @group Emits
     */
    readonly onValueChange = output<RdxInputValueChangeEvent>();

    /**
     * Emits on blur, notifying a form system the input was touched. Stable
     * Angular 22 Signal Forms listens to this `touch` output; the 21.x
     * experimental implementation listens to the `touched` model's
     * `touchedChange` instead — both are emitted, covering either version.
     *
     * @group Emits
     */
    readonly touch = output<void>();

    /** The input's own binary invalidity (its `invalid` input or a non-empty `errors` list). */
    private readonly ownInvalid = computed(() => this.invalid() || (this.errors()?.length ?? 0) > 0);

    /**
     * Tri-state *displayed* validity: inside a `rdxFieldRoot` the field's gated `validState` is the single
     * source (so a field whose `validationMode` defers display (e.g. `onBlur`) keeps the input neutral until revealed), otherwise
     * the input's own binary invalidity. `true` valid / `false` invalid / `null` neutral.
     */
    protected readonly displayValid = computed<boolean | null>(() =>
        this.fieldRootContext ? this.fieldRootContext.validState() : this.ownInvalid() ? false : true
    );
    protected readonly disabledState = computed(
        () => this.disabled() || Boolean(this.fieldRootContext?.disabledState())
    );
    protected readonly requiredState = computed(
        () => this.required() || Boolean(this.fieldRootContext?.requiredState())
    );
    protected readonly filledState = computed(
        () => this.filledValue() || Boolean(this.fieldRootContext?.filledState())
    );
    protected readonly focusedState = computed(
        () => this.focusedValue() || Boolean(this.fieldRootContext?.focusedState())
    );
    protected readonly touchedState = computed(() => this.touched() || Boolean(this.fieldRootContext?.touchedState()));
    protected readonly dirtyState = computed(
        () => this.dirty() || this.dirtyValue() || Boolean(this.fieldRootContext?.dirtyState())
    );

    protected readonly patternAttr = computed(() => {
        const patterns = this.pattern();
        return patterns?.length === 1 ? patterns[0].source : undefined;
    });

    protected readonly describedBy = computed(() => {
        if (!this.fieldRootContext) {
            return undefined;
        }

        const ids = [
            ...this.fieldRootContext.descriptionIds(),
            ...(this.fieldRootContext.invalidState() ? this.fieldRootContext.errorIds() : [])
        ];

        return ids.length ? ids.join(' ') : undefined;
    });

    constructor() {
        effect(() => {
            const value = this.value();

            if (value !== undefined) {
                this.writeValue(value);
            }
        });

        effect(() => {
            const defaultValue = this.defaultValue();

            if (this.value() === undefined && defaultValue !== undefined && !this.defaultValueApplied) {
                this.defaultValueApplied = true;
                this.writeValue(defaultValue);
            }
        });

        effect(() => {
            this.fieldRootContext?.setControlId(this.id());
        });

        afterNextRender(() => {
            this.initialValue = this.element.value;
            this.syncFieldState();
        });
    }

    onFocus(): void {
        this.focusedValue.set(true);
        this.fieldRootContext?.setFocused(true);
    }

    onBlur(): void {
        this.focusedValue.set(false);
        this.touched.set(true);
        this.touch.emit();
        this.fieldRootContext?.setFocused(false);
        this.fieldRootContext?.setTouched(true);
    }

    onInput(event: Event): void {
        const nextValue = this.element.value;
        let canceled = false;

        const eventDetails: RdxInputValueChangeEventDetails = {
            event,
            cancel: () => {
                canceled = true;
            },
            isCanceled: () => canceled
        };

        this.onValueChange.emit({ value: nextValue, eventDetails });

        if (canceled) {
            this.writeValue(this.value() ?? this.defaultValue() ?? '');
            return;
        }

        this.value.set(nextValue);
        this.syncFieldState();
    }

    syncFieldState(): void {
        const value = this.element.value;

        this.filledValue.set(value !== '');
        this.dirtyValue.set(value !== this.initialValue);
        this.fieldRootContext?.setFilled(value !== '');
        this.fieldRootContext?.setDirty(value !== this.initialValue);
    }

    private writeValue(value: RdxInputValue): void {
        this.element.value = value;
        this.syncFieldState();
    }

    protected readonly dataAttr = attr;
}
