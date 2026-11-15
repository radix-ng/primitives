import { computed, Directive, input } from '@angular/core';
import { injectId, watch } from '@radix-ng/primitives/core';
import { injectRdxMenuGroupContext } from './menu-group-context';

/**
 * A label for a menu group.
 */
@Directive({
    selector: '[rdxMenuGroupLabel]',
    exportAs: 'rdxMenuGroupLabel',
    host: {
        '[attr.id]': 'resolvedId()',
        'aria-hidden': 'true'
    }
})
export class RdxMenuGroupLabel {
    private readonly groupContext = injectRdxMenuGroupContext();

    private readonly generatedId = injectId('rdx-menu-group-label-');
    /** Native label id. Defaults to a generated SSR-stable id. */
    readonly id = input<string>();
    protected readonly resolvedId = computed(() => this.id() || this.generatedId);

    constructor() {
        watch([this.resolvedId], ([id], onCleanup) => {
            this.groupContext.labelId.set(id);
            onCleanup(() => {
                if (this.groupContext.labelId() === id) this.groupContext.labelId.set(undefined);
            });
        });
    }
}
