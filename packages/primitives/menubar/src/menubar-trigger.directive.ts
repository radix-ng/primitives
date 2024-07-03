import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { booleanAttribute, Directive, inject, input, Input } from '@angular/core';

@Directive({
    selector: '[MenuBarTrigger]',
    standalone: true,
    hostDirectives: [{ directive: CdkMenuTrigger, inputs: ['cdkMenuTriggerFor: MenuBarTrigger'] }],
    host: {
        type: 'button',
        role: 'menuitem',
        '[attr.aria-haspopup]': "'menu'",
        '[attr.data-disabled]': "disabled() ? '' : undefined",
        '[attr.data-state]': "cdkTrigger.isOpen() ? 'open': 'close'",
        '[disabled]': 'disabled()',

        '(onpointerdown)': 'onPointerDown($event)'
    }
})
export class RdxMenuBarTriggerDirective {
    protected readonly cdkTrigger = inject(CdkMenuTrigger, { host: true });

    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    onPointerDown($event: MouseEvent) {
        if (!this.disabled && $event.button === 0 && !$event.ctrlKey) {
            /* empty */
        }
    }
}
