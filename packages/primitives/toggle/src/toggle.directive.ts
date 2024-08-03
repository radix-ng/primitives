import { Directive, effect, EventEmitter, input, Output, signal } from '@angular/core';

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
        '[attr.aria-pressed]': 'internalPressed()',
        '[attr.data-state]': 'internalPressed() ? "on" : "off"',
        '[attr.data-disabled]': 'disabled()',

        '(click)': 'toggle()'
    }
})
export class RdxToggleDirective {
    readonly pressed = input<boolean | undefined>();
    readonly defaultPressed = input<boolean>(false);
    readonly disabled = input<boolean>(false);

    /**
     * Event emitted when the toggle is pressed.
     */
    @Output() readonly onPressedChange = new EventEmitter<boolean>();

    protected internalPressed = signal(this.defaultPressed());

    constructor() {
        effect(() => {
            const pressedValue = this.pressed();
            this.internalPressed.set(pressedValue !== undefined ? pressedValue : this.defaultPressed());
        });
    }

    protected toggle(): void {
        if (!this.disabled()) {
            this.internalPressed.set(!this.internalPressed());
            this.onPressedChange.emit(this.internalPressed());
        }
    }
}
