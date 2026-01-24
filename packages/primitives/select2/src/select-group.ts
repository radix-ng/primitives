import { Directive, inject } from '@angular/core';
import { _IdGenerator } from '@radix-ng/primitives/core';

@Directive({
    selector: '[rdxSelectGroup]',
    exportAs: 'rdxSelectGroup',
    host: {
        role: 'group',
        '[attr.aria-labelledby]': 'id'
    }
})
export class RdxSelectGroup {
    readonly id = inject(_IdGenerator).getId('rdx-select-group-');
}
