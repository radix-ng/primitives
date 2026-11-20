import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    model,
    OnChanges,
    output,
    signal,
    Signal,
    SimpleChanges,
    untracked
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    injectNgControlState,
    provideValueAccessor,
    RdxCancelableChangeEventDetails,
    RdxFormCheckboxControl,
    RdxNativeInputRef,
    RdxValidationError,
    useNativeFormControl,
    watch
} from '@radix-ng/primitives/core';
import { fieldDescribedBy, injectFieldRootContext, type RdxFieldRootContext } from '@radix-ng/primitives/field';
import { useCheckboxFieldValidity } from './checkbox-field';
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
    filledState: Signal<boolean>;
    focusedState: Signal<boolean>;
    labelField: RdxFieldRootContext | null;
    labelId: Signal<string | undefined>;
    describedBy: (explicit?: string) => string | undefined;
    uncheckedValue: Signal<string | undefined>;
    registerNativeInput: (input: HTMLInputElement) => () => void;
    registerButton: (button: HTMLButtonElement) => () => void;
    focus: () => void;
    onButtonFocus: () => void;
    blur: () => void;
    activate: (event: MouseEvent) => void;
    onEnter: (event: Event) => void;
    toggle: (event: Event, checked?: boolean) => boolean;
}

const rootContext = (): CheckboxRootContext => {
    const checkbox = inject(RdxCheckboxRootDirective);

    return {
        checked: checkbox.checkedState,
        indeterminate: checkbox.indeterminateState,
        disabled: checkbox.disabledState,
        required: checkbox.requiredState,
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
        filledState: checkbox.filledState,
        focusedState: checkbox.focusedState,
        labelField: checkbox.labelField,
        labelId: checkbox.labelId,
        describedBy: (explicit) => checkbox.describedBy(explicit),
        uncheckedValue: checkbox.uncheckedValue,
        registerNativeInput: (input) => checkbox.registerNativeInput(input),
        registerButton: (button) => checkbox.registerButton(button),
        focus: () => checkbox.focus(),
        onButtonFocus: () => checkbox.onButtonFocus(),
        blur: () => checkbox.blur(),
        activate: (event) => checkbox.activate(event),
        onEnter: (event) => checkbox.onEnter(event),
        toggle: (event, checked) => checkbox.toggle(event, checked)
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
    providers: [provideCheckboxRootContext(rootContext), provideValueAccessor(RdxCheckboxRootDirective)],
    host: {
        '[attr.data-checked]': 'checkedState() && !indeterminateState() ? "" : undefined',
        '[attr.data-unchecked]': '!checkedState() && !indeterminateState() ? "" : undefined',
        '[attr.data-indeterminate]': 'indeterminateState() ? "" : undefined',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-readonly]': 'readOnlyState() ? "" : undefined',
        '[attr.data-required]': 'requiredState() ? "" : undefined',
        '[attr.data-invalid]': 'displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() ? "" : undefined',
        '[attr.data-filled]': 'filledState() ? "" : undefined',
        '[attr.data-focused]': 'focusedState() ? "" : undefined'
    }
})
export class RdxCheckboxRootDirective implements RdxFormCheckboxControl, ControlValueAccessor, OnChanges {
    private readonly ngControlState = injectNgControlState();

    /** The group this checkbox belongs to, if it is rendered inside a `rdxCheckboxGroup`. */
    private readonly group = injectCheckboxGroupContext(true);
    private readonly field = injectFieldRootContext(true);
    /** @ignore A group owns the shared label scope. Field.Item opens a distinct scope. */
    readonly labelField = this.field === this.group?.field ? null : this.field;
    readonly labelId = computed(() => this.field?.labelId());
    private readonly nativeInputElement = signal<HTMLInputElement | null>(null);
    private button: HTMLButtonElement | null = null;
    private readonly disabledByCva = signal(false);
    private hasCheckedInput = false;
    private hasCvaValue = false;
    private onChange?: (value: boolean) => void;
    private onTouched?: () => void;

    /**
     * Editable checked state for two-way bindings and Angular forms.
     * @group Props
     */
    readonly checked = model<boolean>(false);

    /** The authored native checkbox input, when present. */
    readonly nativeInput = this.nativeInputElement.asReadonly();

    /** Receives the authored input in the browser and null when the association ends. */
    readonly inputRef = input<RdxNativeInputRef>();

    /** Parent-owned checked state. A defined value takes precedence over the editable model. */
    readonly controlledChecked = input<boolean>();

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
     * The parent owns this presentation state. It can clear it in `onCheckedChange`.
     * @group Props
     */
    readonly indeterminate = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

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
     * also sets it on blur (and emits {@link touch}).
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

    private readonly effectiveName = computed(() => this.field?.name() ?? this.name());
    /** @ignore Item identity inside a checkbox group. */
    readonly itemValue = computed(() => this.submitValue() ?? this.effectiveName());
    /** @ignore Native checkbox value; browsers default an omitted checkbox value to `on`. */
    readonly nativeValue = computed(() => this.submitValue() ?? 'on');
    /** @ignore Only a named group serializes its children centrally. */
    readonly nativeName = computed(() => (this.group?.name() || this.parent() ? undefined : this.effectiveName()));
    /** @ignore Child native inputs inherit an external form association from their checkbox group. */
    readonly nativeForm = computed(() => this.form() ?? this.group?.form());

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
     * value is in the group value); standalone it uses the effective checked value.
     */
    readonly checkedState = computed<boolean>(() => {
        const group = this.group;
        if (group) {
            if (this.parent() && group.allValues() !== undefined) {
                return group.parentState() === true;
            }

            const value = this.itemValue();
            if (!this.parent() && value !== undefined) {
                return group.value().includes(value);
            }
        }

        return this.controlledChecked() ?? this.checked();
    });

    /**
     * @ignore
     * The effective mixed state. A `parent` checkbox is indeterminate when some — but not all —
     * children are checked; otherwise it follows the `indeterminate` input.
     */
    readonly indeterminateState = computed<boolean>(() => {
        const group = this.group;
        return this.indeterminate() || Boolean(group && this.parent() && group.parentState() === 'indeterminate');
    });

    /** @ignore The effective disabled state, including the group. */
    readonly disabledState = computed(
        () => this.disabledByCva() || this.disabled() || Boolean(this.group?.disabled() || this.field?.disabledState())
    );
    /** @ignore A standalone checkbox inherits the enclosing Field's required metadata. */
    readonly requiredState = computed(() => this.required() || (!this.group && Boolean(this.field?.requiredState())));
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

    /** @ignore Display validity is scoped to the enclosing Field when present. */
    readonly displayValid = computed<boolean | null>(() => {
        if (this.field) return this.field.validState();
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
    readonly touchedState = computed(
        () =>
            this.field?.touchedState() ??
            (this.ngControlState.connected() ? this.ngControlState.touched() : this.touched())
    );
    /** @ignore */
    readonly dirtyState = computed(
        () =>
            this.field?.dirtyState() ??
            (this.ngControlState.connected() ? this.ngControlState.dirty() : this.dirty() || this.dirtyValue())
    );

    /** @ignore Field presentation state is shared across the group and its items. */
    readonly filledState = computed(() => this.field?.filledState() ?? false);
    readonly focusedState = computed(() => this.field?.focusedState() ?? false);

    /** @ignore Resolve description and error ids from the group and item label scopes. */
    describedBy(explicit?: string): string | undefined {
        return fieldDescribedBy(explicit, this.group?.field ?? null, this.labelField);
    }

    readonly state = computed(() =>
        this.indeterminateState() ? 'indeterminate' : this.checkedState() ? 'checked' : 'unchecked'
    );

    private readonly nativeInputOwnsValue = computed(
        () =>
            this.nativeInput() !== null &&
            (this.checkedState() || this.group !== null || this.uncheckedValue() === undefined)
    );

    private readonly browserForm = useNativeFormControl({
        name: this.nativeName,
        form: this.nativeForm,
        disabled: this.disabledState,
        value: this.checkedState,
        serialize: (checked) => {
            const value = checked ? this.nativeValue() : this.group ? undefined : this.uncheckedValue();
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
        defaultValue: () => this.initialChecked(),
        onReset: (value) => {
            if (!this.group && !this.parent() && this.controlledChecked() === undefined) {
                if (!this.ngControlState.reset(undefined)) this.checked.set(value);
                this.reset();
            }
        }
    });

    constructor() {
        afterRenderEffect({
            read: (onCleanup) => {
                const ref = this.inputRef();
                const input = this.nativeInput();
                if (ref && input) {
                    untracked(() => ref(input));
                    onCleanup(() => ref(null));
                }
            }
        });

        // Inside a group, register this child's item value and its own disabled state so a `parent`
        // checkbox can preserve disabled-but-checked children when selecting/deselecting all.
        effect((onCleanup) => {
            const group = this.group;
            const value = this.itemValue();
            if (group && !this.parent() && value !== undefined) {
                onCleanup(group.registerChild(value, this.disabledState));
            }
        });

        let fieldInitialChecked: boolean;
        watch([], () => {
            if (this.controlledChecked() === undefined) this.checked.set(this.initialChecked());
            fieldInitialChecked = this.checkedState();
        });

        const field = this.field;
        if (field) {
            watch([this.disabledState], ([disabled]) => {
                if (disabled && this.button) field.setFocused(false, this.button);
            });
            if (!this.group) {
                const unregister = field.registerControlState({
                    filled: this.checkedState,
                    blurred: field.touchedState,
                    changed: field.dirtyState,
                    ...useCheckboxFieldValidity(
                        () => {
                            const element = this.nativeInput();
                            return element ? [{ element, button: () => this.button, participates: () => true }] : [];
                        },
                        () => (this.disabledState() ? null : this.button)
                    )
                });
                inject(DestroyRef).onDestroy(unregister);
                watch(
                    [this.checkedState],
                    ([checked]) => {
                        field.setDirty(checked !== fieldInitialChecked);
                        field.notifyEdited();
                    },
                    { defer: true }
                );
            }
        }

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

    /** @ignore */
    // eslint-disable-next-line no-restricted-syntax -- Observe initial model input presence, including false (ADR 0071).
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checked']?.currentValue !== undefined) this.hasCheckedInput = true;
    }

    private initialChecked(): boolean {
        const controlled = this.controlledChecked();
        if (controlled !== undefined) return controlled;
        if (this.hasCheckedInput || this.hasCvaValue || this.checked()) return this.checked();
        return this.defaultChecked() ?? false;
    }

    /** @ignore Enter invokes the owning form's default submitter without activating the checkbox. */
    onEnter(event: Event): void {
        if (event.defaultPrevented) return;
        const form = this.nativeInput()?.form ?? this.browserForm.ownerForm();
        const submitter =
            form &&
            Array.from(form.elements).find(
                (element): element is HTMLButtonElement | HTMLInputElement =>
                    (element.localName === 'button' || element.localName === 'input') &&
                    (element as HTMLButtonElement | HTMLInputElement).type === 'submit'
            );
        const preventDefault = event.preventDefault;
        preventDefault.call(event);
        if (!submitter) return;

        // Native button activation is already suppressed. Allow an ancestor to veto submission too.
        let canceled = false;
        event.preventDefault = () => {
            canceled = true;
            preventDefault.call(event);
        };
        const button = this.button;
        // Browser events may flush microtasks between listeners, before an ancestor can cancel.
        setTimeout(() => {
            event.preventDefault = preventDefault;
            if (!canceled && this.button === button && button?.isConnected) {
                this.browserForm.sync();
                submitter.click();
            }
        }, 0);
    }

    /** @ignore */
    activate(event: MouseEvent): void {
        if (event.defaultPrevented || this.disabledState() || this.readOnlyState()) return;

        const input = this.nativeInput();
        if (!input) {
            if (this.toggle(event)) this.browserForm.sync();
            return;
        }
        const owner = input.ownerDocument.defaultView;
        if (!owner) return;
        this.browserForm.sync();
        input.dispatchEvent(
            new owner.MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                composed: true,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey
            })
        );
    }

    /** @ignore */
    toggle(event: Event, next = !this.checkedState()): boolean {
        if (event.defaultPrevented || this.disabledState() || this.readOnlyState()) return false;
        const { eventDetails } = createCancelableChangeEventDetails('none', event, this.button ?? undefined);
        this.onCheckedChange.emit({ checked: next, eventDetails });
        if (eventDetails.isCanceled() || event.defaultPrevented) return false;

        const group = this.group;
        if (group && this.parent() && group.allValues() !== undefined) return group.toggleAll(eventDetails);
        const value = this.itemValue();
        if (group && !this.parent() && value !== undefined) return group.setItemChecked(value, next, eventDetails);
        if (this.controlledChecked() !== undefined) return true;

        this.checked.set(next);
        this.onChange?.(next);
        this.dirtyValue.set(true);
        return true;
    }

    /** @ignore */
    writeValue(value: boolean | null): void {
        this.hasCvaValue = true;
        this.checked.set(value ?? false);
    }

    /** @ignore */
    registerOnChange(fn: (value: boolean) => void): void {
        this.onChange = fn;
    }

    /** @ignore */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** @ignore */
    setDisabledState(disabled: boolean): void {
        this.disabledByCva.set(disabled);
    }

    /** @ignore */
    registerButton(button: HTMLButtonElement): () => void {
        this.button = button;
        return () => {
            if (this.button === button) {
                this.field?.setFocused(false, button);
                this.button = null;
            }
        };
    }

    /** @ignore */
    focus(): void {
        this.button?.focus();
    }

    /** @ignore */
    onButtonFocus(): void {
        if (this.button && !this.disabledState()) this.field?.setFocused(true, this.button);
    }

    /** @ignore */
    blur(): void {
        if (this.button) this.field?.setFocused(false, this.button);
        if (this.disabledState()) return;
        this.field?.setTouched(true);
        if (this.group) return;
        this.onTouched?.();
        this.touched.set(true);
        this.touch.emit();
    }

    /** Reset control-owned interaction state; Angular Signal Forms calls this from `FieldState.reset()`. */
    reset(): void {
        this.touched.set(false);
        this.dirtyValue.set(false);
        if (!this.group) this.field?.setTouched(false);
    }

    /** @ignore Register the optional native checkbox so it owns checked-value serialization. */
    registerNativeInput(input: HTMLInputElement): () => void {
        this.nativeInputElement.set(input);
        const unregister = this.group?.registerFieldInput({
            element: input,
            button: () => this.button,
            participates: () => !this.parent()
        });
        return () => {
            unregister?.();
            if (this.nativeInput() === input) {
                this.nativeInputElement.set(null);
            }
        };
    }
}
