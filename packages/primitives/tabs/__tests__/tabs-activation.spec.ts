import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxTabsList } from '../src/tabs-list';
import { RdxTabsPanel } from '../src/tabs-panel';
import { RdxTabsRoot, type RdxTabsValueChangeEvent } from '../src/tabs-root';
import { RdxTabsTab } from '../src/tabs-tab';
import type { RdxTabsValue } from '../src/utils';

@Component({
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    template: `
        <div [(value)]="value" (onValueChange)="change($event)" rdxTabsRoot>
            <div rdxTabsList>
                <button rdxTabsTab value="zero">Zero</button>
                @if (custom()) {
                    <a [disabled]="disabled()" [nativeButton]="false" href="#destination" rdxTabsTab value="one">
                        One
                        <span tabindex="0">Child</span>
                    </a>
                } @else {
                    <button [disabled]="disabled()" rdxTabsTab value="one">One</button>
                }
            </div>
            <div rdxTabsPanel value="zero">Zero panel</div>
            <div rdxTabsPanel value="one">One panel</div>
        </div>
    `
})
class ActivationHost {
    readonly value = signal<RdxTabsValue>('zero');
    readonly custom = signal(false);
    readonly disabled = signal(false);
    cancel = false;
    readonly changes: RdxTabsValueChangeEvent[] = [];
    change(event: RdxTabsValueChangeEvent) {
        if (this.cancel) event.eventDetails.cancel();
        this.changes.push(event);
    }
}

describe('Tabs native activation', () => {
    let fixture: ComponentFixture<ActivationHost>;
    let host: ActivationHost;
    const tab = () => fixture.nativeElement.querySelectorAll('[role="tab"]')[1] as HTMLElement;
    const key = (type: 'keydown' | 'keyup', key: string, modifiers = {}) =>
        new KeyboardEvent(type, { key, bubbles: true, cancelable: true, ...modifiers });
    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [ActivationHost] });
        fixture = TestBed.createComponent(ActivationHost);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('[APG Tabs] leaves native Enter to its browser click', async () => {
        tab().dispatchEvent(key('keydown', 'Enter'));
        expect(host.changes).toHaveLength(0);
        expect(host.value()).toBe('zero');
        // jsdom does not implement native keyboard activation; browser comparisons establish it.
        tab().click();
        await fixture.whenStable();
        expect(host.value()).toBe('one');
        expect(host.changes).toHaveLength(1);
        expect(host.changes[0].eventDetails.event.type).toBe('click');
    });

    it('[APG Tabs] uses one modified click for composite Space and suppresses its keyup default', async () => {
        const down = key('keydown', ' ', { shiftKey: true, ctrlKey: true });
        tab().dispatchEvent(down);
        await fixture.whenStable();
        expect(down.defaultPrevented).toBe(true);
        expect(host.changes).toHaveLength(1);
        const event = host.changes[0].eventDetails.event as MouseEvent;
        expect(event.type).toBe('click');
        expect(event.shiftKey).toBe(true);
        expect(event.ctrlKey).toBe(true);
        expect(host.changes[0].eventDetails.trigger).toBe(tab());
        const up = key('keyup', ' ');
        tab().dispatchEvent(up);
        expect(up.defaultPrevented).toBe(true);
        expect(host.changes).toHaveLength(1);
    });

    it('does not retry a canceled Space request on keyup', async () => {
        host.cancel = true;
        tab().dispatchEvent(key('keydown', ' '));
        tab().dispatchEvent(key('keyup', ' '));
        await fixture.whenStable();
        expect(host.value()).toBe('zero');
        expect(host.changes).toHaveLength(1);
        expect(host.changes[0].eventDetails.event.type).toBe('click');
        expect(host.changes[0].eventDetails.isCanceled()).toBe(true);
    });

    it('[APG Tabs] ignores a descendant key while preserving its default behavior', async () => {
        host.custom.set(true);
        await fixture.whenStable();
        const child = tab().querySelector('span')!;
        const event = key('keydown', ' ');
        child.dispatchEvent(event);
        expect(host.changes).toHaveLength(0);
        expect(host.value()).toBe('zero');
        expect(event.defaultPrevented).toBe(false);
    });

    it('[APG Tabs] prevents disabled host activation defaults while keeping native focusability', async () => {
        host.custom.set(true);
        host.disabled.set(true);
        await fixture.whenStable();
        for (const event of [
            key('keydown', 'Enter'),
            key('keydown', ' '),
            new MouseEvent('click', { bubbles: true, cancelable: true }),
            new MouseEvent('pointerdown', { bubbles: true, cancelable: true })
        ]) {
            tab().dispatchEvent(event);
            expect(event.defaultPrevented).toBe(true);
        }
        expect(tab().hasAttribute('disabled')).toBe(false);
        expect(tab().getAttribute('aria-disabled')).toBe('true');
        expect(host.changes).toHaveLength(0);
        const leave = key('keydown', 'Tab');
        tab().dispatchEvent(leave);
        expect(leave.defaultPrevented).toBe(false);
    });

    it.each(['pointerup', 'pointercancel', 'destroy'] as const)(
        'releases both press listeners after %s',
        async (end) => {
            const doc = tab().ownerDocument;
            const add = vi.spyOn(doc, 'addEventListener');
            const remove = vi.spyOn(doc, 'removeEventListener');
            try {
                tab().dispatchEvent(new MouseEvent('pointerdown', { button: 2, bubbles: true }));
                const up = add.mock.calls.find((call) => call[0] === 'pointerup')![1];
                const cancel = add.mock.calls.find((call) => call[0] === 'pointercancel')![1];
                if (end === 'destroy') fixture.destroy();
                else doc.dispatchEvent(new Event(end));
                expect(remove.mock.calls.some((call) => call[0] === 'pointerup' && call[1] === up)).toBe(true);
                expect(remove.mock.calls.some((call) => call[0] === 'pointercancel' && call[1] === cancel)).toBe(true);
            } finally {
                add.mockRestore();
                remove.mockRestore();
            }
        }
    );
});
