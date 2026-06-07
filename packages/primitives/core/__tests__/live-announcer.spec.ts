import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RdxLiveAnnouncer } from '../src/live-announcer';

function queryLiveRegions(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.rdx-live-announcer'));
}

describe('RdxLiveAnnouncer', () => {
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        // Reset the root injector so the announcer's DestroyRef cleanup runs, then drop any leftover region.
        TestBed.resetTestingModule();
        queryLiveRegions().forEach((el) => el.remove());
    });

    describe('in the browser', () => {
        let announcer: RdxLiveAnnouncer;

        beforeEach(() => {
            vi.useFakeTimers();
            TestBed.configureTestingModule({});
            announcer = TestBed.inject(RdxLiveAnnouncer);
        });

        it('lazily appends a single visually hidden live region to the body', () => {
            expect(queryLiveRegions()).toHaveLength(0);

            announcer.announce('Step 1 of 3');

            const regions = queryLiveRegions();
            expect(regions).toHaveLength(1);

            const region = regions[0];
            expect(region.parentElement).toBe(document.body);
            expect(region.getAttribute('aria-atomic')).toBe('true');
            // Visually hidden but kept in the accessibility tree.
            expect(region.style.position).toBe('absolute');
            expect(region.style.overflow).toBe('hidden');
        });

        it('writes the message into the region after a tick', () => {
            announcer.announce('Step 1 of 3');

            const region = queryLiveRegions()[0];
            // Cleared synchronously, populated on the next tick so screen readers pick up the change.
            expect(region.textContent).toBe('');

            vi.advanceTimersByTime(0);

            expect(region.textContent).toBe('Step 1 of 3');
        });

        it('defaults to polite and honours an explicit politeness', () => {
            announcer.announce('polite message');
            expect(queryLiveRegions()[0].getAttribute('aria-live')).toBe('polite');

            announcer.announce('assertive message', 'assertive');
            expect(queryLiveRegions()[0].getAttribute('aria-live')).toBe('assertive');
        });

        it('reuses the same region across announcements', () => {
            announcer.announce('first');
            vi.advanceTimersByTime(0);
            const firstRegion = queryLiveRegions()[0];

            announcer.announce('second');
            vi.advanceTimersByTime(0);

            expect(queryLiveRegions()).toHaveLength(1);
            expect(queryLiveRegions()[0]).toBe(firstRegion);
            expect(firstRegion.textContent).toBe('second');
        });

        it('clears the message after the given duration', () => {
            announcer.announce('temporary', 'polite', 1000);
            vi.advanceTimersByTime(0);
            const region = queryLiveRegions()[0];
            expect(region.textContent).toBe('temporary');

            vi.advanceTimersByTime(1000);

            expect(region.textContent).toBe('');
        });

        it('clear() empties the region', () => {
            announcer.announce('something');
            vi.advanceTimersByTime(0);
            const region = queryLiveRegions()[0];
            expect(region.textContent).toBe('something');

            announcer.clear();

            expect(region.textContent).toBe('');
        });
    });

    describe('on the server', () => {
        it('is a no-op and never touches the DOM', () => {
            TestBed.configureTestingModule({
                providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
            });
            const announcer = TestBed.inject(RdxLiveAnnouncer);

            announcer.announce('Step 1 of 3');

            expect(queryLiveRegions()).toHaveLength(0);
        });
    });
});
