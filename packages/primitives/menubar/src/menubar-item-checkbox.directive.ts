import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItem, CdkMenuItemCheckbox } from '@angular/cdk/menu';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    signal
} from '@angular/core';

@Directive({
    selector: '[MenubarCheckboxItem]',
    standalone: true,
    hostDirectives: [CdkMenuItemCheckbox],
    host: {
        role: 'menuitemcheckbox',
        '[attr.data-state]': 'checked$()',
        '[disabled]': 'disabledState()'
    }
})
export class RdxMenubarItemCheckboxDirective {
    private readonly cdkMenuItemCheckbox = inject(CdkMenuItemCheckbox, { host: true });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    readonly checked = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly disabledState = computed(() => this.disabled || this.disabled$());

    protected readonly checked$ = signal(this.cdkMenuItemCheckbox.checked);
    protected readonly disabled$ = signal(this.cdkMenuItemCheckbox.disabled);

    constructor() {
        effect(() => {
            this.cdkMenuItemCheckbox.checked = this.checked();
            this.cdkMenuItemCheckbox.disabled = this.disabled();
        });
    }
}
