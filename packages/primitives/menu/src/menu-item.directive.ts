import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItem } from '@angular/cdk/menu';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    Output
} from '@angular/core';

type radixProps = {
    disabled: boolean;
    onSelect: () => {};
};

@Directive({
    selector: '[MenuItem]',
    standalone: true,
    hostDirectives: [CdkMenuItem],
    host: {
        role: 'menuitem',
        type: 'button',
        tabindex: '0',
        '[attr.data-orientation]': "'horizontal'",
        //'[attr.data-highlighted]': "",
        '[attr.data-disabled]': "disabledState() ? '' : undefined",
        '[disabled]': 'disabledState()'
    }
})
export class RdxMenuItemDirective {
    private readonly cdkMenuItem = inject(CdkMenuItem, { host: true });

    // When true, prevents the user from interacting with the item.
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
        alias: 'rdxDisabled'
    });

    protected readonly disabledState = computed(() => this.disabled());

    // Event handler called when the user selects an item (via mouse or keyboard).
    @Output()
    onSelect = this.cdkMenuItem.triggered;

    constructor() {
        effect(() => {
            this.cdkMenuItem.disabled = this.disabled();
        });
    }
}
