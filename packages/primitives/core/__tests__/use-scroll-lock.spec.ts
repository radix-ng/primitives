// @vitest-environment jsdom
import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useScrollLock } from '../src/dom/use-scroll-lock';

function resetScroller(doc: Document): void {
    doc.documentElement.style.overflow = '';
    doc.documentElement.style.paddingRight = '';
    doc.body.style.overflow = '';
}

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

    it('locks and restores the scroller', () => {
        configure(document);
        const active = signal(false);
        lock(active);

        active.set(true);
        TestBed.tick();
        expect(document.body.style.overflow).toBe('hidden');
        expect(document.documentElement.style.overflow).toBe('hidden');

        active.set(false);
        TestBed.tick();
        expect(document.body.style.overflow).toBe('');
        expect(document.documentElement.style.overflow).toBe('');
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
        expect(document.body.style.overflow).toBe('hidden');

        // releasing one lock keeps the page locked while the other is still active
        a.set(false);
        TestBed.tick();
        expect(document.body.style.overflow).toBe('hidden');

        b.set(false);
        TestBed.tick();
        expect(document.body.style.overflow).toBe('');
    });

    it('isolates lock state per document — an iframe lock does not corrupt the main document', () => {
        const otherDoc = document.implementation.createHTMLDocument('iframe');
        configure(otherDoc);
        const active = signal(false);
        lock(active);

        active.set(true);
        TestBed.tick();

        // the other document is locked...
        expect(otherDoc.body.style.overflow).toBe('hidden');
        // ...while the main document's scroller is untouched (separate WeakMap state)
        expect(document.body.style.overflow).toBe('');
        expect(document.documentElement.style.overflow).toBe('');
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

        expect(document.body.style.overflow).toBe('');
    });
});
