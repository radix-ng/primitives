import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectorRef,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    output,
    signal
} from '@angular/core';
import { NgControl } from '@angular/forms';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    injectNgControlState,
    NumberInput,
    RdxCancelableChangeEventDetails,
    RdxFormValueControl,
    RdxValidationError,
    useNativeFormReset,
    watch
} from '@radix-ng/primitives/core';
import { injectFieldRootContext, useFieldNativeValidity } from '@radix-ng/primitives/field';

let inputId = 0;

const attr = (value: boolean) => (value ? '' : undefined);
const numberOrUndefined = (value: unknown): number | undefined =>
    value == null || value === '' ? undefined : Number(value);

/**
 * The input value. Native text inputs always produce strings, so the model is
 * `string` — matching Signal Forms' `FormValueControl<string>` round-trip.
 */
export type RdxInputValue = string;

export type RdxInputValueChangeEventDetails = Pick<
    RdxCancelableChangeEventDetails<'none'>,
    'reason' | 'event' | 'cancel' | 'isCanceled'
>;

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
        '[attr.name]': 'effectiveName() || undefined',
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
        '(keydown)': 'onKeyDown($event)',
        '(beforeinput)': 'onBeforeInput($event)',
        '(input)': 'onInput($event)',
        '(change)': 'onChange($event)'
    }
})
export class RdxInputDirective implements RdxFormValueControl<RdxInputValue | undefined> {
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
    private readonly fieldRootContext = injectFieldRootContext(true);
    private readonly ngControl = inject(NgControl, { self: true, optional: true });
    private readonly legacyForm = this.ngControl instanceof NgControl;
    private readonly ngControlState = injectNgControlState();
    private readonly destroyRef = inject(DestroyRef);
    private readonly view = inject(ChangeDetectorRef);
    private initialValue = '';
    private committedValue = '';
    private readonly pendingControlledEdit = signal<string | undefined>(undefined);
    private readonly initialStandaloneValue = signal<string | undefined>(undefined);
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
     * The editable input value for two-way binding and Angular Forms.
     *
     * @group Props
     */
    readonly value = model<RdxInputValue | undefined>(undefined);

    /** Parent-owned text. Angular Forms take precedence when present. */
    readonly controlledValue = input<RdxInputValue>();

    /**
     * The initial value when the input is uncontrolled.
     *
     * @group Props
     */
    readonly defaultValue = input<RdxInputValue | undefined>(undefined);

    private readonly parentValue = computed(() => (this.ngControl ? undefined : this.controlledValue()));
    private readonly effectiveValue = computed(
        () => this.parentValue() ?? this.value() ?? this.initialStandaloneValue()
    );

    protected readonly effectiveName = computed(() => this.fieldRootContext?.name() ?? this.name());

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

    /** Whether async validation is pending. Pending inputs publish neither valid nor invalid state. */
    readonly pending = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

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

    /** Validation errors from the input and a same-host Reactive/template-driven form control. */
    readonly validationErrors = computed<readonly RdxValidationError[]>(() => {
        const ownErrors = this.errors() ?? [];
        const ngControlErrors = this.ngControlState.connected() ? this.ngControlState.errors() : [];
        return ngControlErrors.length > 0 ? [...ownErrors, ...ngControlErrors] : ownErrors;
    });

    /** The input's binary invalidity, including a same-host Reactive/template-driven form control. */
    private readonly ownInvalid = computed(
        () =>
            this.invalid() ||
            this.validationErrors().length > 0 ||
            Boolean(this.ngControlState.connected() && this.ngControlState.invalid())
    );
    private readonly pendingState = computed(
        () => this.pending() || Boolean(this.ngControlState.connected() && this.ngControlState.pending())
    );

    /**
     * Tri-state *displayed* validity: inside a `rdxFieldRoot` the field's gated `validState` is the single
     * source (so a field whose `validationMode` defers display (e.g. `onBlur`) keeps the input neutral until revealed), otherwise
     * the input's own binary invalidity. `true` valid / `false` invalid / `null` neutral.
     */
    protected readonly displayValid = computed<boolean | null>(() => {
        if (this.fieldRootContext) {
            return this.fieldRootContext.validState();
        }
        if (this.pendingState()) {
            return null;
        }
        if (this.ownInvalid()) {
            return false;
        }
        if (this.ngControlState.connected() && this.ngControlState.disabled()) {
            return null;
        }
        return true;
    });
    protected readonly disabledState = computed(
        () =>
            this.disabled() ||
            Boolean(this.ngControlState.connected() && this.ngControlState.disabled()) ||
            Boolean(this.fieldRootContext?.disabledState())
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
    protected readonly touchedState = computed(
        () =>
            (this.ngControlState.connected() ? this.ngControlState.touched() : this.touched()) ||
            Boolean(this.fieldRootContext?.touchedState())
    );
    protected readonly dirtyState = computed(
        () =>
            (this.ngControlState.connected() ? this.ngControlState.dirty() : this.dirty() || this.dirtyValue()) ||
            Boolean(this.fieldRootContext?.dirtyState())
    );

    protected readonly patternAttr = computed(() => {
        const patterns = this.pattern();
        return patterns?.length === 1 ? patterns[0].source : undefined;
    });

    protected readonly describedBy = computed(() => {
        if (!this.fieldRootContext) {
            return undefined;
        }

        const ids = [...this.fieldRootContext.descriptionIds(), ...this.fieldRootContext.errorIds()];

        return ids.length ? ids.join(' ') : undefined;
    });

    constructor() {
        watch([], () => {
            if (!this.ngControl) {
                const initial = this.value() ?? this.defaultValue() ?? this.element.value;
                const parent = this.parentValue();
                this.writeValue(parent ?? initial);
                this.initialStandaloneValue.set(parent === undefined ? this.element.value : initial);
                this.element.defaultValue = this.element.value;
            }
            this.initialValue = this.element.value;
            this.syncFieldState();
        });

        if (!this.legacyForm) {
            watch([this.effectiveValue, this.parentValue, this.pendingControlledEdit], ([value, parent, pending]) => {
                if (pending !== undefined) this.pendingControlledEdit.set(undefined);
                if (value === undefined) return;
                const previous = this.committedValue;
                this.writeValue(value);
                const baseline = parent === undefined ? this.initialStandaloneValue() : this.element.value;
                if (baseline !== undefined && this.element.defaultValue !== baseline) {
                    this.element.defaultValue = baseline;
                }
                if (parent !== undefined && this.committedValue !== previous) this.fieldRootContext?.notifyEdited();
            });
        }

        effect(() => {
            this.fieldRootContext?.setControlId(this.id());
        });

        const field = this.fieldRootContext;
        if (field) {
            const focusTarget = () => (this.disabledState() ? null : this.element);
            const unregister = field.registerControlState({
                filled: this.filledValue,
                blurred: this.touched,
                changed: this.dirtyValue,
                ownsNativeEdit: (target) => target === this.element,
                ...useFieldNativeValidity(
                    () => [{ element: this.element, focusTarget, participates: () => true }],
                    focusTarget,
                    ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooShort', 'tooLong', 'customError']
                )
            });
            this.destroyRef.onDestroy(unregister);
        }

        // Reactive/template-driven forms own their NgControl interaction state. Keep the enclosing
        // Field in sync too, including programmatic markAsPristine/markAsUntouched transitions.
        effect(
            () => {
                if (this.ngControlState.connected()) {
                    // Angular's DefaultValueAccessor has already written the latest form-owned value to
                    // the native element before `AbstractControl.events` emits. Mirror that DOM string
                    // into the directive model without letting its standalone value effect write back.
                    this.ngControlState.value();
                    const touched = this.ngControlState.touched();
                    const dirty = this.ngControlState.dirty();
                    this.value.set(this.element.value);
                    this.touched.set(touched);
                    this.dirtyValue.set(dirty);
                    this.syncFieldState();
                    this.fieldRootContext?.setTouched(touched);
                    this.fieldRootContext?.setDirty(dirty);
                    return;
                }

                // Signal Forms writes `dirty=false` when resetting the field. A standalone input's dirty
                // input stays false and does not re-run this effect after ordinary user edits.
                if (!this.dirty()) {
                    this.dirtyValue.set(false);
                }
            },
            { debugName: 'RdxInput.syncInteractionState' }
        );

        if (this.ngControl) {
            afterNextRender(() => {
                this.initialValue = this.element.value;
                this.syncFieldState();
            });
        }
        useNativeFormReset(
            () => this.element.form,
            () => this.restoreAfterNativeReset()
        );
    }

    onFocus(): void {
        this.focusedValue.set(true);
        this.fieldRootContext?.setFocused(true);
    }

    onBlur(): void {
        this.focusedValue.set(false);
        this.fieldRootContext?.setFocused(false);
        this.markTouched();
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (
            event.key === 'Enter' &&
            !event.isComposing &&
            this.fieldRootContext &&
            !this.legacyForm &&
            !this.disabledState()
        ) {
            this.markTouched();
        }
    }

    private markTouched(): void {
        this.touched.set(true);
        this.touch.emit();
        this.fieldRootContext?.setTouched(true);
    }

    protected onBeforeInput(event: InputEvent): void {
        if (this.pendingControlledEdit() === undefined || event.isComposing || event.defaultPrevented) return;
        // Rapid keystrokes can arrive before Angular's scheduled render. Reconcile the previous
        // request in the binding's view before the browser applies the next edit.
        this.view.detectChanges();
    }

    onInput(event: Event): void {
        const nextValue = this.element.value;
        if (nextValue === (this.pendingControlledEdit() ?? this.committedValue)) return;
        if (event.defaultPrevented || this.disabledState() || this.readonly()) {
            this.pendingControlledEdit.set(undefined);
            this.writeValue(this.committedValue);
            return;
        }
        const { eventDetails } = createCancelableChangeEventDetails('none', event);
        const parent = this.parentValue();
        if (parent !== undefined) {
            // The binding is refreshed during the view update. Keep the native edit until then
            // so an accepted value doesn't reset the caret or interrupt the active composition.
            this.pendingControlledEdit.set(nextValue);
        }
        this.onValueChange.emit({ value: nextValue, eventDetails });

        if (eventDetails.isCanceled()) {
            this.pendingControlledEdit.set(undefined);
            this.writeValue(this.parentValue() ?? this.committedValue);
            return;
        }
        if (parent !== undefined) return;

        this.value.set(nextValue);
        this.syncFieldState();
        this.fieldRootContext?.notifyEdited();
    }

    protected onChange(event: Event): void {
        if (this.legacyForm) {
            this.syncFieldState();
            return;
        }
        this.onInput(event);
    }

    /** Reset the interaction baseline; Angular Signal Forms calls this from `FieldState.reset()`. */
    reset(): void {
        this.clearInteraction();

        // The form supplies the reset value through its value binding.
        queueMicrotask(() => {
            if (this.destroyRef.destroyed) return;
            this.initialValue = this.effectiveValue() ?? this.element.value;
            this.writeValue(this.initialValue);
        });
    }

    private restoreAfterNativeReset(): void {
        if (this.ngControl) {
            // The Angular owner keeps its own reset semantics and metadata.
            const value = this.ngControl.control?.value;
            this.writeValue(value == null ? '' : String(value));
            if (this.legacyForm) this.value.set(this.element.value);
            return;
        }

        const parent = this.parentValue();
        const restored = parent ?? this.element.defaultValue;
        // A later accepted edit can already be present when the reset task runs.
        if (this.element.value !== restored && this.committedValue === this.element.value) {
            this.initialValue = restored;
            this.syncFieldState();
            return;
        }
        if (this.element.value !== restored) this.element.value = restored;
        this.initialValue = this.element.value;
        this.clearInteraction();
        this.syncFieldState();
        if (parent === undefined) this.value.set(this.element.value);
    }

    private clearInteraction(): void {
        this.touched.set(false);
        this.dirtyValue.set(false);
        const focused = this.element.getRootNode() as Document | ShadowRoot;
        const hasFocus = focused.activeElement === this.element;
        this.focusedValue.set(hasFocus);
        this.fieldRootContext?.setTouched(false);
        this.fieldRootContext?.setDirty(false);
        this.fieldRootContext?.setFocused(hasFocus);
    }

    syncFieldState(): void {
        const value = this.element.value;
        this.committedValue = value;
        const dirty = this.ngControlState.connected() ? this.ngControlState.dirty() : value !== this.initialValue;

        this.filledValue.set(value !== '');
        this.dirtyValue.set(dirty);
        this.fieldRootContext?.setFilled(value !== '');
        this.fieldRootContext?.setDirty(dirty);
    }

    private writeValue(value: RdxInputValue): void {
        if (this.element.value !== value) this.element.value = value;
        this.syncFieldState();
    }

    protected readonly dataAttr = attr;
}
