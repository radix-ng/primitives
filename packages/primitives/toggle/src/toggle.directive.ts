import {
    booleanAttribute,
    Directive,
    EventEmitter,
    HostListener,
    Input,
    Output
} from '@angular/core';

let uniqueId = 0;

@Directive({
    selector: 'button[rdxToggle]',
    standalone: true,
    host: {
        type: 'button',
        '[attr.aria-pressed]': 'pressed',
        '[attr.data-state]': 'pressed ? "on" : "off"',
        '[attr.data-disabled]': 'disabled'
    }
})
export class RdxToggleDirective {
    /**
     * Whether the toggle is pressed.
     * @default false
     */
    @Input({ alias: 'rdxTogglePressed', transform: booleanAttribute }) pressed = false;

    /**
     * Whether the toggle is disabled.
     * @default false
     */
    @Input({ alias: 'rdxToggleDisabled', transform: booleanAttribute }) disabled = false;

    /**
     * Determine element id
     */
    @Input() id = 'rdx-toggle-' + uniqueId++;
    /**
     * Event emitted when the toggle is pressed.
     */
    @Output('rdxToggleOnPressedChange') readonly pressedChange = new EventEmitter<boolean>();

    /**
     * Toggle the pressed state.
     */
    @HostListener('click')
    toggle(): void {
        if (this.disabled) {
            return;
        }

        this.pressed = !this.pressed;
        this.pressedChange.emit(this.pressed);
    }
}
