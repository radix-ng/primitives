import { computed, DestroyRef, Directive, effect, inject, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * An accessible title for the popover.
 */
@Directive({
    selector: '[rdxPopoverTitle]',
    host: {
        '[id]': 'id()'
    }
})
export class RdxPopoverTitle {
    private readonly rootContext = injectRdxPopoverRootContext();
    private readonly generatedId = injectId('rdx-popover-title-');

    readonly idInput = input<string | undefined>(undefined, { alias: 'id' });
    readonly id = computed(() => this.idInput() ?? this.generatedId);

    constructor() {
        effect((onCleanup) => {
            const id = this.id();
            this.rootContext.setTitleId(id);
            onCleanup(() => this.rootContext.setTitleId(undefined));
        });

        inject(DestroyRef).onDestroy(() => this.rootContext.setTitleId(undefined));
    }
}
