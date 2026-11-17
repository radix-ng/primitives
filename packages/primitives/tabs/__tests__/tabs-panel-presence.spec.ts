import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RdxTabsList } from '../src/tabs-list';
import { RdxTabsPanel } from '../src/tabs-panel';
import { RdxTabsPanelPresence } from '../src/tabs-panel-presence';
import { RdxTabsRoot } from '../src/tabs-root';
import { RdxTabsTab } from '../src/tabs-tab';

@Component({ selector: 'presence-child', template: '<input [value]="instance" />' })
class PresenceChild {
    static created = 0;
    static destroyed: number[] = [];
    readonly instance = ++PresenceChild.created;
    constructor() {
        inject(DestroyRef).onDestroy(() => PresenceChild.destroyed.push(this.instance));
    }
}

@Component({
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence, PresenceChild],
    template: `
        @if (show()) {
            <div [value]="value()" rdxTabsRoot>
                <div rdxTabsList>
                    <button rdxTabsTab value="one">One</button>
                    <button rdxTabsTab value="two">Two</button>
                    <button rdxTabsTab value="other">Other</button>
                </div>
                <div *rdxTabsPanelPresence="panelValue(); keepMounted: keepMounted()" data-key="one" rdxTabsPanel>
                    <presence-child />
                </div>
                <div *rdxTabsPanelPresence="'two'; keepMounted: keepMounted()" data-key="two" rdxTabsPanel>
                    <presence-child />
                </div>
            </div>
        }
    `
})
class PresenceHost {
    readonly value = signal('one');
    readonly panelValue = signal('one');
    readonly keepMounted = signal(false);
    readonly show = signal(true);
}

@Component({
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence],
    template: `
        <div value="outer" rdxTabsRoot>
            <div rdxTabsList><button rdxTabsTab value="outer">Outer</button></div>
            <div *rdxTabsPanelPresence="'outer'" data-key="outer" rdxTabsPanel>
                <div value="inner" rdxTabsRoot>
                    <div rdxTabsList><button rdxTabsTab value="inner">Inner</button></div>
                    <div data-key="inner" rdxTabsPanel value="inner">Inner content</div>
                </div>
            </div>
        </div>
    `
})
class NestedPresenceHost {}

describe('Tabs whole-Panel presence', () => {
    let fixture: ComponentFixture<PresenceHost>;
    let element: HTMLElement;
    const panel = (key: string) => element.querySelector<HTMLElement>(`[data-key="${key}"]`);

    beforeEach(async () => {
        PresenceChild.created = 0;
        PresenceChild.destroyed = [];
        fixture = TestBed.createComponent(PresenceHost);
        element = fixture.nativeElement;
        await fixture.whenStable();
    });

    it('destroys the outgoing native Panel and its Angular children, then creates fresh children on return', async () => {
        const initial = panel('one')!;
        expect(panel('two')).toBeNull();
        expect(PresenceChild.created).toBe(1);
        fixture.componentInstance.value.set('two');
        await fixture.whenStable();
        await vi.waitFor(() => expect(panel('one')).toBeNull());
        expect(initial.isConnected).toBe(false);
        expect(panel('two')).not.toBeNull();
        expect(PresenceChild.destroyed).toEqual([1]);
        fixture.componentInstance.value.set('one');
        await fixture.whenStable();
        await vi.waitFor(() => expect(panel('two')).toBeNull());
        expect(panel('one')).not.toBe(initial);
        expect(PresenceChild.created).toBe(3);
        expect(PresenceChild.destroyed).toEqual([1, 2]);
    });

    it('[APG Tabs][WCAG 4.1.2] unregisters absent hosts and preserves the structural instance ID on remount', async () => {
        const id = panel('one')!.id;
        const tabs = [...element.querySelectorAll('[role="tab"]')];
        expect(tabs[0].getAttribute('aria-controls')).toBe(id);
        expect(tabs[1].hasAttribute('aria-controls')).toBe(false);
        fixture.componentInstance.value.set('two');
        await fixture.whenStable();
        await vi.waitFor(() => expect(tabs[0].hasAttribute('aria-controls')).toBe(false));
        expect(tabs[1].getAttribute('aria-controls')).toBe(panel('two')!.id);
        fixture.componentInstance.value.set('one');
        await fixture.whenStable();
        expect(panel('one')!.id).toBe(id);
        expect(tabs[0].getAttribute('aria-controls')).toBe(id);
    });

    it('keeps complete views and child state with keepMounted, and releases an inactive view when disabled', async () => {
        fixture.componentInstance.keepMounted.set(true);
        await fixture.whenStable();
        const initial = panel('one')!;
        const input = initial.querySelector('input')!;
        input.value = 'edited';
        fixture.componentInstance.value.set('two');
        await fixture.whenStable();
        expect(panel('one')).toBe(initial);
        expect(input.value).toBe('edited');
        expect(PresenceChild.destroyed).toEqual([]);
        fixture.componentInstance.keepMounted.set(false);
        await fixture.whenStable();
        await vi.waitFor(() => expect(panel('one')).toBeNull());
        expect(PresenceChild.destroyed).toEqual([1]);
        expect(panel('two')).not.toBeNull();
    });

    it('retains the active native host and ID when the structural value and selection change together', async () => {
        const initial = panel('one')!;
        fixture.componentInstance.panelValue.set('other');
        fixture.componentInstance.value.set('other');
        await fixture.whenStable();
        expect(panel('one')).toBe(initial);
        expect(element.querySelectorAll('[role="tab"]')[2].getAttribute('aria-controls')).toBe(initial.id);
        expect(PresenceChild.created).toBe(1);
        expect(PresenceChild.destroyed).toEqual([]);
    });

    it('destroys child views exactly once when the Root is removed', async () => {
        fixture.componentInstance.show.set(false);
        await fixture.whenStable();
        expect(element.querySelector('[role="tabpanel"]')).toBeNull();
        expect(PresenceChild.destroyed).toEqual([1]);
        fixture.destroy();
        expect(PresenceChild.destroyed).toEqual([1]);
    });

    it('reuses a structural Panel reopened before its exit frame and ignores its old removal', async () => {
        const initial = panel('one')!;
        fixture.componentInstance.value.set('two');
        await fixture.whenStable();
        expect(panel('one')).toBe(initial);
        expect(initial.hasAttribute('inert')).toBe(true);
        fixture.componentInstance.value.set('one');
        await fixture.whenStable();
        await vi.waitFor(() => expect(panel('two')).toBeNull());
        expect(panel('one')).toBe(initial);
        expect(initial.hidden).toBe(false);
        expect(PresenceChild.created).toBe(2);
        expect(PresenceChild.destroyed).toEqual([2]);
    });

    it('does not inherit an outer Panel owner through a nested Tabs Root', async () => {
        const nested = TestBed.createComponent(NestedPresenceHost);
        await nested.whenStable();
        const root = nested.nativeElement as HTMLElement;
        const outer = root.querySelector<HTMLElement>('[data-key="outer"]')!;
        const inner = root.querySelector<HTMLElement>('[data-key="inner"]')!;
        expect(inner.hidden).toBe(false);
        expect(inner.id).not.toBe(outer.id);
        expect(root.querySelectorAll('[role="tab"]')[1].getAttribute('aria-controls')).toBe(inner.id);
    });
});
