import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItem } from '@angular/cdk/menu';
import { booleanAttribute, computed, Directive, effect, inject, input } from '@angular/core';

@Directive({
    selector: '[MenuItem]',
    standalone: true,
    hostDirectives: [CdkMenuItem],
    host: {
        role: 'menuitem',
        type: 'button',
        tabindex: '0',
        '[attr.data-orientation]': "'horizontal'",
        '[attr.data-disabled]': "disabledState() ? '' : undefined",
        '[disabled]': 'disabledState()'
    }
})
export class RdxMenuItemDirective {
    private readonly cdkMenuItem = inject(CdkMenuItem, { host: true });

    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
        alias: 'rdxDisabled'
    });

    protected readonly disabledState = computed(() => this.disabled());

    constructor() {
        effect(() => {
            this.cdkMenuItem.disabled = this.disabled();
        });
    }
}
