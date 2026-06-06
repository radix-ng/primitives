import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, inject, input, model, output } from '@angular/core';
import {
    _IdGenerator,
    injectControlValueAccessor,
    RdxControlValueAccessor,
    RdxFormCheckboxControl
} from '@radix-ng/primitives/core';
import { provideSwitchContext, RdxSwitchContext } from './switch-context';

const context = (): RdxSwitchContext => {
    const root = inject(RdxSwitchRoot);
    const cva = injectControlValueAccessor<boolean | undefined>();

    return {
        checked: root.checkedState,
        disabled: computed(() => !!cva.disabled()),
        readonly: root.readonly,
        required: root.required,
        name: root.name,
        value: root.submitValue,
        ariaLabel: root.ariaLabel,
        ariaLabelledBy: root.ariaLabelledBy,
        markAsTouched: () => cva.markAsTouched()
    };
};

/**
 * A control that toggles between on and off.
 *
 * @see https://base-ui.com/react/components/switch
 */
@Directive({
    selector: 'button[rdxSwitchRoot]',
    exportAs: 'rdxSwitchRoot',
    providers: [provideSwitchContext(context)],
    hostDirectives: [
        {
            directive: RdxControlValueAccessor,
            inputs: ['value: checked', 'disabled']
        }
    ],
    host: {
        role: 'switch',
        type: 'button',
        '[id]': 'id()',
        '[attr.aria-checked]': 'checkedState()',
        '[attr.aria-required]': 'required() ? "true" : undefined',
        '[attr.aria-readonly]': 'readonly() ? "true" : undefined',
        '[attr.data-checked]': 'checkedState() ? "" : undefined',
        '[attr.data-unchecked]': 'checkedState() ? undefined : ""',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-required]': 'required() ? "" : undefined',
        '[attr.disabled]': 'isDisabled() ? "" : undefined',
        '(click)': 'toggle()',
        '(keydown.enter)': '$event.preventDefault()'
    }
})
export class RdxSwitchRoot implements RdxFormCheckboxControl {
    /** @ignore */
    protected readonly cva = injectControlValueAccessor<boolean | undefined>();

    readonly id = input<string>(inject(_IdGenerator).getId('rdx-switch-'));

    /**
     * The state of the switch when it is initially rendered. Use when you do not need to control its state.
     *
     * @default false
     */
    readonly defaultChecked = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The controlled checked state. Use with `(onCheckedChange)` or two-way `[(checked)]`.
     */
    readonly checked = model<boolean>(this.defaultChecked());

    /**
     * When `true`, prevents the user from interacting with the switch.
     *
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * When `true`, the switch is focusable but cannot be toggled.
     *
     * @default false
     */
    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * When `true`, the switch must be on before the owning form can be submitted.
     *
     * @default false
     */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Name of the hidden form input rendered by `[rdxSwitchInput]`. */
    readonly name = input<string>();

    /**
     * Value submitted with the form when the switch is on.
     *
     * Bound publicly as `[value]`; the TS member is named `submitValue` so the
     * directive can satisfy `RdxFormCheckboxControl`, whose contract reserves a
     * `value` member for `RdxFormValueControl` and forbids it on checkbox-style
     * controls.
     *
     * @default 'on'
     */
    readonly submitValue = input<string>('on', { alias: 'value' });

    readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

    /** Event handler called when the checked state of the switch changes. */
    readonly onCheckedChange = output<boolean>();

    /** @ignore */
    readonly checkedState = computed(() => !!this.cva.value());
    /** @ignore */
    protected readonly isDisabled = computed(() => !!this.cva.disabled());

    /** @ignore Toggles the checked state unless disabled or read-only. */
    toggle(): void {
        if (this.isDisabled() || this.readonly()) {
            return;
        }

        const next = !this.cva.value();
        this.checked.set(next);
        this.cva.setValue(next);
        this.onCheckedChange.emit(next);
    }
}
