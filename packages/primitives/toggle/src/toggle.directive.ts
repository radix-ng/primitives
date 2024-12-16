import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    forwardRef,
    input,
    model,
    output,
    OutputEmitterRef
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

@Directive({
    selector: '[rdxToggle]',
    exportAs: 'rdxToggle',
    standalone: true,
    providers: [TOGGLE_VALUE_ACCESSOR],
    host: {
        '[attr.aria-pressed]': 'pressed()',
        '[attr.data-state]': 'dataState()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[disabled]': 'disabled()',

        '(click)': 'togglePressed()'
    }
})
export class RdxToggleDirective implements ControlValueAccessor {
    /**
     * The pressed state of the toggle when it is initially rendered.
     * Use when you do not need to control its pressed state.
     */
    readonly defaultPressed = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The controlled pressed state of the toggle.
     * Must be used in conjunction with `onPressedChange`.
     */
    readonly pressed = model<boolean>(this.defaultPressed());

    /**
     * When true, prevents the user from interacting with the toggle.
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly dataState = computed<DataState>(() => {
        return this.pressed() ? 'on' : 'off';
    });

    /**
     * Event handler called when the pressed state of the toggle changes.
     */
    readonly onPressedChange = output<boolean>();

    protected togglePressed(): void {
        if (!this.disabled()) {
            this.pressed.set(!this.pressed());
            this.onPressedChange.emit(this.pressed());
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    private onChange: Function = () => {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    private onTouched: Function = () => {};

    writeValue(value: any): void {
        this.pressed.set(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    registerOnChange(fn: Function): void {
        this.onChange = fn;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    registerOnTouched(fn: Function): void {
        this.onTouched = fn;
    }
}
