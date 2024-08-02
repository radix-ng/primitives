import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItemRadio } from '@angular/cdk/menu';
import { booleanAttribute, computed, Directive, effect, inject, input, signal } from '@angular/core';

@Directive({
    selector: '[MenubarItemRadio]',
    standalone: true,
    hostDirectives: [CdkMenuItemRadio],
    host: {
        role: 'menuitemradio',
        '[attr.aria-checked]': 'checked()',
        '[attr.data-state]': 'checked() ? "checked": "unchecked"',
        '[disabled]': 'disabledState()'
    }
})
export class RdxMenubarItemRadioDirective {
    private readonly cdkMenuItemRadio = inject(CdkMenuItemRadio, { host: true });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    readonly checked = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly disabledState = computed(() => this.disabled || this.disabled$());

    protected readonly checked$ = signal(this.cdkMenuItemRadio.checked);
    protected readonly disabled$ = signal(this.cdkMenuItemRadio.disabled);

    constructor() {
        effect(() => {
            this.cdkMenuItemRadio.checked = this.checked();
            this.cdkMenuItemRadio.disabled = this.disabled();
        });
    }
}
