import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { booleanAttribute, Directive, input, Input } from '@angular/core';

@Directive({
    selector: '[MenuBarTrigger]',
    standalone: true,
    hostDirectives: [CdkMenuTrigger],
    host: {
        type: 'button',
        role: 'menuitem',
        '[attr.aria-haspopup]': "'menu'",
        '[attr.data-disabled]': "disabled() ? '' : undefined",
        '[disabled]': 'disabled()',

        '(onpointerdown)': 'onPointerDown($event)'
    }
})
export class RdxMenuBarTriggerDirective {
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    onPointerDown($event: MouseEvent) {
        if (!this.disabled && $event.button === 0 && !$event.ctrlKey) {
            /* empty */
        }
    }
}
