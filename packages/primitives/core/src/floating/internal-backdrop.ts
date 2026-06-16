import { DestroyRef, effect, Injector } from '@angular/core';

/** Default marker attribute on the imperatively-created internal backdrop element. */
export const RDX_INTERNAL_BACKDROP_ATTR = 'data-rdx-internal-backdrop';

/** Base UI's clip-path that cuts a rectangular hole at `rect` out of a full-viewport element. */
function cutoutClipPath(rect: DOMRect): string {
    return (
        `polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,` +
        `${rect.left}px ${rect.top}px,${rect.left}px ${rect.bottom}px,` +
        `${rect.right}px ${rect.bottom}px,${rect.right}px ${rect.top}px,${rect.left}px ${rect.top}px)`
    );
}

export interface RdxInternalBackdropOptions {
    /** Whether the backdrop should exist (modal && reason-appropriate). Reactive — read in an effect. */
    shouldRender: () => boolean;
    /** Whether the popup is open. Reactive — drives `inert` during the closed-but-mounted exit window. */
    isOpen: () => boolean;
    /**
     * The element to keep interactive through a clip-path "cutout" (e.g. the trigger, so a toggle-close
     * click still reaches it), or `null` for a full backdrop. Read once when the backdrop is created.
     */
    cutout?: () => Element | null;
    /** Marker attribute applied to the backdrop. Defaults to {@link RDX_INTERNAL_BACKDROP_ATTR}. */
    marker?: string;
    /** Let pointer/wheel events pass through the backdrop while keeping it mounted for lifecycle parity. */
    passThrough?: () => boolean;
}

/**
 * Renders Base UI's **internal backdrop** for a modal floating popup: a full-viewport element that
 * intercepts background pointer events (so the page behind the popup is non-interactive) **and** is
 * itself the outside-press target — clicking it lets the dismissal capability close the popup. This is
 * why a plain `inert` pass on outside elements is not enough: an inert element dispatches no pointer
 * event, so the popup could never close on an outside click. An optional clip-path cutout keeps the
 * trigger (or another region) clickable.
 *
 * Inserted as a **sibling before the positioner** — a sibling, not a child: a `position: fixed` element
 * inside a transformed positioner would be clipped to the positioner's box, not the viewport. The
 * positioner's own stacking (its `z-index`) keeps the popup above the backdrop.
 *
 * Call from the positioner directive inside `afterNextRender` (so the structural portal has already
 * relocated the positioner into its container).
 */
export function setupInternalBackdrop(
    positioner: HTMLElement,
    injector: Injector,
    options: RdxInternalBackdropOptions
): void {
    const ownerDocument = positioner.ownerDocument;
    const marker = options.marker ?? RDX_INTERNAL_BACKDROP_ATTR;
    let backdrop: HTMLElement | null = null;

    const remove = (): void => {
        backdrop?.remove();
        backdrop = null;
    };

    const ref = effect(
        () => {
            const open = options.isOpen();
            const render = options.shouldRender();

            if (render && !backdrop) {
                backdrop = ownerDocument.createElement('div');
                backdrop.setAttribute('role', 'presentation');
                backdrop.setAttribute(marker, '');
                backdrop.style.position = 'fixed';
                backdrop.style.inset = '0px';
                backdrop.style.userSelect = 'none';
                backdrop.style.webkitUserSelect = 'none';

                const cutout = options.cutout?.() ?? null;
                if (cutout) {
                    backdrop.style.clipPath = cutoutClipPath(cutout.getBoundingClientRect());
                }

                positioner.parentElement?.insertBefore(backdrop, positioner);
            } else if (!render) {
                remove();
            }

            if (backdrop) {
                backdrop.style.pointerEvents = options.passThrough?.() ? 'none' : '';

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
