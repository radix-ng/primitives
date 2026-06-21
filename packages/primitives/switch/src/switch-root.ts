import { booleanAttribute, computed, Directive, effect, inject, input, model, output, signal } from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    injectControlValueAccessor,
    injectId,
    RdxCancelableChangeEventDetails,
    RdxControlValueAccessor,
    RdxFormCheckboxControl,
    RdxValidationError
} from '@radix-ng/primitives/core';
import { provideSwitchContext, RdxSwitchContext } from './switch-context';

export type RdxSwitchCheckedChangeReason = 'none';
export type RdxSwitchCheckedChangeEventDetails = RdxCancelableChangeEventDetails<RdxSwitchCheckedChangeReason>;

export interface RdxSwitchCheckedChangeEvent {
    checked: boolean;
    eventDetails: RdxSwitchCheckedChangeEventDetails;
}

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
        markAsTouched: () => root.markAsTouched()
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
        '[attr.aria-invalid]': 'invalidState() ? "true" : undefined',
        '[attr.data-checked]': 'checkedState() ? "" : undefined',
        '[attr.data-unchecked]': 'checkedState() ? undefined : ""',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-required]': 'required() ? "" : undefined',
        '[attr.data-invalid]': 'invalidState() ? "" : undefined',
        '[attr.data-valid]': 'invalidState() ? undefined : ""',
        '[attr.data-touched]': 'touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() ? "" : undefined',
        // Native `<button rdxSwitchRoot>` → native `disabled` (Base UI's `nativeButton: true` path in
        // `useFocusableWhenDisabled`). The hidden `[rdxSwitchInput]` is also disabled for form exclusion.
        '[attr.disabled]': 'isDisabled() ? "" : undefined',
        '(click)': 'toggle($event)',
        '(blur)': 'markAsTouched()'
    }
})
export class RdxSwitchRoot implements RdxFormCheckboxControl {
    /** @ignore */
    protected readonly cva = injectControlValueAccessor<boolean | undefined>();

    readonly id = input<string>(injectId('rdx-switch-'));

    /**
     * The state of the switch when it is initially rendered. Use when you do not need to control its state.
     *
     * @default false
     */
    readonly defaultChecked = input<boolean | undefined, BooleanInput | undefined>(undefined, {
        transform: (value) => (value === undefined ? undefined : booleanAttribute(value))
    });

    /**
     * The controlled checked state. Use with `(onCheckedChange)` or two-way `[(checked)]`.
     */
    readonly checked = model<boolean>(false);

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

    /** Whether the switch is invalid. A non-empty {@link errors} list also marks it invalid. */
    readonly invalid = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether the switch has been touched. A `model()` so Signal Forms can write it; set on blur. */
    readonly touched = model<boolean>(false);

    /** Whether the checked state changed from its initial value. Merged with internal tracking. */
    readonly dirty = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Validation errors for the switch. A non-empty list marks it invalid. */
    readonly errors = input<readonly RdxValidationError[]>([]);

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
    readonly onCheckedChange = output<RdxSwitchCheckedChangeEvent>();

    /** Emits on blur, notifying Signal Forms the switch was touched. */
    readonly touch = output<void>();

    /** @ignore */
    readonly checkedState = computed(() => !!this.cva.value());
    /** @ignore */
    protected readonly isDisabled = computed(() => !!this.cva.disabled());

    private readonly dirtyValue = signal(false);
    /** @ignore Invalid when the `invalid` input is set or the `errors` list is non-empty. */
    readonly invalidState = computed(() => this.invalid() || (this.errors()?.length ?? 0) > 0);
    /** @ignore */
    readonly touchedState = computed(() => this.touched());
    /** @ignore */
    readonly dirtyState = computed(() => this.dirty() || this.dirtyValue());

    constructor() {
        // Apply the uncontrolled `defaultChecked` once. `input()` values are not bound at field-init,
        // so the on state must be seeded here — into both the `checked` model and the CVA value, which
        // is the source of truth for `checkedState`/`aria-checked`/`data-checked`.
        let hasAppliedDefault = false;
        effect(() => {
            const defaultChecked = this.defaultChecked();
            if (!hasAppliedDefault && defaultChecked !== undefined) {
                hasAppliedDefault = true;
                this.checked.set(defaultChecked);
                this.cva.setValue(defaultChecked);
            }
        });
    }

    /**
     * Mark the switch touched — CVA for Reactive forms, plus the `touched` model + `touch` output for
     * Signal Forms. Called on blur of the root button or the hidden input.
     */
    markAsTouched(): void {
        this.cva.markAsTouched();
        this.touched.set(true);
        this.touch.emit();
    }

    /** @ignore Toggles the checked state unless disabled or read-only. */
    toggle(event?: Event): void {
        if (this.isDisabled() || this.readonly()) {
            return;
        }

        const next = !this.cva.value();
        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const { eventDetails } = createCancelableChangeEventDetails(
            'none',
            event ?? new Event('switch.checked-change'),
            trigger
        );
        this.onCheckedChange.emit({ checked: next, eventDetails });
        if (eventDetails.isCanceled()) {
            return;
        }

        this.checked.set(next);
        this.cva.setValue(next);
        this.dirtyValue.set(true);
    }
}
