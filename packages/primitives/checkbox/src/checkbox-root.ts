import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    output,
    Renderer2
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    RdxCancelableChangeEventDetails,
    RdxControlValueAccessor,
    RdxFormCheckboxControl
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

const rootContext = () => {
    const checkbox = inject(RdxCheckboxRootDirective);

    // `checked`/`disabled` come from the directive so they reflect group membership when the
    // checkbox is inside a `rdxCheckboxGroup`; otherwise they fall back to the CVA.
    return {
        checked: checkbox.checkedState,
        indeterminate: checkbox.indeterminateState,
        disabled: checkbox.disabledState,
        required: checkbox.required,
        value: checkbox.submitValue,
        name: checkbox.name,
        parent: checkbox.parent,
        form: checkbox.form,
        readonly: checkbox.readOnlyState,
        state: checkbox.state,
        uncheckedValue: checkbox.uncheckedValue,
        toggle(event?: Event) {
            checkbox.toggle(event);
        }
    };
};

export type CheckboxRootContext = ReturnType<typeof rootContext>;

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
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-readonly]': 'readOnlyState() ? "" : undefined',
        '[attr.data-required]': 'required() ? "" : undefined'
    }
})
export class RdxCheckboxRootDirective implements RdxFormCheckboxControl {
    private readonly controlValueAccessor = inject(RdxControlValueAccessor);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly renderer = inject(Renderer2);
    private uncheckedInputElement: HTMLInputElement | null = null;

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
     * controls. (Checkbox is not yet marked `implements` — its `checked` is still
     * `CheckedState`; see the `indeterminate` half of collision #1.)
     * @group Props
     */
    readonly submitValue = input<string>('on', { alias: 'value' });

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
    readonly onCheckedChange = output<RdxCheckboxCheckedChangeEvent>();

    /**
     * @ignore
     * The effective checked state as a `boolean`. Inside a `rdxCheckboxGroup` it is derived from the
     * group (a `parent` checkbox is checked only when every child is; a child from whether its `name`
     * is in the group value); standalone it reads the CVA value.
     */
    readonly checkedState = computed<boolean>(() => {
        const group = this.group;
        if (group) {
            if (this.parent()) {
                return group.parentState() === true;
            }

            const name = this.name();
            if (name !== undefined) {
                return group.value().includes(name);
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

    readonly state = computed(() =>
        this.indeterminateState() ? 'indeterminate' : this.checkedState() ? 'checked' : 'unchecked'
    );

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

        let hasAppliedDefault = false;
        effect(() => {
            const defaultChecked = this.defaultChecked();
            if (!hasAppliedDefault && defaultChecked !== undefined) {
                hasAppliedDefault = true;
                this.checked.set(defaultChecked);
                this.controlValueAccessor.setValue(defaultChecked);
            }
        });

        effect(() => {
            this.syncUncheckedInput();
        });

        inject(DestroyRef).onDestroy(() => {
            this.removeUncheckedInput();
        });
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

            const name = this.name();
            if (name !== undefined) {
                group.toggleValue(name, event);
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
    }

    private syncUncheckedInput(): void {
        const name = this.name();
        const uncheckedValue = this.uncheckedValue();
        const shouldRender =
            !this.checkedState() && !this.group && !this.parent() && name !== undefined && uncheckedValue !== undefined;

        if (!shouldRender) {
            this.removeUncheckedInput();
            return;
        }

        const input = this.ensureUncheckedInput();
        this.renderer.setAttribute(input, 'type', 'hidden');
        this.renderer.setAttribute(input, 'name', name);
        this.renderer.setAttribute(input, 'value', uncheckedValue);
        this.setOptionalAttribute(input, 'form', this.form());
        this.setBooleanAttribute(input, 'disabled', this.disabledState());
    }

    private ensureUncheckedInput(): HTMLInputElement {
        if (this.uncheckedInputElement) {
            return this.uncheckedInputElement;
        }

        const host = this.elementRef.nativeElement;
        const parent = host.parentNode;
        const input = this.renderer.createElement('input') as HTMLInputElement;
        if (parent) {
            this.renderer.insertBefore(parent, input, host.nextSibling);
        }
        this.uncheckedInputElement = input;
        return input;
    }

    private removeUncheckedInput(): void {
        const input = this.uncheckedInputElement;
        if (!input) {
            return;
        }

        const parent = input.parentNode;
        if (parent) {
            this.renderer.removeChild(parent, input);
        }
        this.uncheckedInputElement = null;
    }

    private setOptionalAttribute(element: HTMLElement, name: string, value: string | undefined): void {
        if (value) {
            this.renderer.setAttribute(element, name, value);
        } else {
            this.renderer.removeAttribute(element, name);
        }
    }

    private setBooleanAttribute(element: HTMLElement, name: string, value: boolean): void {
        if (value) {
            this.renderer.setAttribute(element, name, '');
        } else {
            this.renderer.removeAttribute(element, name);
        }
    }
}
