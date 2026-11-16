import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxTabsIndicator } from '../src/tabs-indicator';
import { RdxTabsList } from '../src/tabs-list';
import { RdxTabsRoot } from '../src/tabs-root';
import { RdxTabsTab } from '../src/tabs-tab';

@Component({
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsIndicator],
    template: `
        <div [value]="1" rdxTabsRoot>
            @for (list of [{ key: listKey() }]; track list.key) {
                <div rdxTabsList>
                    @for (value of tabs(); track value) {
                        <button [value]="value" rdxTabsTab>{{ value }}</button>
                    }
                </div>
            }
            <span rdxTabsIndicator></span>
        </div>
    `
})
class IndicatorHost {
    readonly listKey = signal(0);
    readonly tabs = signal([0, 1, 2]);
}

describe('Tabs Indicator observation lifetime', () => {
    let fixture: ComponentFixture<IndicatorHost>;
    const observers: { elements: Set<Element>; disconnect: ReturnType<typeof vi.fn> }[] = [];
    const observed = () => new Set(observers.flatMap((observer) => [...observer.elements]));

    beforeEach(async () => {
        observers.length = 0;
        vi.stubGlobal(
            'ResizeObserver',
            class {
                readonly elements = new Set<Element>();
                readonly disconnect = vi.fn(() => this.elements.clear());
                constructor() {
                    observers.push(this);
                }
                observe(element: Element) {
                    this.elements.add(element);
                }
                unobserve(element: Element) {
                    this.elements.delete(element);
                }
            }
        );
        fixture = TestBed.createComponent(IndicatorHost);
        await fixture.whenStable();
    });

    afterEach(() => {
        fixture.destroy();
        vi.unstubAllGlobals();
    });

    it('observes the List and every tab, including unselected siblings', () => {
        const parts = [...fixture.nativeElement.querySelectorAll('[role="tablist"], [role="tab"]')];
        expect(observed()).toEqual(new Set(parts));
        expect(parts).toHaveLength(4);
    });

    it('replaces observed elements after insertion/removal and List replacement while the Indicator survives', async () => {
        const indicator = fixture.nativeElement.querySelector('[rdxTabsIndicator]');
        const removed = fixture.nativeElement.querySelectorAll('[role="tab"]')[0];
        fixture.componentInstance.tabs.set([1, 2, 3]);
        await fixture.whenStable();
        expect(observed().has(removed)).toBe(false);
        expect(observed()).toEqual(
            new Set([...fixture.nativeElement.querySelectorAll('[role="tablist"], [role="tab"]')])
        );

        const oldList = fixture.nativeElement.querySelector('[role="tablist"]');
        fixture.componentInstance.listKey.set(1);
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('[rdxTabsIndicator]')).toBe(indicator);
        expect(observed().has(oldList)).toBe(false);
        expect(observed()).toEqual(
            new Set([...fixture.nativeElement.querySelectorAll('[role="tablist"], [role="tab"]')])
        );
    });

    it('disconnects every observer when the Root is destroyed', () => {
        expect(observed().size).toBeGreaterThan(0);
        fixture.destroy();
        expect(observed().size).toBe(0);
        expect(observers.every((observer) => observer.disconnect.mock.calls.length > 0)).toBe(true);
    });
});
