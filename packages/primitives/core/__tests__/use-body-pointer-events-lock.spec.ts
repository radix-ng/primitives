// @vitest-environment jsdom
import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useBodyPointerEventsLock } from '../src/dom/use-body-pointer-events-lock';

function resetBody(doc: Document): void {
    doc.body.style.pointerEvents = '';
}

describe('useBodyPointerEventsLock', () => {
    beforeEach(() => {
        TestBed.resetTestingModule();
        resetBody(document);
    });

    afterEach(() => {
        resetBody(document);
    });

    function configure(doc: Document, platform: 'browser' | 'server' = 'browser'): void {
        TestBed.configureTestingModule({
            providers: [
                { provide: DOCUMENT, useValue: doc },
                { provide: PLATFORM_ID, useValue: platform }
            ]
        });
    }

    function lock(active: WritableSignal<boolean>): void {
        TestBed.runInInjectionContext(() => useBodyPointerEventsLock(active));
    }

    it('disables and restores body pointer-events', () => {
        configure(document);
        const active = signal(false);
        lock(active);

        active.set(true);
        TestBed.tick();
        expect(document.body.style.pointerEvents).toBe('none');

        active.set(false);
        TestBed.tick();
        expect(document.body.style.pointerEvents).toBe('');
    });

    it('preserves a pre-existing inline pointer-events value on restore', () => {
        document.body.style.pointerEvents = 'auto';
        configure(document);
        const active = signal(false);
        lock(active);

        active.set(true);
        TestBed.tick();
        expect(document.body.style.pointerEvents).toBe('none');

        active.set(false);
        TestBed.tick();
        expect(document.body.style.pointerEvents).toBe('auto');
    });

    it('shares a per-document lock count across callers (stacked layers compose)', () => {
        configure(document);
        const a = signal(false);
        const b = signal(false);
        lock(a);
        lock(b);

        a.set(true);
        b.set(true);
        TestBed.tick();
        expect(document.body.style.pointerEvents).toBe('none');

        // releasing one lock keeps the body disabled while the other is still active
        a.set(false);
        TestBed.tick();
        expect(document.body.style.pointerEvents).toBe('none');

        b.set(false);
        TestBed.tick();
        expect(document.body.style.pointerEvents).toBe('');
    });

    it('isolates lock state per document — an iframe lock does not corrupt the main document', () => {
        const otherDoc = document.implementation.createHTMLDocument('iframe');
        configure(otherDoc);
        const active = signal(false);
        lock(active);

        active.set(true);
        TestBed.tick();

        expect(otherDoc.body.style.pointerEvents).toBe('none');
        expect(document.body.style.pointerEvents).toBe('');
    });

    it('is a no-op on the server (non-browser platform)', () => {
        configure(document, 'server');
        const active = signal(true);
        lock(active);
        TestBed.tick();

        expect(document.body.style.pointerEvents).toBe('');
    });
});
