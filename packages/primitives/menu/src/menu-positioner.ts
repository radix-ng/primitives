import { afterNextRender, computed, Directive, ElementRef, inject, Injector } from '@angular/core';
import {
    DROPDOWN_COLLISION_AVOIDANCE,
    legacyPopperVars,
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';
import { setupMenuInternalBackdrop } from './menu-internal-backdrop';
import { injectRdxMenuRootContext } from './menu-root';

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
        // Base UI applies the DROPDOWN preset to a root menu (and POPUP to submenus, which we don't
        // differentiate yet — logical-side submenu placement is a separate epic).
        provideRdxPopperContentConfig({
            arrowPadding: 5,
            collisionPadding: 5,
            collisionAvoidance: DROPDOWN_COLLISION_AVOIDANCE,
            updatePositionStrategy: 'always'
        })
    ],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        // Base UI puts a native `hidden` on a closed positioner (`hidden: !mounted`). It matters for a
        // `keepMounted` menu: while closed-and-settled the popup stays in the DOM but must be removed from
        // layout / a11y / tab order. Gated on `visible` (not `present`/`isOpen`) so an exit animation
        // still plays — the popup only hides once the closing transition ends.
        '[hidden]': '!visible()',
        // `data-side`/`data-align`/`data-anchor-hidden` and the unified vars come from the inherited
        // wrapper (ADR 0012); only the deprecated `--radix-menu-*` aliases remain, for back-compat.
        '[style]': 'legacyVars'
    }
})
export class RdxMenuPositioner extends RdxPopperContentWrapper {
    protected readonly rootContext = injectRdxMenuRootContext();
    protected readonly legacyVars = legacyPopperVars('menu');

    /**
     * Whether the popup is shown: open, or still running its closing transition. Drives both the native
     * `hidden` (finding: a closed keep-mounted popup must hide itself) and — via `positioningActive` —
     * whether the inherited wrapper keeps tracking the anchor, so a closed keep-mounted positioner stops
     * its `autoUpdate` `requestAnimationFrame` loop (finding: endless rAF while closed).
     */
    protected readonly visible = computed(
        () => this.rootContext.isOpen() || this.rootContext.transitionStatus() === 'ending'
    );

    constructor() {
        super();
        // Gate the inherited positioning on visibility (see `visible`) — pauses `autoUpdate` while the
        // menu is closed but kept mounted.
        this.positioningActive = this.visible;

        const injector = inject(Injector);
        const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        // After the structural portal has relocated this positioner into the portal container, set up the
        // modal internal backdrop (finding #1) as a sibling before it.
        afterNextRender(() => setupMenuInternalBackdrop(host, this.rootContext, injector));
    }
}
