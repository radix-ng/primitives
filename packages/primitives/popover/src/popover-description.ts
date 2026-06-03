import { injectRdxPopoverRootContext } from './popover-root';
import { computed, DestroyRef, Directive, effect, inject, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';

/**
 * An accessible description for the popover.
 */
@Directive({
    selector: '[rdxPopoverDescription]',
    host: {
        '[id]': 'id()'
    }
})
export class RdxPopoverDescription {
    private readonly rootContext = injectRdxPopoverRootContext();
    private readonly generatedId = injectId('rdx-popover-description-');

    readonly idInput = input<string | undefined>(undefined, { alias: 'id' });
    readonly id = computed(() => this.idInput() ?? this.generatedId);

    constructor() {
        effect((onCleanup) => {
            const id = this.id();
            this.rootContext.setDescriptionId(id);
            onCleanup(() => this.rootContext.setDescriptionId(undefined));
        });

        inject(DestroyRef).onDestroy(() => this.rootContext.setDescriptionId(undefined));
    }
}
