import { DestroyRef, effect, Injector } from '@angular/core';
import { RdxMenuRootContext } from './menu-root';

/** Marker attribute on the imperatively-created internal backdrop element. */
export const MENU_INTERNAL_BACKDROP_ATTR = 'data-rdx-menu-internal-backdrop';

/** Base UI's clip-path that cuts a rectangular hole at `rect` out of a full-viewport element. */
function cutoutClipPath(rect: DOMRect): string {
    return (
        `polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,` +
        `${rect.left}px ${rect.top}px,${rect.left}px ${rect.bottom}px,` +
        `${rect.right}px ${rect.bottom}px,${rect.right}px ${rect.top}px,${rect.left}px ${rect.top}px)`
    );
}

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
 * Renders Base UI's **internal backdrop** for a modal menu (finding #1): a full-viewport element that
 * intercepts background pointer events (so the page behind a modal Menu / Context Menu / Menubar menu is
 * non-interactive) **and** is itself the outside-press target — clicking it closes the menu. This is why
 * a plain `inert` pass on outside elements is not enough: an inert element dispatches no pointer event,
 * so the menu could never close on an outside click. A clip-path cutout keeps the trigger (or the whole
 * menubar) clickable. Mirrors `MenuPositioner.tsx` — not rendered for submenus or hover-opened menus.
 *
 * Inserted as a **sibling before the positioner** (a sibling, not a child: a `position: fixed` element
 * inside the transformed positioner would be clipped to the positioner's box, not the viewport). The
 * positioner's own stacking (its `z-index`) keeps the popup above the backdrop.
 */
export function setupMenuInternalBackdrop(
    positioner: HTMLElement,
    rootContext: RdxMenuRootContext,
    injector: Injector
): void {
    const ownerDocument = positioner.ownerDocument;
    let backdrop: HTMLElement | null = null;

    const remove = (): void => {
        backdrop?.remove();
        backdrop = null;
    };

    const shouldRender = (): boolean => {
        const type = rootContext.parentType();
        if (type === 'menu' || !rootContext.modal()) {
            return false; // submenus and non-modal menus get no backdrop
        }
        if (type === 'menubar') {
            return true; // a modal menubar menu always gets one (even on hover-switch)
        }
        // standalone / context menu: suppressed for a hover-open (Base UI excludes `triggerHover`).
        return rootContext.lastOpenChangeReason() !== 'trigger-hover';
    };

    const ref = effect(
        () => {
            const open = rootContext.isOpen();
            const render = shouldRender();

            if (render && !backdrop) {
                backdrop = ownerDocument.createElement('div');
                backdrop.setAttribute('role', 'presentation');
                backdrop.setAttribute(MENU_INTERNAL_BACKDROP_ATTR, '');
                backdrop.style.position = 'fixed';
                backdrop.style.inset = '0px';
                backdrop.style.userSelect = 'none';
                backdrop.style.webkitUserSelect = 'none';

                const cutout = cutoutElement(rootContext);
                if (cutout) {
                    backdrop.style.clipPath = cutoutClipPath(cutout.getBoundingClientRect());
                }

                positioner.parentElement?.insertBefore(backdrop, positioner);
            } else if (!render) {
                remove();
            }

            if (backdrop) {
                // Clickable (the outside-press target) while open; inert during the closed-but-mounted
                // exit window so a stray click on the fading backdrop can't fire.
                if (open) {
                    backdrop.removeAttribute('inert');
                } else {
                    backdrop.setAttribute('inert', '');
                }
            }
        },
        { injector }
    );

    injector.get(DestroyRef).onDestroy(() => {
        ref.destroy();
        remove();
    });
}
