import { Directive, EventEmitter, input, model, Output } from '@angular/core';

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
    onPressedChange?: EventEmitter<boolean>;
}

@Directive({
    selector: 'button[rdxToggle]',
    exportAs: 'rdxToggle',
    standalone: true,
    host: {
        type: 'button',
        '[attr.aria-pressed]': 'pressed()',
        '[attr.data-state]': 'pressed() ? "on" : "off"',
        '[attr.data-disabled]': 'disabled()',

        '(click)': 'toggle()'
    }
})
export class RdxToggleDirective {
    readonly defaultPressed = input<boolean>(false);
    readonly pressed = model<boolean>(this.defaultPressed());
    readonly disabled = input<boolean>(false);

    /**
     * Event emitted when the toggle is pressed.
     */
    @Output() readonly onPressedChange = new EventEmitter<boolean>();

    protected toggle(): void {
        if (!this.disabled()) {
            this.pressed.set(!this.pressed());
            this.onPressedChange.emit(this.pressed());
        }
    }
}
