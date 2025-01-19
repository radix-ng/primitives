import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input } from '@angular/core';

export type ButtonType = 'button' | 'submit' | 'reset';

let nextId = 0;

@Directive({
    selector: '[rdxButton]',
    standalone: true,
    host: {
        '[attr.id]': 'id()',
        '[attr.type]': 'type()',
        '[attr.tabindex]': 'tabIndex()',

        '[attr.aria-disabled]': 'ariaDisabled()',
        '[attr.aria-pressed]': 'isActive()',

        '[attr.disabled]': 'attrDisabled()'
    }
})
export abstract class RdxButtonDirective {
    readonly id = input<string>(`rdx-button-${nextId++}`);

    readonly type = input<ButtonType>('button');

    readonly active = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly isLoading = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly #_disabled = computed(() => this.disabled());

    readonly ariaDisabled = computed(() => {
        return this.#_disabled() ? true : undefined;
    });

    readonly attrDisabled = computed(() => {
        return this.#_disabled() ? '' : undefined;
    });

    readonly tabIndex = computed(() => {
        return this.#_disabled() ? '-1' : undefined;
    });

    readonly isActive = computed(() => {
        return <boolean>this.active() || undefined;
    });
}
