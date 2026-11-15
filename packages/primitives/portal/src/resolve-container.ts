import { ElementRef } from '@angular/core';
import { isHTMLElement, isShadowRoot } from '@radix-ng/primitives/core';

/**
 * A native portal destination, including a shadow tree or an HTML element from another window.
 */
export type RdxPortalTarget = HTMLElement | ShadowRoot;

/** A target or Angular ElementRef; selectors resolve in the declaring document. */
export type RdxPortalContainer = ElementRef<RdxPortalTarget> | RdxPortalTarget | string;

/**
 * Resolve a {@link RdxPortalContainer} to a concrete destination. Returns `null` when nothing usable is
 * provided (a missing container, a selector matching nothing, or a non-element value), so callers can
 * fall back to `document.body`. Shared by `RdxPortal` and `RdxPortalPresence`.
 */
export function resolvePortalContainer(
    container: RdxPortalContainer | undefined,
    document: Document | null
): RdxPortalTarget | null {
    if (!container) {
        return null;
    }
    const target =
        typeof container === 'string'
            ? document?.querySelector(container)
            : container instanceof ElementRef
              ? container.nativeElement
              : container;
    // Anything that isn't a real element (e.g. a TemplateRef passed by mistake) falls back to the
    // default container so the content still leaves the flow instead of staying in place.
    return isHTMLElement(target) || isShadowRoot(target) ? target : null;
}
