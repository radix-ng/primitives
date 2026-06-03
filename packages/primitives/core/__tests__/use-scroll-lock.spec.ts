// @vitest-environment jsdom
import { RDX_SCROLL_LOCKED_ATTR, useAnchoredScrollLock, useScrollLock } from '../src/dom/use-scroll-lock';
import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function resetScroller(doc: Document): void {
    const html = doc.documentElement;
    html.removeAttribute(RDX_SCROLL_LOCKED_ATTR);
    html.style.cssText = '';
    doc.body.style.cssText = '';
}

const locked = (doc: Document) => doc.documentElement.hasAttribute(RDX_SCROLL_LOCKED_ATTR);

describe('useScrollLock', () => {
    beforeEach(() => {
        TestBed.resetTestingModule();
        resetScroller(document);
    });

    afterEach(() => {
        resetScroller(document);
    });

    function configure(doc: Document): void {
        TestBed.configureTestingModule({
            providers: [
                { provide: DOCUMENT, useValue: doc },
                { provide: PLATFORM_ID, useValue: 'browser' }
            ]
        });
    }

    function lock(active: WritableSignal<boolean>): void {
        TestBed.runInInjectionContext(() => useScrollLock(active));
    }

    it('locks (marks + hides overflow) and restores the original inline styles', () => {
        configure(document);
        const html = document.documentElement;
        const body = document.body;
        // A page that already has some inline styles — the lock must restore them on release.
        body.style.overflowY = 'auto';

        const active = signal(false);
        lock(active);

        active.set(true);
        TestBed.tick();
        expect(locked(document)).toBe(true);
        // Inset strategy (jsdom reports inset scrollbars): the scroller's overflow is hidden and the body
        // is parked at `position: relative` (the scroll-position-preserving box).
        expect(html.style.overflowY).toBe('hidden');
        expect(body.style.overflowY).toBe('hidden');
        expect(body.style.position).toBe('relative');

        active.set(false);
        TestBed.tick();
        expect(locked(document)).toBe(false);
        // Round-trip: the lock's own styles are cleared and the author's `overflow-y: auto` is restored.
        expect(html.style.overflowY).toBe('');
        expect(body.style.position).toBe('');
        expect(body.style.overflowY).toBe('auto');
    });

    it('shares a per-document lock count across callers (nested overlays compose)', () => {
        configure(document);
        const a = signal(false);
        const b = signal(false);
        lock(a);
        lock(b);

        a.set(true);
        b.set(true);
        TestBed.tick();
        expect(locked(document)).toBe(true);

        // Releasing one lock keeps the page locked while the other is still active.
        a.set(false);
        TestBed.tick();
        expect(locked(document)).toBe(true);

        b.set(false);
        TestBed.tick();
        expect(locked(document)).toBe(false);
    });

    it('isolates lock state per document — an iframe lock does not corrupt the main document', () => {
        const otherDoc = document.implementation.createHTMLDocument('iframe');
        configure(otherDoc);
        const active = signal(false);
        lock(active);

        active.set(true);
        TestBed.tick();

        // The other document is locked...
        expect(locked(otherDoc)).toBe(true);
        // ...while the main document's scroller is untouched (separate per-Document locker / WeakMap).
        expect(locked(document)).toBe(false);
        expect(document.body.style.overflow).toBe('');
    });

    it('locks the reference element ownerDocument when a reference is provided', () => {
        const otherDoc = document.implementation.createHTMLDocument('dialog');
        configure(document);
        const popup = otherDoc.createElement('div');
        const active = signal(true);

        TestBed.runInInjectionContext(() => useScrollLock(active, { referenceElement: () => popup }));
        TestBed.tick();

        expect(locked(otherDoc)).toBe(true);
        expect(locked(document)).toBe(false);

        active.set(false);
        TestBed.tick();
        expect(locked(otherDoc)).toBe(false);
    });

    it('respects an author overflow lock on <html> — applies no strategy, leaves styles untouched', () => {
        configure(document);
        const html = document.documentElement;
        html.style.overflowY = 'hidden'; // the site author already locked the page
        const htmlBefore = html.style.cssText;

        const active = signal(true);
        lock(active);
        TestBed.tick();

        // The lock is observable (marker) but it changed nothing else — the author's styles stand.
        expect(locked(document)).toBe(true);
        expect(html.style.cssText).toBe(htmlBefore);

        active.set(false);
        TestBed.tick();
        expect(locked(document)).toBe(false);
        expect(html.style.cssText).toBe(htmlBefore);
    });

    it('is a no-op on the server (non-browser platform)', () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: DOCUMENT, useValue: document },
                { provide: PLATFORM_ID, useValue: 'server' }
            ]
        });
        const active = signal(true);
        lock(active);
        TestBed.tick();

        expect(locked(document)).toBe(false);
        expect(document.body.style.overflow).toBe('');
    });
});

describe('useAnchoredScrollLock (touch near-fullscreen gate)', () => {
    /** Stubs `<html>`'s `clientWidth` (jsdom reports 0 — no layout). Returns a cleanup. */
    function stubViewportWidth(width: number, doc: Document = document): () => void {
        Object.defineProperty(doc.documentElement, 'clientWidth', { value: width, configurable: true });
        return () => delete (doc.documentElement as unknown as Record<string, unknown>)['clientWidth'];
    }

    /** A detached element with a stubbed `offsetWidth` (jsdom reports 0). */
    function popupOfWidth(width: number): HTMLElement {
        const el = document.createElement('div');
        Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true });
        return el;
    }

    let restoreViewport: () => void = () => undefined;

    beforeEach(() => {
        TestBed.resetTestingModule();
        document.documentElement.removeAttribute(RDX_SCROLL_LOCKED_ATTR);
        TestBed.configureTestingModule({
            providers: [
                { provide: DOCUMENT, useValue: document },
                { provide: PLATFORM_ID, useValue: 'browser' }
            ]
        });
    });

    afterEach(() => {
        restoreViewport();
        document.documentElement.removeAttribute(RDX_SCROLL_LOCKED_ATTR);
    });

    function anchoredLock(
        enabled: WritableSignal<boolean>,
        touchOpen: WritableSignal<boolean>,
        element: HTMLElement | null
    ): void {
        TestBed.runInInjectionContext(() =>
            useAnchoredScrollLock(enabled, { touchOpen: () => touchOpen(), element: () => element })
        );
    }

    it('locks on a non-touch open regardless of popup width', () => {
        restoreViewport = stubViewportWidth(1000);
        anchoredLock(signal(true), signal(false), popupOfWidth(200));
        TestBed.tick();
        expect(locked(document)).toBe(true);
    });

    it('locks on a touch open only when the popup is effectively viewport-width (≤ 20px gutter)', () => {
        restoreViewport = stubViewportWidth(1000);
        // 990 >= 1000 - 20 → near-fullscreen → locks.
        anchoredLock(signal(true), signal(true), popupOfWidth(990));
        TestBed.tick();
        expect(locked(document)).toBe(true);
    });

    it('does NOT lock on a touch open when the popup is narrow (swipe-to-dismiss stays possible)', () => {
        restoreViewport = stubViewportWidth(1000);
        // 500 < 1000 - 20 → not near-fullscreen → no lock.
        anchoredLock(signal(true), signal(true), popupOfWidth(500));
        TestBed.tick();
        expect(locked(document)).toBe(false);
    });

    it('re-evaluates the touch gate when the open state flips', () => {
        restoreViewport = stubViewportWidth(1000);
        const enabled = signal(false);
        anchoredLock(enabled, signal(true), popupOfWidth(500));
        TestBed.tick();
        expect(locked(document)).toBe(false);

        enabled.set(true);
        TestBed.tick();
        expect(locked(document)).toBe(false); // narrow touch popup still does not lock
    });

    it('locks the measured element ownerDocument, not the injected DOCUMENT', () => {
        const otherDoc = document.implementation.createHTMLDocument('iframe');
        restoreViewport = stubViewportWidth(1000, otherDoc);
        const popup = otherDoc.createElement('div');
        Object.defineProperty(popup, 'offsetWidth', { value: 990, configurable: true });

        anchoredLock(signal(true), signal(true), popup);
        TestBed.tick();

        expect(locked(otherDoc)).toBe(true);
        expect(locked(document)).toBe(false);
    });
});
