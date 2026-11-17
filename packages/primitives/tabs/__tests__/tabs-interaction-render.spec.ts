import { ApplicationRef, Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab, type RdxTabsValueChangeEvent } from '../index';

@Component({
    selector: 'test-render-list',
    imports: [RdxTabsList, RdxTabsTab],
    template: `
        <div [activateOnFocus]="automatic()" rdxTabsList>
            <button value="one" rdxTabsTab>One</button>
            <button value="two" rdxTabsTab>Two</button>
            <button value="three" rdxTabsTab>Three</button>
        </div>
    `
})
class SeparateList {
    readonly automatic = input(false);
}

@Component({
    selector: 'test-render-panels',
    imports: [RdxTabsPanel],
    template: `
        <div value="one" keepMounted rdxTabsPanel>
            One
            <input />
        </div>
        <div value="two" keepMounted rdxTabsPanel>
            Two
            <input />
        </div>
        <div value="three" keepMounted rdxTabsPanel>
            Three
            <input />
        </div>
    `
})
class SeparatePanels {}

@Component({
    selector: 'test-render-tabs',
    imports: [SeparateList, SeparatePanels],
    hostDirectives: [{ directive: RdxTabsRoot, inputs: ['value', 'defaultValue'], outputs: ['onValueChange'] }],
    template: `
        <test-render-list [automatic]="automatic()" />
        <test-render-panels />
    `
})
class TabsFacade {
    readonly automatic = input(false);
}

@Component({
    imports: [TabsFacade],
    template: `
        <test-render-tabs
            [value]="value()"
            [automatic]="automatic()"
            (onValueChange)="request($event)"
            defaultValue="one"
            data-testid="first"
        />
        <test-render-tabs value="one" defaultValue="one" data-testid="second" />
        <p data-testid="unrelated">{{ unrelated() }}</p>
    `
})
class Parent {
    readonly value = signal<unknown>('one');
    readonly automatic = signal(false);
    readonly unrelated = signal('before');
    readonly changes: unknown[] = [];
    policy: 'accept' | 'ignore' | 'delay' | 'cancel' | 'replace' = 'accept';
    pending: unknown;
    request(change: RdxTabsValueChangeEvent) {
        this.changes.push(change.value);
        if (this.policy === 'accept') this.value.set(change.value);
        if (this.policy === 'delay') this.pending = change.value;
        if (this.policy === 'cancel') change.eventDetails.cancel();
        if (this.policy === 'replace') this.value.set('three');
    }
}

@Component({
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, TabsFacade],
    template: `
        <div (onValueChange)="outerChanges.push($event.value)" defaultValue="outer" rdxTabsRoot>
            <div rdxTabsList><button value="outer" data-testid="outer" rdxTabsTab>Outer</button></div>
            <div value="outer" keepMounted rdxTabsPanel>
                <test-render-tabs [value]="value()" (onValueChange)="value.set($event.value)" data-testid="nested" />
            </div>
        </div>
    `
})
class NestedParent {
    readonly value = signal<unknown>('one');
    readonly outerChanges: unknown[] = [];
}

describe('Tabs interaction render before native Tab', () => {
    async function render() {
        const fixture = TestBed.createComponent(Parent);
        await fixture.whenStable();
        const host = fixture.componentInstance;
        const first = fixture.nativeElement.querySelector('[data-testid="first"]') as HTMLElement;
        const second = fixture.nativeElement.querySelector('[data-testid="second"]') as HTMLElement;
        const tabs = [...first.querySelectorAll<HTMLElement>('[role="tab"]')];
        const panels = [...first.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
        const app = TestBed.inject(ApplicationRef);
        const originalTick = app.tick.bind(app);
        const tick = vi.spyOn(app, 'tick');
        const tab = (target: HTMLElement, shiftKey = false, prevented = false) => {
            const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true, shiftKey });
            if (prevented) event.preventDefault();
            target.dispatchEvent(event);
            return event;
        };
        return { fixture, host, first, second, tabs, panels, tick, originalTick, tab };
    }

    it('updates an ancestor-owned controlled input and sibling Panel view before Tab defaults run', async () => {
        const { host, tabs, panels, tick, tab } = await render();
        tabs[1].click();
        expect(host.value()).toBe('two');
        expect(panels[1].hidden).toBe(true);
        const event = tab(tabs[1]);
        expect(tabs[1].getAttribute('aria-selected')).toBe('true');
        expect(panels[1].hidden).toBe(false);
        expect(panels[1].hasAttribute('inert')).toBe(false);
        expect(panels[0].hidden).toBe(false);
        expect(panels[0].hasAttribute('inert')).toBe(true);
        expect(panels[0].tabIndex).toBe(-1);
        expect(tick).toHaveBeenCalledOnce();
        expect(event.defaultPrevented).toBe(false);
        expect(host.changes).toEqual(['two']);
        tab(tabs[1]);
        expect(tick).toHaveBeenCalledOnce();
        await vi.waitFor(() => expect(panels[0].hidden).toBe(true));
    });

    it.each(['ignore', 'delay', 'cancel', 'replace'] as const)(
        'preserves the controlled parent policy: %s',
        async (policy) => {
            const { host, tabs, panels, tick, tab } = await render();
            host.policy = policy;
            tabs[1].click();
            tab(tabs[1]);
            const index = policy === 'replace' ? 2 : 0;
            expect(tabs[index].getAttribute('aria-selected')).toBe('true');
            expect(panels[index].hidden).toBe(false);
            expect(host.value()).toBe(policy === 'replace' ? 'three' : 'one');
            expect(host.changes).toEqual(['two']);
            expect(tick).toHaveBeenCalledOnce();
            if (policy === 'delay') expect(host.pending).toBe('two');
        }
    );

    it('renders the roving tab stop before an immediate Shift+Tab without selecting the manual destination', async () => {
        const { tabs, panels, host, tick, tab } = await render();
        tabs[1].focus();
        expect(tabs[1].tabIndex).toBe(-1);
        tab(tabs[1], true);
        expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
        expect(panels[0].hidden).toBe(false);
        expect(host.changes).toEqual([]);
        expect(tick).toHaveBeenCalledOnce();
    });

    it('does not flush a different Root or unrelated pending application changes on ordinary Tab', async () => {
        const { fixture, host, second, tabs, tick, tab } = await render();
        tabs[1].click();
        host.unrelated.set('after');
        tab(second.querySelector<HTMLElement>('[role="tab"]')!);
        expect(tick).not.toHaveBeenCalled();
        expect(fixture.nativeElement.querySelector('[data-testid="unrelated"]').textContent).toBe('before');
        expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    });

    it('clears the pending interaction after Angular renders normally', async () => {
        const { fixture, tabs, tick, tab } = await render();
        tabs[1].click();
        await fixture.whenStable();
        tab(tabs[1]);
        expect(tick).not.toHaveBeenCalled();
        expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    });

    it('honors a consumer-prevented Tab and does not flush on other keys', async () => {
        const { fixture, tabs, panels, tick, tab } = await render();
        tabs[1].click();
        tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        tab(tabs[1], false, true);
        expect(tick).not.toHaveBeenCalled();
        expect(panels[1].hidden).toBe(true);
        await fixture.whenStable();
        expect(panels[1].hidden).toBe(false);
    });

    it('does not recursively start an application tick from another pending Root', async () => {
        const { second, tabs, tick, originalTick, tab } = await render();
        const other = second.querySelectorAll<HTMLElement>('[role="tab"]')[1];
        tabs[1].click();
        other.click();
        // Keep the real render; trigger a second Root's Tab synchronously inside that boundary.
        tick.mockImplementation(() => {
            tab(other);
            originalTick();
        });
        tab(tabs[1]);
        expect(tick).toHaveBeenCalledOnce();
    });

    it('keeps a nested Root interaction owned by its List', async () => {
        const fixture = TestBed.createComponent(NestedParent);
        await fixture.whenStable();
        const nested = fixture.nativeElement.querySelector('[data-testid="nested"]') as HTMLElement;
        const tab = nested.querySelectorAll<HTMLElement>('[role="tab"]')[1];
        const tick = vi.spyOn(TestBed.inject(ApplicationRef), 'tick');
        tab.click();
        tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
        expect(tick).toHaveBeenCalledOnce();
        expect(tab.getAttribute('aria-selected')).toBe('true');
        expect(fixture.nativeElement.querySelector('[data-testid="outer"]').getAttribute('aria-selected')).toBe('true');
        expect(fixture.componentInstance.outerChanges).toEqual([]);
    });
});
