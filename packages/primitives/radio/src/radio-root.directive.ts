import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, Input, model, output, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@radix-ng/primitives/core';
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
        '[attr.aria-required]': 'required()',
        '[attr.data-disabled]': 'disableState() ? "" : null',
        '(keydown)': 'onKeydown()'
    }
})
export class RdxRadioGroupDirective implements RadioGroupProps, RadioGroupDirective, ControlValueAccessor {
    readonly value = model<string | null>(null);

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    @Input() defaultValue?: string;

    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly orientation = input<Orientation>();

    /**
     * Event handler called when the value changes.
     */
    readonly onValueChange = output<string>();

    private readonly disable = signal<boolean>(this.disabled());
    readonly disableState = computed(() => this.disable() || this.disabled());

    /**
     * The callback function to call when the value of the radio group changes.
     */
    private onChange: (value: string) => void = () => {
        /* Empty */
    };

    /**
     * The callback function to call when the radio group is touched.
     * @ignore
     */
    onTouched: () => void = () => {
        /* Empty */
    };

    /**
     * Select a radio item.
     * @param value The value of the radio item to select.
     * @ignore
     */
    select(value: string): void {
        this.value.set(value);
        this.onValueChange.emit(value);
        this.onChange?.(value);
        this.onTouched();
    }

    /**
     * Update the value of the radio group.
     * @param value The new value of the radio group.
     * @ignore
     */
    writeValue(value: string): void {
        this.value.set(value);
    }

    /**
     * Register a callback function to call when the value of the radio group changes.
     * @param fn The callback function to call when the value of the radio group changes.
     * @ignore
     */
    registerOnChange(fn: (value: string) => void): void {
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

    protected onKeydown(): void {
        if (this.disableState()) return;
    }
}
