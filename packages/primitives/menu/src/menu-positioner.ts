import { setupMenuInternalBackdrop } from './menu-internal-backdrop';
import { injectRdxMenuRootContext } from './menu-root';
import { afterNextRender, Directive, ElementRef, inject, Injector } from '@angular/core';
import {
    legacyPopperVars,
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';

/**
 * Positions the menu against its trigger.
 *
 * A "thin" positioner (ADR 0012): it inherits the popper positioning surface (inputs, `placed`
 * output, unified vars + placement attrs) from {@link RdxPopperContentWrapper} and adds the menu
 * defaults, the open/closed state attributes, and the deprecated `--radix-menu-*` aliases.
 */
@Directive({
    selector: '[rdxMenuPositioner]',
    exportAs: 'rdxMenuPositioner',
    providers: [
        ...provideRdxPopperContentWrapper(RdxMenuPositioner),
        provideRdxPopperContentConfig({ arrowPadding: 5, collisionPadding: 5, updatePositionStrategy: 'always' })
    ],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        // `data-side`/`data-align`/`data-anchor-hidden` and the unified vars come from the inherited
        // wrapper (ADR 0012); only the deprecated `--radix-menu-*` aliases remain, for back-compat.
        '[style]': 'legacyVars'
    }
})
export class RdxMenuPositioner extends RdxPopperContentWrapper {
    protected readonly rootContext = injectRdxMenuRootContext();
    protected readonly legacyVars = legacyPopperVars('menu');

    constructor() {
        super();
        const injector = inject(Injector);
        const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        // After the structural portal has relocated this positioner into the portal container, set up the
        // modal internal backdrop (finding #1) as a sibling before it.
        afterNextRender(() => setupMenuInternalBackdrop(host, this.rootContext, injector));
    }
}
