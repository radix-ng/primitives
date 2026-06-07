import { booleanAttribute, computed, Directive, effect, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { BooleanInput, provideValueAccessor, RdxFormValueControl } from '@radix-ng/primitives/core';
import { Orientation, RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import { RadioGroupDirective, RadioGroupProps, RDX_RADIO_GROUP } from './radio-tokens';

@Directive({
    selector: '[rdxRadioRoot]',
    exportAs: 'rdxRadioRoot',
    providers: [
        provideValueAccessor(RdxRadioGroupDirective),
        { provide: RDX_RADIO_GROUP, useExisting: RdxRadioGroupDirective }
    ],
    hostDirectives: [{ directive: RdxRovingFocusGroupDirective, inputs: ['dir', 'orientation', 'loop'] }],
    host: {
        role: 'radiogroup',
        '[attr.aria-orientation]': 'orientation()',
        '[attr.aria-required]': 'required() ? "true" : undefined',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-required]': 'required() ? "" : undefined',
        '(keydown)': 'onKeydown()'
    }
})
export class RdxRadioGroupDirective
    implements RadioGroupProps, RadioGroupDirective, ControlValueAccessor, RdxFormValueControl<string | null>
{
    readonly value = model<string | null>(null);

    readonly defaultValue = input<string>();

    readonly name = input<string>();

    readonly form = input<string>();

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly orientation = input<Orientation>();

    /**
     * Event handler called when the value changes.
     */
    readonly onValueChange = output<string>();

    private readonly disable = signal<boolean>(this.disabled());
    readonly disabledState = computed(() => this.disable() || this.disabled());
    private readonly arrowNavigation = signal(false);

    /**
     * The callback function to call when the value of the radio group changes.
     */
    private onChange: (value: string | null) => void = () => {
        /* Empty */
    };

    /**
     * The callback function to call when the radio group is touched.
     * @ignore
     */
    onTouched: () => void = () => {
        /* Empty */
    };

    constructor() {
        effect(() => {
            if (this.value() === null && this.defaultValue() !== undefined) {
                this.value.set(this.defaultValue()!);
            }
        });
    }

    /**
     * Select a radio item.
     * @param value The value of the radio item to select.
     * @ignore
     */
    select(value: string | null): void {
        if (this.disabledState() || this.readonly() || this.value() === value) {
            return;
        }

        this.value.set(value);
        if (value !== null) {
            this.onValueChange.emit(value);
        }
        this.onChange?.(value);
        this.onTouched();
    }

    /**
     * Update the value of the radio group.
     * @param value The new value of the radio group.
     * @ignore
     */
    writeValue(value: string | null): void {
        this.value.set(value);
    }

    /**
     * Register a callback function to call when the value of the radio group changes.
     * @param fn The callback function to call when the value of the radio group changes.
     * @ignore
     */
    registerOnChange(fn: (value: string | null) => void): void {
        this.onChange = fn;
    }

    /** @ignore */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Set the disabled state of the radio group.
     * @param isDisabled Whether the radio group is disabled.
     * @ignore
     */
    setDisabledState(isDisabled: boolean): void {
        this.disable.set(isDisabled);
    }

    setArrowNavigation(value: boolean): void {
        this.arrowNavigation.set(value);
    }

    isArrowNavigation(): boolean {
        return this.arrowNavigation();
    }

    protected onKeydown(): void {
        if (this.disabledState()) return;
    }
}
