import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, effect, inject, input, model } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { createContext, RdxControlValueAccessor } from '@radix-ng/primitives/core';
import { injectCheckboxGroupContext } from './checkbox-group';

export type CheckedState = boolean | 'indeterminate';

export function isIndeterminate(checked?: CheckedState): checked is 'indeterminate' {
    return checked === 'indeterminate';
}

export function getState(checked: CheckedState) {
    return isIndeterminate(checked) ? 'indeterminate' : checked ? 'checked' : 'unchecked';
}

const rootContext = () => {
    const checkbox = inject(RdxCheckboxRootDirective);

    // `checked`/`disabled` come from the directive so they reflect group membership when the
    // checkbox is inside a `rdxCheckboxGroup`; otherwise they fall back to the CVA.
    return {
        checked: checkbox.checkedState,
        disabled: checkbox.disabledState,
        required: checkbox.required,
        value: checkbox.value,
        name: checkbox.name,
        parent: checkbox.parent,
        form: checkbox.form,
        readonly: checkbox.readonly,
        state: checkbox.state,
        toggle() {
            checkbox.toggle();
        }
    };
};

export type CheckboxRootContext = ReturnType<typeof rootContext>;

export const [injectCheckboxRootContext, provideCheckboxRootContext] =
    createContext<CheckboxRootContext>('CheckboxRootContext');

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
        '[attr.data-state]': 'state()',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-required]': 'required() ? "" : undefined'
    }
})
export class RdxCheckboxRootDirective {
    private readonly controlValueAccessor = inject(RdxControlValueAccessor);

    /** The group this checkbox belongs to, if it is rendered inside a `rdxCheckboxGroup`. */
    private readonly group = injectCheckboxGroupContext(true);

    /**
     * @ignore
     * Reflects the effective disabled state (CVA, covering reactive-forms `.disable()`, plus the
     * group's disabled state), used for the `data-disabled` host attribute.
     */
    protected readonly isDisabled = computed(() => this.disabledState());

    /**
     * The controlled checked state of the checkbox. Must be used in conjunction with onCheckedChange.
     * @group Props
     */
    readonly checked = model<CheckedState>(false);

    /**
     * The value of the checkbox. This is what is submitted with the form when the checkbox is checked.
     * @group Props
     */
    readonly value = input<string>('on');

    /**
     * Whether or not the checkbox button is disabled. This prevents the user from interacting with it.
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the user should be unable to tick or untick the checkbox.
     * @group Props
     */
    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether or not the checkbox is required.
     * @group Props
     */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Name of the form control. Submitted with the form as part of a name/value pair. Inside a
     * `rdxCheckboxGroup` this also identifies the checkbox in the group's value array.
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

    /**
     * Event emitted when the checkbox checked state changes.
     * @group Emits
     */
    readonly onCheckedChange = outputFromObservable(outputToObservable(this.controlValueAccessor.valueChange));

    /**
     * @ignore
     * The effective checked state. Inside a `rdxCheckboxGroup` it is derived from the group (the
     * parent checkbox from `allValues`, a child from whether its `name` is in the group value);
     * standalone it reads the CVA value.
     */
    readonly checkedState = computed<CheckedState>(() => {
        const group = this.group;
        if (group) {
            if (this.parent()) {
                return group.parentState();
            }

            const name = this.name();
            if (name !== undefined) {
                return group.value().includes(name);
            }
        }

        return this.controlValueAccessor.value();
    });

    /** @ignore The effective disabled state, including the group. */
    readonly disabledState = computed(() => this.controlValueAccessor.disabled() || (this.group?.disabled() ?? false));

    readonly state = computed(() => getState(this.checkedState()));

    constructor() {
        // Inside a group, register this child's name and its own disabled state so a `parent`
        // checkbox can preserve disabled-but-checked children when selecting/deselecting all.
        effect((onCleanup) => {
            const group = this.group;
            const name = this.name();
            if (group && !this.parent() && name !== undefined) {
                onCleanup(group.registerChild(name, this.controlValueAccessor.disabled));
            }
        });
    }

    toggle() {
        const group = this.group;
        if (group) {
            if (this.parent()) {
                group.toggleAll();
                return;
            }

            const name = this.name();
            if (name !== undefined) {
                group.toggleValue(name);
                return;
            }
        }

        const checked = this.controlValueAccessor.value();

        // From the indeterminate state a click resolves to checked (matching
        // Radix/Base UI), otherwise it flips the boolean. A single setValue so
        // onCheckedChange fires once.
        this.controlValueAccessor.setValue(isIndeterminate(checked) ? true : !checked);
    }
}
