import { booleanAttribute, computed, Directive, effect, inject, input, model, output, signal } from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    injectControlValueAccessor,
    injectId,
    RdxCancelableChangeEventDetails,
    RdxControlValueAccessor,
    RdxFormCheckboxControl,
    RdxFormUiControlBase,
    RdxFormUiTouchTarget,
    useNativeFormControl
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
        form: root.form,
        value: root.submitValue,
        ariaLabel: root.ariaLabel,
        ariaLabelledBy: root.ariaLabelledBy,
        registerNativeInput: (input) => root.registerNativeInput(input),
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
        '[attr.aria-invalid]': 'displayValid() === false ? "true" : undefined',
        '[attr.data-checked]': 'checkedState() ? "" : undefined',
        '[attr.data-unchecked]': 'checkedState() ? undefined : ""',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-required]': 'required() ? "" : undefined',
        '[attr.data-invalid]': 'displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() ? "" : undefined',
        // Native `<button rdxSwitchRoot>` → native `disabled` (Base UI's `nativeButton: true` path in
        // `useFocusableWhenDisabled`). The hidden `[rdxSwitchInput]` is also disabled for form exclusion.
        '[attr.disabled]': 'isDisabled() ? "" : undefined',
        '(click)': 'toggle($event)',
        '(blur)': 'markAsTouched()'
    }
})
export class RdxSwitchRoot extends RdxFormUiControlBase implements RdxFormCheckboxControl {
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

    /** Native form field name. */
    readonly name = input<string>();

    /** Associates the switch with an external form by id. */
    readonly form = input<string>();

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

    /**
     * Value submitted while the switch is off. When omitted, the off state contributes no entry,
     * matching native checkbox behavior.
     */
    readonly uncheckedValue = input<string>();

    readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

    /** Event handler called when the checked state of the switch changes. */
    readonly onCheckedChange = output<RdxSwitchCheckedChangeEvent>();

    /** @ignore */
    readonly checkedState = computed(() => !!this.cva.value());
    /** @ignore */
    protected readonly isDisabled = computed(() => !!this.cva.disabled());
    private readonly nativeInput = signal<HTMLInputElement | null>(null);
    private readonly nativeInputOwnsValue = computed(
        () => this.nativeInput() !== null && (this.checkedState() || this.uncheckedValue() === undefined)
    );

    /** @ignore */
    readonly invalidState = this.formUi.invalidState;
    /** @ignore */
    readonly touchedState = this.formUi.touchedState;
    /** @ignore */
    readonly dirtyState = this.formUi.dirtyState;

    constructor() {
        super();

        useNativeFormControl({
            name: this.name,
            form: this.form,
            disabled: this.isDisabled,
            value: this.checkedState,
            serialize: (checked) => {
                const value = checked ? this.submitValue() : this.uncheckedValue();
                return value === undefined ? [] : [value];
            },
            hasNativeControl: this.nativeInputOwnsValue,
            syncNativeControl: () => {
                const input = this.nativeInput();
                if (input) {
                    input.checked = this.checkedState();
                }
            },
            defaultValue: () => this.defaultChecked() ?? this.checkedState(),
            onReset: (value) => {
                this.checked.set(value);
                if (!this.resetNgControl(value)) {
                    this.cva.writeValue(value);
                }
                this.formUi.resetInteractionState?.();
            }
        });

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

    /** @ignore Bridge the CVA into `markAsTouched` (dual). */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return injectControlValueAccessor<boolean | undefined>();
    }

    /**
     * Mark the switch touched — CVA for Reactive forms, plus the `touched` model + `touch` output for
     * Signal Forms. Called on blur of the root button or the hidden input.
     */
    markAsTouched(): void {
        this.formUi.markAsTouched();
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
        this.formUi.markDirty();
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
