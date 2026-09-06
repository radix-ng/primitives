// @vitest-environment jsdom
import { Component, ElementRef, inject, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { useInitialLiveRegionText } from '../src/composables/use-live-region-text';

/** Word joiner — the invisible marker the composable appends. */
const MARKER = '⁠';

@Component({
    selector: 'test-live-region',
    template: `
        @if (showText()) {
            <span>{{ message() }}</span>
        }
    `,
    host: { role: 'status', 'aria-live': 'polite' }
})
class TestLiveRegion {
    readonly showText = input(true);
    readonly message = input('No results found');

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    constructor() {
        useInitialLiveRegionText(() => this.elementRef.nativeElement);
    }
}

describe('useInitialLiveRegionText', () => {
    // Real timers: faking them here would also freeze the scheduler Angular's `afterNextRender` runs on.

    it('marks the mounted text so the region reports a mutation, then restores it', async () => {
        const fixture = TestBed.createComponent(TestLiveRegion);
        await fixture.whenStable();

        const host = fixture.nativeElement as HTMLElement;
        expect(host.textContent).toBe(`No results found${MARKER}`);

        await new Promise((resolve) => setTimeout(resolve, 250));
        expect(host.textContent).toBe('No results found');
    });

    it('leaves an empty region alone', async () => {
        const fixture = TestBed.createComponent(TestLiveRegion);
        fixture.componentRef.setInput('showText', false);
        await fixture.whenStable();

        expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');
        expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(MARKER);
    });

    it('restores the text when the region is destroyed before the timer runs', async () => {
        const fixture = TestBed.createComponent(TestLiveRegion);
        await fixture.whenStable();

        const host = fixture.nativeElement as HTMLElement;
        const textNode = host.querySelector('span')!.firstChild as Text;
        expect(textNode.data).toContain(MARKER);

        fixture.destroy();
        expect(textNode.data).toBe('No results found');
    });
});
