import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { booleanAttribute, Directive, inject, input } from '@angular/core';

@Directive({
    selector: '[MenuTrigger]',
    hostDirectives: [
        {
            directive: CdkMenuTrigger,
            inputs: ['cdkMenuTriggerFor: menuTriggerFor']
        }
    ],
    host: {
        role: 'menuitem',
        '[attr.aria-haspopup]': "'menu'",
        '[attr.aria-expanded]': 'cdkTrigger.isOpen()',
        '[attr.data-state]': "cdkTrigger.isOpen() ? 'open': 'closed'",
        '[attr.data-disabled]': "disabled() ? '' : undefined",

        '(pointerdown)': 'onPointerDown($event)'
    }
})
export class RdxMenuTriggerDirective {
    protected readonly cdkTrigger = inject(CdkMenuTrigger, { host: true });

    readonly menuTriggerFor = input.required();

    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    onPointerDown($event: MouseEvent) {
        // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
        // but not when the control key is pressed (avoiding MacOS right click)
        if (!this.disabled() && $event.button === 0 && !$event.ctrlKey) {
            /* empty */
            if (!this.cdkTrigger.isOpen()) {
                // prevent trigger focusing when opening
                // this allows the content to be given focus without competition
                $event.preventDefault();
            }
        }
    }
}
