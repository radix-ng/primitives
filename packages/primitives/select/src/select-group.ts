import { Directive } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';

@Directive({
    selector: '[rdxSelectGroup]',
    exportAs: 'rdxSelectGroup',
    host: {
        role: 'group',
        '[attr.aria-labelledby]': 'id'
    }
})
export class RdxSelectGroup {
    readonly id = injectId('rdx-select-group-');
}
