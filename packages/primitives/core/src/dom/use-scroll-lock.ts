import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, effect, inject, PLATFORM_ID, signal, Signal } from '@angular/core';

/** Marker attribute set on `<html>` while scroll is locked (a strategy-independent test/CSS hook). */
export const RDX_SCROLL_LOCKED_ATTR = 'data-rdx-scroll-locked';

// ── Small DOM / platform helpers (inlined — we deliberately do NOT depend on `@floating-ui/utils`) ──

/**
 * Floating UI's `isOverflowElement`: whether `element` is itself a scroll container (its computed
 * overflow is anything other than `visible`). Used to decide whether `<html>` or `<body>` is the page
 * scroller — a site may set `overflow-y: scroll` on `<html>` (as Storybook does), in which case a lock
 * on `<body>` alone has no effect.
 */
function isOverflowElement(element: Element): boolean {
    const win = element.ownerDocument.defaultView;
    if (!win) {
        return false;
    }
    const { overflow, overflowX, overflowY, display } = win.getComputedStyle(element);
    return (
        /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) &&
        !['inline', 'contents'].includes(display)
    );
}

/**
 * WebKit (Safari / any iOS browser) UA check — needs the `Safari` token and excludes desktop Blink
 * (Chrome / Edge / Android), so jsdom (`AppleWebKit … jsdom`, no `Safari`) is correctly **not** WebKit.
 * Mirrors the same helper in the dismissal capability; only WebKit needs the pinch-zoom bail-out.
 */
function isWebKit(win: Window): boolean {
    const ua = win.navigator.userAgent;
    return /AppleWebKit/i.test(ua) && /Safari/i.test(ua) && !/Chrome|Chromium|Edg|Android/i.test(ua);
}

/** iOS / iPadOS detection (iPadOS 13+ reports as Mac, so also accept touch-capable `MacIntel`). */
function isIOS(win: Window): boolean {
    const nav = win.navigator;
    return /iP(ad|hone|od)/.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
}

/** Whether the document currently has **inset** (space-consuming) scrollbars rather than overlay ones. */
function hasInsetScrollbars(doc: Document): boolean {
    const win = doc.defaultView;
    return win ? win.innerWidth - doc.documentElement.clientWidth > 0 : false;
}

/**
 * Feature-detects `scrollbar-gutter: stable` by measuring whether toggling overflow shifts the scroller's
 * box. When supported, the lock can reserve the gutter with `scrollbar-gutter: stable` instead of the
 * `body { position: relative; width: calc(...) }` compensation. Restores everything it touches.
 */
function supportsStableScrollbarGutter(doc: Document): boolean {
    const win = doc.defaultView;
    if (!win || typeof CSS === 'undefined' || !CSS.supports || !CSS.supports('scrollbar-gutter', 'stable')) {
        return false;
    }
    const html = doc.documentElement;
    const scrollContainer = isOverflowElement(html) ? html : doc.body;

    const originalOverflowY = scrollContainer.style.overflowY;
    const originalGutter = html.style.scrollbarGutter;

    html.style.scrollbarGutter = 'stable';
    scrollContainer.style.overflowY = 'scroll';
    const before = scrollContainer.offsetWidth;
    scrollContainer.style.overflowY = 'hidden';
    const after = scrollContainer.offsetWidth;

    scrollContainer.style.overflowY = originalOverflowY;
    html.style.scrollbarGutter = originalGutter;

    return before === after;
}

// ── The two Base UI locking strategies (each returns its own restore callback) ──

/**
 * Overlay-scrollbar strategy (iOS, or any document without inset scrollbars): scrollbars float over the
 * content and take no layout space, so a plain `overflow: hidden` on the scroller suffices — no gutter
 * compensation, no scroll-position juggling needed.
 */
function preventScrollOverlayScrollbars(doc: Document): () => void {
    const html = doc.documentElement;
    const elementToLock = isOverflowElement(html) ? html : doc.body;
    const original = {
        overflowX: elementToLock.style.overflowX,
        overflowY: elementToLock.style.overflowY
    };

    elementToLock.style.overflowX = 'hidden';
    elementToLock.style.overflowY = 'hidden';

    return () => {
        elementToLock.style.overflowX = original.overflowX;
        elementToLock.style.overflowY = original.overflowY;
    };
}

/**
 * Inset-scrollbar strategy (desktop with space-consuming scrollbars). Faithful port of Base UI's
 * `preventScrollInsetScrollbars`: preserves the scroll position by parking it on `<body>` (made
 * `position: relative` with a viewport-sized box), reserves the scrollbar gutter (via
 * `scrollbar-gutter: stable` when supported, else a `width/height: calc(...)` compensation) so nothing
 * shifts, bails out entirely during a Safari pinch-zoom, and re-locks on resize. All snapshot state is
 * **closure-local** (not module-global as in Base UI), so concurrent locks in different documents never
 * clobber each other's saved styles.
 */
function preventScrollInsetScrollbars(doc: Document): () => void {
    const html = doc.documentElement;
    const body = doc.body;
    const win = doc.defaultView;
    if (!win) {
        return () => {};
    }

    // Pinch-zoom in Safari causes a shift — just don't lock while zoomed.
    if (isWebKit(win) && (win.visualViewport?.scale ?? 1) !== 1) {
        return () => {};
    }

    let scrollTop = 0;
    let scrollLeft = 0;
    let updateGutterOnly = false;
    let originalHtmlStyles: Partial<CSSStyleDeclaration> = {};
    let originalBodyStyles: Partial<CSSStyleDeclaration> = {};
    let originalHtmlScrollBehavior = '';
    let resizeFrame = 0;

    const lockScroll = (): void => {
        // ─── DOM reads ───
        const htmlStyles = win.getComputedStyle(html);
        const bodyStyles = win.getComputedStyle(body);
        const hasBothEdges = (htmlStyles.scrollbarGutter || '').includes('both-edges');
        const scrollbarGutterValue = hasBothEdges ? 'stable both-edges' : 'stable';

        scrollTop = html.scrollTop;
        scrollLeft = html.scrollLeft;

        originalHtmlStyles = {
            scrollbarGutter: html.style.scrollbarGutter,
            overflowY: html.style.overflowY,
            overflowX: html.style.overflowX
        };
        originalHtmlScrollBehavior = html.style.scrollBehavior;
        originalBodyStyles = {
            position: body.style.position,
            height: body.style.height,
            width: body.style.width,
            boxSizing: body.style.boxSizing,
            overflowY: body.style.overflowY,
            overflowX: body.style.overflowX,
            scrollBehavior: body.style.scrollBehavior
        };

        const isScrollableY = html.scrollHeight > html.clientHeight;
        const isScrollableX = html.scrollWidth > html.clientWidth;
        const hasConstantOverflowY = htmlStyles.overflowY === 'scroll' || bodyStyles.overflowY === 'scroll';
        const hasConstantOverflowX = htmlStyles.overflowX === 'scroll' || bodyStyles.overflowX === 'scroll';

        // Scrollbar size (negative in Firefox, so clamp). Compensated below so nothing shifts.
        const scrollbarWidth = Math.max(0, win.innerWidth - body.clientWidth);
        const scrollbarHeight = Math.max(0, win.innerHeight - body.clientHeight);
        const marginY = (parseFloat(bodyStyles.marginTop) || 0) + (parseFloat(bodyStyles.marginBottom) || 0);
        const marginX = (parseFloat(bodyStyles.marginLeft) || 0) + (parseFloat(bodyStyles.marginRight) || 0);
        const elementToLock = isOverflowElement(html) ? html : body;

        updateGutterOnly = supportsStableScrollbarGutter(doc);

        // ─── DOM writes (do not read the DOM past here) ───
        if (updateGutterOnly) {
            html.style.scrollbarGutter = scrollbarGutterValue;
            elementToLock.style.overflowY = 'hidden';
            elementToLock.style.overflowX = 'hidden';
            return;
        }

        Object.assign(html.style, {
            scrollbarGutter: scrollbarGutterValue,
            overflowY: 'hidden',
            overflowX: 'hidden'
        });
        if (isScrollableY || hasConstantOverflowY) {
            html.style.overflowY = 'scroll';
        }
        if (isScrollableX || hasConstantOverflowX) {
            html.style.overflowX = 'scroll';
        }

        Object.assign(body.style, {
            position: 'relative',
            height: marginY || scrollbarHeight ? `calc(100dvh - ${marginY + scrollbarHeight}px)` : '100dvh',
            width: marginX || scrollbarWidth ? `calc(100vw - ${marginX + scrollbarWidth}px)` : '100vw',
            boxSizing: 'border-box',
            // Set the long-hands (not the `overflow` short-hand) so the snapshot — which captures
            // `overflowY`/`overflowX` — restores symmetrically (a short-hand here would leave a stale
            // `overflow` declaration when only the long-hands are reset).
            overflowY: 'hidden',
            overflowX: 'hidden',
            scrollBehavior: 'unset'
        });
        body.scrollTop = scrollTop;
        body.scrollLeft = scrollLeft;
        html.style.scrollBehavior = 'unset';
    };

    const cleanup = (): void => {
        Object.assign(html.style, originalHtmlStyles);
        Object.assign(body.style, originalBodyStyles);
        if (!updateGutterOnly) {
            html.scrollTop = scrollTop;
            html.scrollLeft = scrollLeft;
            html.style.scrollBehavior = originalHtmlScrollBehavior;
        }
    };

    const handleResize = (): void => {
        cleanup();
        resizeFrame = win.requestAnimationFrame(lockScroll);
    };

    lockScroll();
    win.addEventListener('resize', handleResize);

    return () => {
        if (resizeFrame) {
            win.cancelAnimationFrame(resizeFrame);
        }
        cleanup();
        win.removeEventListener('resize', handleResize);
    };
}

/**
 * Per-`Document` scroll-lock owner — the Angular counterpart of Base UI's `ScrollLocker`, but with **all**
 * mutable state on the instance (Base UI keeps the style snapshots at module scope, which is unsafe across
 * documents). Ref-counts concurrent locks so nested / sibling overlays compose: the first lock applies a
 * strategy, the last release restores it. Keyed per `Document` (the {@link lockers} WeakMap) so an iframe's
 * lock never corrupts the parent document's saved styles.
 */
class ScrollLocker {
    private lockCount = 0;
    private restore: (() => void) | null = null;

    constructor(private readonly doc: Document) {}

    /** Increments the lock count, applying the lock on the `0 → 1` edge. Returns this lock's release. */
    acquire(): () => void {
        this.lockCount += 1;
        if (this.lockCount === 1 && this.restore === null) {
            this.lock();
        }
        return this.release;
    }

    private readonly release = (): void => {
        if (this.lockCount === 0) {
            return;
        }
        this.lockCount -= 1;
        if (this.lockCount === 0 && this.restore) {
            this.restore();
            this.restore = null;
        }
    };

    private lock(): void {
        const html = this.doc.documentElement;
        const win = this.doc.defaultView;
        const htmlOverflowY = win ? win.getComputedStyle(html).overflowY : '';

        // If the site author already hid overflow on `<html>`, respect it and apply no strategy.
        if (htmlOverflowY === 'hidden' || htmlOverflowY === 'clip') {
            this.restore = () => undefined;
        } else {
            const hasOverlayScrollbars = (win ? isIOS(win) : false) || !hasInsetScrollbars(this.doc);
            const strategyRestore = hasOverlayScrollbars
                ? preventScrollOverlayScrollbars(this.doc)
                : preventScrollInsetScrollbars(this.doc);
            this.restore = strategyRestore;
        }

        // Strategy-independent marker (set even when respecting author overflow, so the lock is observable).
        html.setAttribute(RDX_SCROLL_LOCKED_ATTR, '');
        const strategyRestore = this.restore;
        this.restore = () => {
            strategyRestore();
            html.removeAttribute(RDX_SCROLL_LOCKED_ATTR);
        };
    }
}

const lockers = new WeakMap<Document, ScrollLocker>();

function getLocker(doc: Document): ScrollLocker {
    let locker = lockers.get(doc);
    if (!locker) {
        locker = new ScrollLocker(doc);
        lockers.set(doc, locker);
    }
    return locker;
}

/**
 * Locks page scrolling while `active()` is `true`, restoring the original state when it becomes `false`
 * or the calling context is destroyed.
 *
 * This is the full Base UI `useScrollLock` behavioral set (ADR 0016 §1): it picks the **overlay** strategy
 * (plain `overflow: hidden`) for iOS / overlay-scrollbar documents and the **inset** strategy for desktop
 * scrollbars — the latter preserves the scroll position, reserves the scrollbar gutter (no content shift),
 * bails out during a Safari pinch-zoom, and re-locks on resize. Locks compose across all callers in the
 * same document via a shared per-`Document` ref count, and state is isolated per `Document` (iframe-safe).
 * No-op on the server. Must be called in an injection context.
 */
export function useScrollLock(active: Signal<boolean>): void {
    const document = inject(DOCUMENT);
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    let release: (() => void) | null = null;

    effect(() => {
        if (!isBrowser) {
            return;
        }
        if (active() && !release) {
            release = getLocker(document).acquire();
        } else if (!active() && release) {
            release();
            release = null;
        }
    });

    // Only register the DOM unlock on the browser — on the server `release` is never set.
    if (isBrowser) {
        inject(DestroyRef).onDestroy(() => {
            release?.();
            release = null;
        });
    }
}

/**
 * A touch-opened anchored popup leaves up to this much total horizontal gutter and is still treated as
 * effectively full-width (Base UI `VIEWPORT_WIDTH_TOLERANCE_PX`): common ~10px side padding still locks,
 * since that leaves too little outside space for a reliable swipe-to-dismiss.
 */
const VIEWPORT_WIDTH_TOLERANCE_PX = 20;

/** Options for {@link useAnchoredScrollLock}. */
export interface RdxAnchoredScrollLockOptions {
    /** Whether the popup was opened by **touch** — the near-fullscreen gate applies only then. */
    touchOpen: () => boolean;
    /** The popup / positioner element whose width decides the touch gate (measured vs the viewport). */
    element: () => HTMLElement | null;
}

/**
 * Scroll lock for an **anchored** popup (Base UI `useAnchoredPopupScrollLock`, ADR 0016 §3). For a
 * non-touch open it behaves exactly like {@link useScrollLock} (locks while `enabled()`). For a **touch**
 * open it locks **only** when the popup is effectively viewport-width (`popupWidth >= viewportWidth -
 * 20px`) — otherwise the page stays scrollable so the user can swipe outside to dismiss the popup. The
 * width is measured off `element()`; reading `offsetWidth` forces layout, so it is accurate even before
 * the popup is positioned (visibility does not affect layout). Must be called in an injection context.
 */
export function useAnchoredScrollLock(enabled: Signal<boolean>, options: RdxAnchoredScrollLockOptions): void {
    const touchOpenShouldLock = signal(false);

    effect(() => {
        const element = options.element();
        if (!enabled() || !options.touchOpen() || !element) {
            touchOpenShouldLock.set(false);
            return;
        }
        const viewportWidth = element.ownerDocument.documentElement.clientWidth;
        const popupWidth = element.offsetWidth;
        touchOpenShouldLock.set(
            viewportWidth > 0 && popupWidth > 0 && popupWidth >= viewportWidth - VIEWPORT_WIDTH_TOLERANCE_PX
        );
    });

    useScrollLock(computed(() => enabled() && (!options.touchOpen() || touchOpenShouldLock())));
}
