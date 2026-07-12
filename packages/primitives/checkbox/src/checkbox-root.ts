import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    model,
    output,
    signal,
    Signal
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    injectNgControlState,
    RDX_FIELD_VALIDITY,
    RdxCancelableChangeEventDetails,
    RdxControlValueAccessor,
    RdxFormCheckboxControl,
    RdxValidationError,
    useNativeFormControl
} from '@radix-ng/primitives/core';
import { injectCheckboxGroupContext } from './checkbox-group';

/**
 * Internal tri-state used only for the derived `parent` (select-all) state in
 * `rdxCheckboxGroup` and compatibility helpers. The public `checked` member is
 * a plain `boolean`; mixed state is exposed via the separate `indeterminate`
 * member (Base UI shape).
 */
export type CheckedState = boolean | 'indeterminate';

export function isIndeterminate(checked?: CheckedState): checked is 'indeterminate' {
    return checked === 'indeterminate';
}

export function getState(checked: CheckedState) {
    return isIndeterminate(checked) ? 'indeterminate' : checked ? 'checked' : 'unchecked';
}

export type RdxCheckboxCheckedChangeReason = 'none';
export type RdxCheckboxCheckedChangeEventDetails = RdxCancelableChangeEventDetails<RdxCheckboxCheckedChangeReason>;

export interface RdxCheckboxCheckedChangeEvent {
    checked: boolean;
    eventDetails: RdxCheckboxCheckedChangeEventDetails;
}

export interface CheckboxRootContext {
    checked: Signal<boolean>;
    indeterminate: Signal<boolean>;
    disabled: Signal<boolean>;
    required: Signal<boolean>;
    value: Signal<string>;
    name: Signal<string | undefined>;
    itemValue: Signal<string | undefined>;
    parent: Signal<boolean>;
    form: Signal<string | undefined>;
    readonly: Signal<boolean>;
    state: Signal<'indeterminate' | 'checked' | 'unchecked'>;
    invalidState: Signal<boolean>;
    /** Tri-state displayed validity (`true`/`false`/`null`) — the field's gated state when standalone in a Field. */
    displayValid: Signal<boolean | null>;
    touchedState: Signal<boolean>;
    dirtyState: Signal<boolean>;
    uncheckedValue: Signal<string | undefined>;
    registerNativeInput: (input: HTMLInputElement) => () => void;
    toggle: (event?: Event) => void;
}

const rootContext = (): CheckboxRootContext => {
    const checkbox = inject(RdxCheckboxRootDirective);

    // `checked`/`disabled` come from the directive so they reflect group membership when the
    // checkbox is inside a `rdxCheckboxGroup`; otherwise they fall back to the CVA.
    return {
        checked: checkbox.checkedState,
        indeterminate: checkbox.indeterminateState,
        disabled: checkbox.disabledState,
        required: checkbox.required,
        value: checkbox.nativeValue,
        name: checkbox.nativeName,
        itemValue: checkbox.itemValue,
        parent: checkbox.parent,
        form: checkbox.nativeForm,
        readonly: checkbox.readOnlyState,
        state: checkbox.state,
        invalidState: checkbox.invalidState,
        displayValid: checkbox.displayValid,
        touchedState: checkbox.touchedState,
        dirtyState: checkbox.dirtyState,
        uncheckedValue: checkbox.uncheckedValue,
        registerNativeInput: (input) => checkbox.registerNativeInput(input),
        toggle(event?: Event) {
            checkbox.toggle(event);
        }
    };
};

export const [injectCheckboxRootContext, provideCheckboxRootContext] = createContext<CheckboxRootContext>(
    'CheckboxRootContext',
    'components/checkbox'
);

/**
 * @group Components
 */
@Directive({
    selector: '[rdxCheckboxRoot]',
    providers: [provideCheckboxRootContext(rootContext)],
    hostDirectives: [
        {
            directive: RdxControlValueAccessor,
            inputs: ['value:checked', 'disabled']
        }
    ],
    host: {
        '[attr.data-checked]': 'checkedState() && !indeterminateState() ? "" : undefined',
        '[attr.data-unchecked]': '!checkedState() && !indeterminateState() ? "" : undefined',
        '[attr.data-indeterminate]': 'indeterminateState() ? "" : undefined',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-readonly]': 'readOnlyState() ? "" : undefined',
        '[attr.data-required]': 'required() ? "" : undefined',
        '[attr.data-invalid]': 'displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() ? "" : undefined'
    }
})
export class RdxCheckboxRootDirective implements RdxFormCheckboxControl {
    private readonly controlValueAccessor = inject(RdxControlValueAccessor);
    private readonly ngControlState = injectNgControlState();

    /** The group this checkbox belongs to, if it is rendered inside a `rdxCheckboxGroup`. */
    private readonly group = injectCheckboxGroupContext(true);
    private readonly nativeInput = signal<HTMLInputElement | null>(null);

    /**
     * The controlled checked state of the checkbox. Must be used in conjunction with onCheckedChange.
     *
     * Mixed state is no longer expressed through `checked` — use the separate
     * `indeterminate` input (Base UI shape). This `boolean` model is what
     * `RdxFormCheckboxControl` / Angular Signal Forms bind to.
     * @group Props
     */
    readonly checked = model<boolean>(false);

    /**
     * The state of the checkbox when it is initially rendered.
     *
     * @default false
     * @group Props
     */
    readonly defaultChecked = input<boolean | undefined, BooleanInput | undefined>(undefined, {
        transform: (value) => (value === undefined ? undefined : booleanAttribute(value))
    });

    /**
     * Whether the checkbox is in a mixed state: neither ticked nor unticked.
     * Orthogonal to `checked` and not part of the submitted form value. A user
     * click resolves the checkbox to `checked` and clears `indeterminate`.
     * @group Props
     */
    readonly indeterminate = model<boolean>(false);

    /**
     * The value of the checkbox. This is what is submitted with the form when the checkbox is checked.
     *
     * Bound publicly as `[value]`; the TS member is named `submitValue` so the
     * directive can satisfy `RdxFormCheckboxControl`, whose contract reserves a
     * `value` member for `RdxFormValueControl` and forbids it on checkbox-style
     * controls.
     * When omitted, native submission uses the browser checkbox default (`on`). Inside a
     * `rdxCheckboxGroup`, the child's `name` is used as a compatibility fallback.
     * @group Props
     */
    readonly submitValue = input<string | undefined>(undefined, { alias: 'value' });

    /**
     * The value submitted with the form when the checkbox is unchecked.
     * By default, unchecked checkboxes do not submit any value, matching native checkbox behavior.
     *
     * @group Props
     */
    readonly uncheckedValue = input<string>();

    /**
     * Whether or not the checkbox button is disabled. This prevents the user from interacting with it.
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the user should be unable to tick or untick the checkbox. Bound in templates as
     * `readOnly` (Base UI spelling); the TS member stays `readonly` to satisfy `RdxFormCheckboxControl`.
     * @group Props
     */
    readonly readonly = input<boolean, BooleanInput>(false, { alias: 'readOnly', transform: booleanAttribute });

    /**
     * Whether or not the checkbox is required.
     * @group Props
     */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the checkbox is invalid. A non-empty {@link errors} list also marks it invalid.
     * @group Props
     */
    readonly invalid = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether async validation is pending. Pending checkboxes publish neither valid nor invalid state. */
    readonly pending = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the checkbox has been touched. A `model()` so Signal Forms can write it; the checkbox
     * also sets it on toggle (and emits {@link touch}).
     * @group Props
     */
    readonly touched = model<boolean>(false);

    /**
     * Whether the checked state changed from its initial value. Merged with internal tracking.
     * @group Props
     */
    readonly dirty = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Validation errors for the checkbox. A non-empty list marks it invalid.
     * @group Props
     */
    readonly errors = input<readonly RdxValidationError[]>([]);

    /**
     * Name of a standalone form control. Inside a `rdxCheckboxGroup`, prefer `[value]` to identify
     * the item; `name` remains a compatibility fallback for existing group templates.
     * @group Props
     */
    readonly name = input<string>();

    /**
     * When inside a `rdxCheckboxGroup`, marks this as the "select all" checkbox: its state is
     * derived from the group's `allValues`, and toggling it checks or unchecks every child.
     * @group Props
     */
    readonly parent = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Associates the control with a form element.
     * @group Props
     */
    readonly form = input<string>();

    /** @ignore Item identity inside a checkbox group (`value`, falling back to the legacy child name). */
    readonly itemValue = computed(() => this.submitValue() ?? this.name());
    /** @ignore Native checkbox value; browsers default an omitted checkbox value to `on`. */
    readonly nativeValue = computed(() => this.submitValue() ?? 'on');
    /** @ignore A checkbox group owns the successful-control name and serializes its children centrally. */
    readonly nativeName = computed(() => (this.group || this.parent() ? undefined : this.name()));
    /** @ignore Child native inputs inherit an external form association from their checkbox group. */
    readonly nativeForm = computed(() => this.group?.form() ?? this.form());

    /**
     * Event emitted when the checkbox checked state changes.
     * @group Emits
     */
    readonly onCheckedChange = output<RdxCheckboxCheckedChangeEvent>();

    /**
     * Emits on interaction, notifying Signal Forms the checkbox was touched.
     * @group Emits
     */
    readonly touch = output<void>();

    /**
     * @ignore
     * The effective checked state as a `boolean`. Inside a `rdxCheckboxGroup` it is derived from the
     * group (a `parent` checkbox is checked only when every child is; a child from whether its item
     * value is in the group value); standalone it reads the CVA value.
     */
    readonly checkedState = computed<boolean>(() => {
        const group = this.group;
        if (group) {
            if (this.parent()) {
                return group.parentState() === true;
            }

            const value = this.itemValue();
            if (value !== undefined) {
                return group.value().includes(value);
            }
        }

        return !!this.controlValueAccessor.value();
    });

    /**
     * @ignore
     * The effective mixed state. A `parent` checkbox is indeterminate when some — but not all —
     * children are checked; otherwise it follows the `indeterminate` input.
     */
    readonly indeterminateState = computed<boolean>(() => {
        const group = this.group;
        if (group && this.parent()) {
            return group.parentState() === 'indeterminate';
        }

        return this.indeterminate();
    });

    /** @ignore The effective disabled state, including the group. */
    readonly disabledState = computed(() => this.controlValueAccessor.disabled() || (this.group?.disabled() ?? false));
    readonly readOnlyState = computed(() => this.readonly());

    private readonly dirtyValue = signal(false);
    /** Validation errors from the checkbox input and a same-host Reactive/template-driven form control. */
    readonly validationErrors = computed<readonly RdxValidationError[]>(() => {
        const ownErrors = this.errors() ?? [];
        const ngControlErrors = this.ngControlState.connected() ? this.ngControlState.errors() : [];
        return ngControlErrors.length > 0 ? [...ownErrors, ...ngControlErrors] : ownErrors;
    });
    /** @ignore Invalid when the `invalid` input is set or the `errors` list is non-empty. */
    readonly invalidState = computed(
        () =>
            this.invalid() ||
            this.validationErrors().length > 0 ||
            Boolean(this.ngControlState.connected() && this.ngControlState.invalid())
    );
    /** @ignore Whether explicit or Angular-owned async validation is pending. */
    readonly pendingState = computed(
        () => this.pending() || Boolean(this.ngControlState.connected() && this.ngControlState.pending())
    );

    /** Tri-state display validity exposed by an enclosing Field; absent when standalone. */
    private readonly fieldValidity = inject(RDX_FIELD_VALIDITY, { optional: true });
    /**
     * @ignore Tri-state *displayed* validity. A **standalone** checkbox inside a `rdxFieldRoot` defers to
     * the field's gated `validState` (so a field whose `validationMode` defers display (e.g. `onBlur`) stays neutral); inside a
     * `rdxCheckboxGroup` the group owns the field relationship, so the item keeps its own binary validity
     * (the field's invalid must not paint every checkbox red).
     */
    readonly displayValid = computed<boolean | null>(() => {
        if (!this.group && this.fieldValidity) {
            return this.fieldValidity();
        }
        if (this.pendingState()) {
            return null;
        }
        if (this.invalidState()) {
            return false;
        }
        if (this.ngControlState.connected() && this.ngControlState.disabled()) {
            return null;
        }
        return true;
    });
    /** @ignore */
    readonly touchedState = computed(() =>
        this.ngControlState.connected() ? this.ngControlState.touched() : this.touched()
    );
    /** @ignore */
    readonly dirtyState = computed(() =>
        this.ngControlState.connected() ? this.ngControlState.dirty() : this.dirty() || this.dirtyValue()
    );

    readonly state = computed(() =>
        this.indeterminateState() ? 'indeterminate' : this.checkedState() ? 'checked' : 'unchecked'
    );

    private readonly nativeInputOwnsValue = computed(
        () => this.nativeInput() !== null && (this.checkedState() || this.uncheckedValue() === undefined)
    );

    constructor() {
        useNativeFormControl({
            name: this.nativeName,
            form: this.nativeForm,
            disabled: this.disabledState,
            value: this.checkedState,
            serialize: (checked) => {
                const value = checked ? this.nativeValue() : this.uncheckedValue();
                return value === undefined ? [] : [value];
            },
            hasNativeControl: this.nativeInputOwnsValue,
            syncNativeControl: () => {
                const input = this.nativeInput();
                if (input) {
                    input.checked = this.checkedState();
                    input.indeterminate = this.indeterminateState();
                }
            },
            defaultValue: () => this.defaultChecked() ?? this.checkedState(),
            onReset: (value) => {
                if (this.group || this.parent()) {
                    return;
                }

                this.indeterminate.set(false);
                this.checked.set(value);
                if (!this.ngControlState.reset(value)) {
                    this.controlValueAccessor.writeValue(value);
                }
                this.reset();
            }
        });

        // Inside a group, register this child's item value and its own disabled state so a `parent`
        // checkbox can preserve disabled-but-checked children when selecting/deselecting all.
        effect((onCleanup) => {
            const group = this.group;
            const value = this.itemValue();
            if (group && !this.parent() && value !== undefined) {
                onCleanup(group.registerChild(value, this.controlValueAccessor.disabled));
            }
        });

        let hasAppliedDefault = false;
        effect(() => {
            const defaultChecked = this.defaultChecked();
            if (!hasAppliedDefault && defaultChecked !== undefined) {
                hasAppliedDefault = true;
                this.checked.set(defaultChecked);
                this.controlValueAccessor.setValue(defaultChecked);
            }
        });

        // Reactive/template-driven forms own their NgControl interaction state. Signal Forms instead
        // writes the public touched/dirty members, so standalone controls retain the existing fallback.
        effect(
            () => {
                if (this.ngControlState.connected()) {
                    this.touched.set(this.ngControlState.touched());
                    if (!this.ngControlState.dirty()) {
                        this.dirtyValue.set(false);
                    }
                    return;
                }

                if (!this.dirty()) {
                    this.dirtyValue.set(false);
                }
            },
            { debugName: 'RdxCheckboxRoot.syncInteractionState' }
        );
    }

    toggle(event?: Event) {
        if (this.disabledState() || this.readOnlyState()) {
            return;
        }

        const group = this.group;
        if (group) {
            if (this.parent()) {
                group.toggleAll(event);
                return;
            }

            const value = this.itemValue();
            if (value !== undefined) {
                group.toggleValue(value, event);
                return;
            }
        }

        // From the indeterminate state a click resolves to checked (matching
        // native + Base UI), otherwise it flips the boolean. A single setValue so
        // onCheckedChange fires once; the `checked`/`indeterminate` models are
        // kept in sync so `[(checked)]` / `[(indeterminate)]` reflect the change.
        const next = this.indeterminateState() ? true : !this.checkedState();
        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const { eventDetails } = createCancelableChangeEventDetails(
            'none',
            event ?? new Event('checkbox.checked-change'),
            trigger
        );
        this.onCheckedChange.emit({ checked: next, eventDetails });
        if (eventDetails.isCanceled()) {
            return;
        }

        this.indeterminate.set(false);
        this.checked.set(next);
        this.controlValueAccessor.setValue(next);
        this.dirtyValue.set(true);
        // Mark the form control touched on user interaction so `touched`-gated validation shows
        // (the visible control is the button, not the hidden input, so blur alone is unreliable).
        // Both channels: CVA for Reactive forms, the `touched` model + `touch` output for Signal Forms.
        this.controlValueAccessor.markAsTouched();
        this.touched.set(true);
        this.touch.emit();
    }

    /** Reset control-owned interaction state; Angular Signal Forms calls this from `FieldState.reset()`. */
    reset(): void {
        this.touched.set(false);
        this.dirtyValue.set(false);
    }

    /** @ignore Register the optional native checkbox so it owns checked-value serialization. */
    registerNativeInput(input: HTMLInputElement): () => void {
        this.nativeInput.set(input);
        return () => {
            if (this.nativeInput() === input) {
                this.nativeInput.set(null);
            }
        };
    }
}
