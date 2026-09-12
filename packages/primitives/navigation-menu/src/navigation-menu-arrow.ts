import { computed, Directive, inject } from '@angular/core';
import { RdxPopperArrow, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * An optional arrow element pointing toward the active trigger.
 */
@Directive({
    selector: '[rdxNavigationMenuArrow]',
    hostDirectives: [RdxPopperArrow],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()'
    }
})
export class RdxNavigationMenuArrow {
    protected readonly rootContext = injectNavigationMenuRootContext();
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });

    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());
}
