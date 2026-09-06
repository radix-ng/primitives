/** The modifier keys carried over from the originating event. */
export interface RdxModifierState {
    readonly shiftKey: boolean;
    readonly ctrlKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
}

/**
 * Dispatches a synthetic `click` on `target` that keeps the modifiers of the event it stands in for.
 *
 * `element.click()` is not enough for a click synthesized from another gesture: it drops
 * Shift/Ctrl/Alt/Meta — so a modified activation of a link would navigate the wrong way — and reports
 * `detail === 0`, which reads as a keyboard activation. Pass `detail: 1` for a pointer-driven gesture
 * (Base UI `dispatchClickWithModifiers`).
 */
export function dispatchClickWithModifiers(
    target: Element,
    sourceEvent: RdxModifierState,
    { detail = 0 }: { detail?: number } = {}
): void {
    const win = target.ownerDocument.defaultView ?? window;
    // A `PointerEvent` so handlers reading `pointerType` still see a pointer-shaped click; jsdom does
    // not implement it, so the unit environment falls back to a plain `MouseEvent`.
    const ClickEvent = win.PointerEvent ?? win.MouseEvent;
    target.dispatchEvent(
        new ClickEvent('click', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail,
            shiftKey: sourceEvent.shiftKey,
            ctrlKey: sourceEvent.ctrlKey,
            altKey: sourceEvent.altKey,
            metaKey: sourceEvent.metaKey
        })
    );
}
