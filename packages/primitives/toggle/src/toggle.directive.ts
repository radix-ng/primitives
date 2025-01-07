import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    forwardRef,
    input,
    model,
    output,
    OutputEmitterRef,
    signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface ToggleProps {
    /**
     * The controlled state of the toggle.
     */
    pressed?: boolean;

    /**
     * The state of the toggle when initially rendered. Use `defaultPressed`
     * if you do not need to control the state of the toggle.
     * @defaultValue false
     */
    defaultPressed?: boolean;

    /**
     * The callback that fires when the state of the toggle changes.
     */
    onPressedChange?: OutputEmitterRef<boolean>;

    /**
     * Whether the toggle is disabled.
     * @defaultValue false
     */
    disabled?: boolean;
}

export type DataState = 'on' | 'off';

export const TOGGLE_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RdxToggleDirective),
    multi: true
};

/**
 * @group Components
 */
@Directive({
    selector: '[rdxToggle]',
    exportAs: 'rdxToggle',
    standalone: true,
    providers: [TOGGLE_VALUE_ACCESSOR],
    host: {
        '[attr.aria-pressed]': 'pressed()',
        '[attr.data-state]': 'dataState()',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[disabled]': 'disabledState()',

        '(click)': 'togglePressed()'
    }
})
export class RdxToggleDirective implements ControlValueAccessor {
    /**
     * The pressed state of the toggle when it is initially rendered.
     * Use when you do not need to control its pressed state.
     *
     * @group Props
     */
    readonly defaultPressed = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The controlled pressed state of the toggle.
     * Must be used in conjunction with `onPressedChange`.
     *
     * @group Props
     */
    readonly pressed = model<boolean>(this.defaultPressed());

    /**
     * When true, prevents the user from interacting with the toggle.
     *
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @ignore */
    readonly disabledModel = model<boolean>(this.disabled());

    /** @ignore */
    readonly disabledState = computed(() => this.disabled() || this.disabledModel() || this.accessorDisabled());

    protected readonly dataState = computed<DataState>(() => {
        return this.pressed() ? 'on' : 'off';
    });

    /**
     * Event handler called when the pressed state of the toggle changes.
     *
     * @group Emits
     */
    readonly onPressedChange = output<boolean>();

    protected togglePressed(): void {
        if (!this.disabled()) {
            this.pressed.set(!this.pressed());
            this.onChange(this.pressed());
            this.onPressedChange.emit(this.pressed());
        }
    }

    private readonly accessorDisabled = signal(false);

    private onChange: (value: any) => void = () => {};

    /** @ignore */
    onTouched: (() => void) | undefined;

    /** @ignore */
    writeValue(value: any): void {
        this.pressed.set(value);
    }

    /** @ignore */
    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    /** @ignore */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** @ignore */
    setDisabledState(isDisabled: boolean): void {
        this.accessorDisabled.set(isDisabled);
    }
}
