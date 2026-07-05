import { Injector } from '@angular/core';
import { setupInternalBackdrop } from '@radix-ng/primitives/core';
import { RdxMenuRootContext } from './menu-root';

/** Marker attribute on the menu's internal backdrop element. */
export const MENU_INTERNAL_BACKDROP_ATTR = 'data-rdx-menu-internal-backdrop';

/** The element that stays interactive through the backdrop (Base UI `backdropCutout`). */
function cutoutElement(rootContext: RdxMenuRootContext): HTMLElement | null {
    const type = rootContext.parentType();
    const trigger = rootContext.trigger() ?? null;
    if (type === 'menubar') {
        // Keep the whole menubar interactive so hover/click switching between its menus still works.
        return trigger?.closest<HTMLElement>('[rdxMenubarRoot]') ?? trigger;
    }
    if (type === 'context-menu') {
        return null; // right-click anywhere — no cutout
    }
    return trigger; // standalone dropdown — keep its trigger clickable (toggle-close)
}

/**
 * The menu's modal **internal backdrop** (finding #1) — a thin wrapper over the shared
 * {@link setupInternalBackdrop}. Rendered for a modal Menu / Context Menu / Menubar menu (Base UI
 * `MenuPositioner.tsx`): never for a submenu, and not for a hover-opened dropdown / context menu.
 */
export function setupMenuInternalBackdrop(
    positioner: HTMLElement,
    rootContext: RdxMenuRootContext,
    injector: Injector
): void {
    setupInternalBackdrop(positioner, injector, {
        marker: MENU_INTERNAL_BACKDROP_ATTR,
        isOpen: () => rootContext.isOpen(),
        cutout: () => cutoutElement(rootContext),
        shouldRender: () => {
            // The backdrop must exist only while the menu is present (open or running its exit
            // animation), never while idle-closed. This matters for a `keepMounted` menu: its
            // positioner stays in the DOM while closed, so without this gate the shared backdrop
            // helper — which creates the element on `shouldRender()` alone — would build it at page
            // load and capture a stale cutout rect (the trigger's off-screen position), then never
            // refresh it. On open the stale backdrop would cover the trigger, and the trigger
            // `mouseup` would land on the backdrop and immediately close the menu (`cancel-open`).
            if (!rootContext.present()) {
                return false;
            }
            const type = rootContext.parentType();
            if (type === 'menu' || !rootContext.modal()) {
                return false; // submenus and non-modal menus get no backdrop
            }
            if (type === 'menubar') {
                return true; // a modal menubar menu always gets one (even on hover-switch)
            }
            // standalone / context menu: suppressed for a hover-open (Base UI excludes `triggerHover`).
            return rootContext.lastOpenChangeReason() !== 'trigger-hover';
        }
    });
}
