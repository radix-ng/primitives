import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, model, output, OutputEmitterRef } from '@angular/core';

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

@Directive({
    selector: '[rdxToggle]',
    exportAs: 'rdxToggle',
    standalone: true,
    host: {
        '[attr.aria-pressed]': 'pressed()',
        '[attr.data-state]': 'pressed() ? "on" : "off"',
        '[attr.data-disabled]': 'disabled()',
        '[disabled]': 'disabled()',

        '(click)': 'toggle()'
    }
})
export class RdxToggleDirective {
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

    /**
     * Event handler called when the pressed state of the toggle changes.
     */
    readonly onPressedChange = output<boolean>();

    protected toggle(): void {
        if (!this.disabled()) {
            this.pressed.set(!this.pressed());
            this.onPressedChange.emit(this.pressed());
        }
    }
}
