import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { booleanAttribute, Directive, inject, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';

@Directive({
    selector: '[DropdownMenuTrigger]',
    standalone: true,
    hostDirectives: [
        {
            directive: CdkMenuTrigger,
            inputs: [
                'cdkMenuTriggerFor: DropdownMenuTrigger',
                'cdkMenuPosition: DropdownMenuPosition'
            ]
        }
    ],
    host: {
        type: 'button',
        '[attr.aria-haspopup]': "'menu'",
        '[attr.aria-expanded]': 'cdkMenuTrigger.isOpen()',
        '[attr.data-state]': "cdkMenuTrigger.isOpen() ? 'open': 'closed'",
        '[attr.data-disabled]': "disabled() ? '' : undefined",
        '[disabled]': 'disabled()',

        '(pointerdown)': 'onPointerDown($event)'
    }
})
export class RdxDropdownMenuTriggerDirective {
    protected readonly cdkMenuTrigger = inject(CdkMenuTrigger, { host: true });

    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    /*
     * Event handler called when the open state of the dropdown menu changes.
     * // TODO: mv to RootMenuDropdown
     */
    onOpenChange = outputFromObservable(this.cdkMenuTrigger?.opened);

    onPointerDown($event: MouseEvent) {
        // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
        // but not when the control key is pressed (avoiding MacOS right click)
        if (!this.disabled() && $event.button === 0 && !$event.ctrlKey) {
            /* empty */
            if (!this.cdkMenuTrigger.isOpen()) {
                // prevent trigger focusing when opening
                // this allows the content to be given focus without competition
                $event.preventDefault();
            }
        }
    }
}
