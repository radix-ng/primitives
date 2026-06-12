import { ElementRef } from '@angular/core';

/**
 * A target container for a portal. Accepts an `ElementRef`, a native element, or a CSS selector
 * resolved against the document.
 */
export type RdxPortalContainer = ElementRef<HTMLElement> | HTMLElement | string;

/**
 * Resolve a {@link RdxPortalContainer} to a concrete element. Returns `null` when nothing usable is
 * provided (a missing container, a selector matching nothing, or a non-element value), so callers can
 * fall back to `document.body`. Shared by `RdxPortal` and `RdxPortalPresence`.
 */
export function resolvePortalContainer(
    container: RdxPortalContainer | undefined,
    document: Document | null
): HTMLElement | null {
    if (!container) {
        return null;
    }
    if (typeof container === 'string') {
        return document?.querySelector<HTMLElement>(container) ?? null;
    }
    if (container instanceof ElementRef) {
        return container.nativeElement ?? null;
    }
    // Anything that isn't a real element (e.g. a TemplateRef passed by mistake) falls back to the
    // default container so the content still leaves the flow instead of staying in place.
    return container instanceof HTMLElement ? container : null;
}
