import { DestroyRef, Directive, inject } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectRdxMenuGroupContext } from './menu-group-context';

/**
 * A label for a menu group.
 */
@Directive({
    selector: '[rdxMenuGroupLabel]',
    exportAs: 'rdxMenuGroupLabel',
    host: {
        '[attr.id]': 'id'
    }
})
export class RdxMenuGroupLabel {
    private readonly groupContext = injectRdxMenuGroupContext();

    readonly id = injectId('rdx-menu-group-label-');

    constructor() {
        this.groupContext.labelId.set(this.id);
        inject(DestroyRef).onDestroy(() => {
            if (this.groupContext.labelId() === this.id) {
                this.groupContext.labelId.set(undefined);
            }
        });
    }
}
