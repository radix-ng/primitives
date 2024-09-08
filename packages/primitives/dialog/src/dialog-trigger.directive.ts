import { Directive, input } from '@angular/core';

let nextId = 0;

// Primitive.button
@Directive({
    selector: '[rdxDialogTrigger], [rdxDialogTriggerFor]',
    standalone: true,
    host: {
        type: 'button',
        '[attr.id]': 'id()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.aria-expanded]': '"true"',
        '[attr.aria-controls]': '"true"',
        '[attr.data-state]': '"true"',
        '(click)': 'onClick()'
    }
})
export class RdxDialogTriggerDirective {
    readonly id = input(`rdx-dialog-trigger-${nextId++}`);

    protected onClick() {
        /* empty */
    }
}
