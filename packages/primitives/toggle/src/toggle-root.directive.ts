import { booleanAttribute, Directive, EventEmitter, Input, Output } from '@angular/core';

let uniqueId = 0;

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
    selector: 'button[ToggleRoot]',
    exportAs: 'ToggleRoot',
    standalone: true,
    host: {
        type: 'button',
        '[attr.aria-pressed]': 'pressed',
        '[attr.data-state]': 'pressed ? "on" : "off"',
        '[attr.data-disabled]': 'disabled',

        '(click)': '_toggle($event)'
    }
})
export class RdxToggleRootDirective implements ToggleProps {
    @Input({ alias: 'rdxTogglePressed', transform: booleanAttribute }) pressed = false;

    @Input({ alias: 'rdxToggleDisabled', transform: booleanAttribute }) disabled = false;

    @Input() id = 'rdx-toggle-' + uniqueId++;
    /**
     * Event emitted when the toggle is pressed.
     */
    @Output('rdxToggleOnPressedChange') readonly onPressedChange = new EventEmitter<boolean>();

    _toggle(event: MouseEvent): void {
        if (this.disabled) {
            return;
        }
        this.pressed = !this.pressed;
        this.onPressedChange.emit(this.pressed);

        event.stopPropagation();
    }
}
