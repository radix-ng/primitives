/**
 * Submenu "safe polygon" — a faithful port of Floating UI's `safePolygon` algorithm
 * (https://floating-ui.com/docs/useHover#safepolygon), adapted to this library.
 *
 * While a submenu is open by hover, the parent submenu owns the decision to close itself: a
 * document-level `mousemove` handler keeps it open as long as the cursor is heading toward the
 * popup inside a safe quadrilateral (built from the cursor's exit point and the popup rect), and
 * closes it once the cursor leaves that area. Combined with the pointer-events "tunnel" below
 * (`applyPointerTunnel`), siblings cannot steal the open submenu during a diagonal traversal.
 *
 * Differences from the upstream implementation:
 * - `elements.domReference` / `elements.floating` → `reference` / `floating` (plain elements).
 * - `placement.split('-')[0]` → the `side` option (read live from the popup's `data-side`).
 * - the Floating UI tree (`tree` / `nodeId`) → the `hasOpenChild` callback, backed by the
 *   module-level open-submenu registry.
 *
 * This deliberately does NOT reuse the core `useGraceArea` composable (tooltip / navigation-menu /
 * popover): that one is a simpler convex-hull grace area with no velocity gating, trough handling, or
 * pointer-events tunnel — none of which it needs, but all of which the submenu does to match Base UI
 * and to stop sibling triggers from stealing the open submenu mid-traversal.
 */

export type MenuSide = 'top' | 'bottom' | 'left' | 'right';

const CURSOR_SPEED_THRESHOLD = 0.1;
const CURSOR_SPEED_THRESHOLD_SQUARED = CURSOR_SPEED_THRESHOLD * CURSOR_SPEED_THRESHOLD;
const POLYGON_BUFFER = 0.5;
/** Re-check delay when the cursor is inside the polygon but has not landed on the popup yet. */
const REST_CHECK_MS = 40;

export interface SafePolygonOptions {
    /** The submenu trigger (Floating UI's reference element). */
    reference: HTMLElement;
    /** The submenu popup (Floating UI's floating element). */
    floating: HTMLElement;
    /**
     * Placed side of the popup relative to the trigger, read live on every move. Floating UI
     * resolves placement asynchronously (and may flip it on collision), so this must be a getter,
     * not a value captured at open time — otherwise left/top/bottom submenus get right-side geometry.
     */
    side: () => MenuSide;
    /** Cursor X at the moment it left the trigger. */
    x: number;
    /** Cursor Y at the moment it left the trigger. */
    y: number;
    /** Close the submenu (callers apply their own close delay). */
    onClose: () => void;
    /** Cancel a pending close — called on every move that decides to stay open. */
    cancelClose: () => void;
    /** Whether a descendant submenu is open; if so, never close (mirrors Floating UI's tree check). */
    hasOpenChild: () => boolean;
    /** Called the first time the cursor reaches the popup, so the caller can drop the tunnel. */
    onLanded?: () => void;
}

function hasIntersectingEdge(pointX: number, pointY: number, xi: number, yi: number, xj: number, yj: number): boolean {
    return yi >= pointY !== yj >= pointY && pointX <= ((xj - xi) * (pointY - yi)) / (yj - yi) + xi;
}

export function isPointInQuadrilateral(
    pointX: number,
    pointY: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
): boolean {
    let inside = false;
    if (hasIntersectingEdge(pointX, pointY, x1, y1, x2, y2)) inside = !inside;
    if (hasIntersectingEdge(pointX, pointY, x2, y2, x3, y3)) inside = !inside;
    if (hasIntersectingEdge(pointX, pointY, x3, y3, x4, y4)) inside = !inside;
    if (hasIntersectingEdge(pointX, pointY, x4, y4, x1, y1)) inside = !inside;
    return inside;
}

function isInsideRect(pointX: number, pointY: number, rect: DOMRect): boolean {
    return pointX >= rect.left && pointX <= rect.right && pointY >= rect.top && pointY <= rect.bottom;
}

function isInsideAxisAlignedRect(
    pointX: number,
    pointY: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
): boolean {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return pointX >= minX && pointX <= maxX && pointY >= minY && pointY <= maxY;
}

function getTarget(event: MouseEvent): Element | null {
    const path = event.composedPath?.();
    return (path?.[0] as Element | undefined) ?? (event.target as Element | null);
}

export interface SafePolygonHandler {
    /** Attach to `document.addEventListener('mousemove', …)`. */
    handler: (event: MouseEvent) => void;
    /** Clear any pending internal timer; call from the listener's teardown. */
    dispose: () => void;
}

/**
 * Builds the `mousemove` handler that decides whether the open submenu should stay open, plus a
 * `dispose()` that clears its internal rest-check timer (so a pending close can't fire after the
 * listener is removed).
 */
export function createSafePolygonHandler(options: SafePolygonOptions): SafePolygonHandler {
    const { reference, floating, side: sideOf, x, y, onClose, cancelClose, hasOpenChild, onLanded } = options;

    let hasLanded = false;
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastCursorTime = typeof performance !== 'undefined' ? performance.now() : 0;
    let restTimer: ReturnType<typeof setTimeout> | undefined;

    function isCursorMovingSlowly(nextX: number, nextY: number): boolean {
        const currentTime = typeof performance !== 'undefined' ? performance.now() : 0;
        const elapsedTime = currentTime - lastCursorTime;

        if (lastX === null || lastY === null || elapsedTime === 0) {
            lastX = nextX;
            lastY = nextY;
            lastCursorTime = currentTime;
            return false;
        }

        const deltaX = nextX - lastX;
        const deltaY = nextY - lastY;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        const thresholdSquared = elapsedTime * elapsedTime * CURSOR_SPEED_THRESHOLD_SQUARED;

        lastX = nextX;
        lastY = nextY;
        lastCursorTime = currentTime;

        return distanceSquared < thresholdSquared;
    }

    function closeIfNoOpenChild(): void {
        if (!hasOpenChild()) {
            onClose();
        }
    }

    function onMouseMove(event: MouseEvent): void {
        cancelClose();
        clearTimeout(restTimer);

        const { clientX, clientY } = event;
        const target = getTarget(event);
        const isOverFloatingEl = !!target && floating.contains(target);
        const isOverReferenceEl = !!target && reference.contains(target);

        // This handler is bound only to document `mousemove` (never `mouseleave`), so Floating UI's
        // leave-specific paths — the overlapping-element `relatedTarget` guard and the `!isLeave`
        // guards — are omitted: they could never run here.

        if (isOverFloatingEl) {
            // "Landed" tracks reaching the popup only — not the trigger. Setting it on the trigger
            // would close as soon as the cursor enters the gap (no leave event resets it).
            if (!hasLanded) {
                hasLanded = true;
                onLanded?.();
            }
            return;
        }

        if (isOverReferenceEl) {
            // Over the trigger — stay open; the polygon/trough logic resumes once in the gap.
            return;
        }

        // If any nested child submenu is open, never close the parent.
        if (hasOpenChild()) return;

        // Read the placed side live — it may have been unresolved at open time, or flipped since.
        const side = sideOf();
        const refRect = reference.getBoundingClientRect();
        const rect = floating.getBoundingClientRect();
        const cursorLeaveFromRight = x > rect.right - rect.width / 2;
        const cursorLeaveFromBottom = y > rect.bottom - rect.height / 2;
        const isFloatingWider = rect.width > refRect.width;
        const isFloatingTaller = rect.height > refRect.height;
        const left = (isFloatingWider ? refRect : rect).left;
        const right = (isFloatingWider ? refRect : rect).right;
        const top = (isFloatingTaller ? refRect : rect).top;
        const bottom = (isFloatingTaller ? refRect : rect).bottom;

        // Leaving from the opposite side: the buffer logic would otherwise keep it open — close.
        if (
            (side === 'top' && y >= refRect.bottom - 1) ||
            (side === 'bottom' && y <= refRect.top + 1) ||
            (side === 'left' && x >= refRect.right - 1) ||
            (side === 'right' && x <= refRect.left + 1)
        ) {
            closeIfNoOpenChild();
            return;
        }

        // Stay open while the cursor is within the rectangular trough between the two elements.
        let isInsideTroughRect = false;
        switch (side) {
            case 'top':
                isInsideTroughRect = isInsideAxisAlignedRect(
                    clientX,
                    clientY,
                    left,
                    refRect.top + 1,
                    right,
                    rect.bottom - 1
                );
                break;
            case 'bottom':
                isInsideTroughRect = isInsideAxisAlignedRect(
                    clientX,
                    clientY,
                    left,
                    rect.top + 1,
                    right,
                    refRect.bottom - 1
                );
                break;
            case 'left':
                isInsideTroughRect = isInsideAxisAlignedRect(
                    clientX,
                    clientY,
                    rect.right - 1,
                    bottom,
                    refRect.left + 1,
                    top
                );
                break;
            case 'right':
                isInsideTroughRect = isInsideAxisAlignedRect(
                    clientX,
                    clientY,
                    refRect.right - 1,
                    bottom,
                    rect.left + 1,
                    top
                );
                break;
        }
        if (isInsideTroughRect) return;

        if (hasLanded && !isInsideRect(clientX, clientY, refRect)) {
            closeIfNoOpenChild();
            return;
        }

        if (isCursorMovingSlowly(clientX, clientY)) {
            closeIfNoOpenChild();
            return;
        }

        let isInsidePolygon = false;
        switch (side) {
            case 'top': {
                const cursorXOffset = isFloatingWider ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4;
                const cursorPointOneX = isFloatingWider
                    ? x + cursorXOffset
                    : cursorLeaveFromRight
                      ? x + cursorXOffset
                      : x - cursorXOffset;
                const cursorPointTwoX = isFloatingWider
                    ? x - cursorXOffset
                    : cursorLeaveFromRight
                      ? x + cursorXOffset
                      : x - cursorXOffset;
                const cursorPointY = y + POLYGON_BUFFER + 1;
                const commonYLeft = cursorLeaveFromRight
                    ? rect.bottom - POLYGON_BUFFER
                    : isFloatingWider
                      ? rect.bottom - POLYGON_BUFFER
                      : rect.top;
                const commonYRight = cursorLeaveFromRight
                    ? isFloatingWider
                        ? rect.bottom - POLYGON_BUFFER
                        : rect.top
                    : rect.bottom - POLYGON_BUFFER;
                isInsidePolygon = isPointInQuadrilateral(
                    clientX,
                    clientY,
                    cursorPointOneX,
                    cursorPointY,
                    cursorPointTwoX,
                    cursorPointY,
                    rect.left,
                    commonYLeft,
                    rect.right,
                    commonYRight
                );
                break;
            }
            case 'bottom': {
                const cursorXOffset = isFloatingWider ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4;
                const cursorPointOneX = isFloatingWider
                    ? x + cursorXOffset
                    : cursorLeaveFromRight
                      ? x + cursorXOffset
                      : x - cursorXOffset;
                const cursorPointTwoX = isFloatingWider
                    ? x - cursorXOffset
                    : cursorLeaveFromRight
                      ? x + cursorXOffset
                      : x - cursorXOffset;
                const cursorPointY = y - POLYGON_BUFFER;
                const commonYLeft = cursorLeaveFromRight
                    ? rect.top + POLYGON_BUFFER
                    : isFloatingWider
                      ? rect.top + POLYGON_BUFFER
                      : rect.bottom;
                const commonYRight = cursorLeaveFromRight
                    ? isFloatingWider
                        ? rect.top + POLYGON_BUFFER
                        : rect.bottom
                    : rect.top + POLYGON_BUFFER;
                isInsidePolygon = isPointInQuadrilateral(
                    clientX,
                    clientY,
                    cursorPointOneX,
                    cursorPointY,
                    cursorPointTwoX,
                    cursorPointY,
                    rect.left,
                    commonYLeft,
                    rect.right,
                    commonYRight
                );
                break;
            }
            case 'left': {
                const cursorYOffset = isFloatingTaller ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4;
                const cursorPointOneY = isFloatingTaller
                    ? y + cursorYOffset
                    : cursorLeaveFromBottom
                      ? y + cursorYOffset
                      : y - cursorYOffset;
                const cursorPointTwoY = isFloatingTaller
                    ? y - cursorYOffset
                    : cursorLeaveFromBottom
                      ? y + cursorYOffset
                      : y - cursorYOffset;
                const cursorPointX = x + POLYGON_BUFFER + 1;
                const commonXTop = cursorLeaveFromBottom
                    ? rect.right - POLYGON_BUFFER
                    : isFloatingTaller
                      ? rect.right - POLYGON_BUFFER
                      : rect.left;
                const commonXBottom = cursorLeaveFromBottom
                    ? isFloatingTaller
                        ? rect.right - POLYGON_BUFFER
                        : rect.left
                    : rect.right - POLYGON_BUFFER;
                isInsidePolygon = isPointInQuadrilateral(
                    clientX,
                    clientY,
                    commonXTop,
                    rect.top,
                    commonXBottom,
                    rect.bottom,
                    cursorPointX,
                    cursorPointOneY,
                    cursorPointX,
                    cursorPointTwoY
                );
                break;
            }
            case 'right': {
                const cursorYOffset = isFloatingTaller ? POLYGON_BUFFER / 2 : POLYGON_BUFFER * 4;
                const cursorPointOneY = isFloatingTaller
                    ? y + cursorYOffset
                    : cursorLeaveFromBottom
                      ? y + cursorYOffset
                      : y - cursorYOffset;
                const cursorPointTwoY = isFloatingTaller
                    ? y - cursorYOffset
                    : cursorLeaveFromBottom
                      ? y + cursorYOffset
                      : y - cursorYOffset;
                const cursorPointX = x - POLYGON_BUFFER;
                const commonXTop = cursorLeaveFromBottom
                    ? rect.left + POLYGON_BUFFER
                    : isFloatingTaller
                      ? rect.left + POLYGON_BUFFER
                      : rect.right;
                const commonXBottom = cursorLeaveFromBottom
                    ? isFloatingTaller
                        ? rect.left + POLYGON_BUFFER
                        : rect.right
                    : rect.left + POLYGON_BUFFER;
                isInsidePolygon = isPointInQuadrilateral(
                    clientX,
                    clientY,
                    cursorPointX,
                    cursorPointOneY,
                    cursorPointX,
                    cursorPointTwoY,
                    commonXTop,
                    rect.top,
                    commonXBottom,
                    rect.bottom
                );
                break;
            }
        }

        if (!isInsidePolygon) {
            closeIfNoOpenChild();
        } else if (!hasLanded) {
            // Inside the polygon but not landed: if the cursor halts here (no further moves),
            // close shortly after so a stationary cursor in the gap doesn't keep it open.
            restTimer = setTimeout(closeIfNoOpenChild, REST_CHECK_MS);
        }
    }

    return { handler: onMouseMove, dispose: () => clearTimeout(restTimer) };
}

/**
 * Pointer-events "tunnel" used while a submenu opened by hover is being traversed. Disables pointer
 * events on `scope` (the parent popup or `document.body`) while keeping the `reference` and
 * `floating` interactive, so sibling items cannot react until the cursor lands or the submenu
 * closes. Returns a cleanup that restores the exact previous inline values.
 */
export function applyPointerTunnel(scope: HTMLElement, reference: HTMLElement, floating: HTMLElement): () => void {
    const saved: Array<[HTMLElement, string]> = [
        [scope, scope.style.pointerEvents],
        [reference, reference.style.pointerEvents],
        [floating, floating.style.pointerEvents]
    ];
    scope.style.pointerEvents = 'none';
    reference.style.pointerEvents = 'auto';
    floating.style.pointerEvents = 'auto';

    let cleaned = false;
    return () => {
        if (cleaned) return;
        cleaned = true;
        saved.forEach(([el, prev]) => (el.style.pointerEvents = prev));
    };
}

/** Registry of submenus currently open, keyed by their trigger element. */
const openSubmenus = new Map<HTMLElement, HTMLElement>();

/** Marks `trigger`'s submenu (with popup `popup`) as open. Returns a cleanup to unmark it. */
export function registerOpenSubmenu(trigger: HTMLElement, popup: HTMLElement): () => void {
    openSubmenus.set(trigger, popup);
    return () => {
        if (openSubmenus.get(trigger) === popup) {
            openSubmenus.delete(trigger);
        }
    };
}

/**
 * Whether any *other* open submenu is a descendant of `floating` (a nested child is open).
 *
 * Portal-safe: `RdxMenuPortal` only teleports a submenu's positioner/popup template, never the
 * sub-trigger (which stays in its parent popup), and a portaled popup carries its descendant
 * triggers with it — so `floating.contains(childTrigger)` holds whether or not portals are used.
 */
export function hasOpenChildSubmenu(reference: HTMLElement, floating: HTMLElement): boolean {
    for (const trigger of openSubmenus.keys()) {
        if (trigger !== reference && floating.contains(trigger)) {
            return true;
        }
    }
    return false;
}
