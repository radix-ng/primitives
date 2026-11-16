import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import {
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsRoot,
    RdxTabsTab,
    type RdxTabsValue,
    type RdxTabsValueChangeEvent
} from '../index';

@Component({
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    template: `
        <div
            [value]="controlled() ? value() : undefined"
            [defaultValue]="initial()"
            (onValueChange)="change($event)"
            rdxTabsRoot
        >
            <div rdxTabsList>
                @for (item of options(); track $index) {
                    <button [value]="item" rdxTabsTab>Tab {{ $index }}</button>
                }
            </div>
            @for (item of options(); track $index) {
                <div [value]="item" keepMounted rdxTabsPanel>Panel {{ $index }}</div>
            }
        </div>
    `
})
class Host {
    readonly options = signal<RdxTabsValue[]>([]);
    readonly initial = signal<RdxTabsValue>(undefined);
    readonly controlled = signal(false);
    readonly value = signal<RdxTabsValue>(undefined);
    readonly changes: RdxTabsValueChangeEvent[] = [];
    cancel = false;
    change(change: RdxTabsValueChangeEvent) {
        this.changes.push(change);
        if (this.cancel) change.eventDetails.cancel();
        else if (this.controlled()) this.value.set(change.value);
    }
}

describe('Tabs arbitrary value identities', () => {
    async function render(options: unknown[], initial: unknown = options[0], controlled = false) {
        const fixture = TestBed.createComponent(Host),
            host = fixture.componentInstance;
        host.options.set(options);
        host.initial.set(initial);
        host.value.set(initial);
        host.controlled.set(controlled);
        fixture.detectChanges();
        await fixture.whenStable();
        const tabs = [...fixture.nativeElement.querySelectorAll('[role="tab"]')] as HTMLElement[];
        const root = fixture.debugElement.query(By.directive(RdxTabsRoot)).injector.get(RdxTabsRoot);
        return { fixture, host, tabs, root };
    }

    it.each([
        ['objects', [{ id: 1 }, { id: 1 }]],
        ['arrays', [[1], [1]]],
        ['symbols', [Symbol('tab'), Symbol('tab')]],
        ['bigints', [1n, 2n]],
        ['booleans', [false, true]],
        ['falsy values', [false, 0, '']]
    ] as const)('selects and emits the original %s identity', async (_, values) => {
        const { fixture, host, tabs, root } = await render([...values]);
        expect(root.value()).toBe(values[0]);
        expect(tabs[0].getAttribute('aria-selected')).toBe('true');
        expect(tabs[1].getAttribute('aria-selected')).toBe('false');
        tabs[1].click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(root.value()).toBe(values[1]);
        expect(host.changes[0].value).toBe(values[1]);
        expect(host.changes).toHaveLength(1);
    });

    it('stores function defaults, controlled values and requests without executing them', async () => {
        const first = vi.fn(),
            second = vi.fn();
        for (const controlled of [false, true]) {
            const { fixture, host, tabs, root } = await render([first, second], first, controlled);
            expect(root.value()).toBe(first);
            tabs[1].click();
            fixture.detectChanges();
            await fixture.whenStable();
            expect(root.value()).toBe(second);
            expect(host.changes[0].value).toBe(second);
            fixture.destroy();
        }
        expect(first).not.toHaveBeenCalled();
        expect(second).not.toHaveBeenCalled();
    });

    it('selects an explicitly bound undefined Panel value', async () => {
        const { fixture, tabs, root, host } = await render([0, undefined]);
        tabs[1].click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(root.value()).toBeUndefined();
        expect(host.changes[0].value).toBeUndefined();
        expect(tabs[1].getAttribute('aria-selected')).toBe('true');
        expect(fixture.nativeElement.querySelectorAll('[role="tabpanel"]')[1].hidden).toBe(false);
    });

    it('treats a different object with equal fields as a missing default', async () => {
        const first = { id: 1 };
        const { root, host } = await render([first, { id: 2 }], { id: 1 });
        expect(root.value()).toBe(first);
        expect(host.changes[0].value).toBe(first);
        expect(host.changes[0].eventDetails.reason).toBe('missing');
    });

    it('does not coerce object identities to generate native ids', async () => {
        const coerce = vi.fn(() => {
            throw new Error('Value coerced');
        });
        const { fixture, tabs } = await render([{ [Symbol.toPrimitive]: coerce }, { [Symbol.toPrimitive]: coerce }]);
        tabs[1].click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(new Set([...fixture.nativeElement.querySelectorAll('[id]')].map((part: Element) => part.id)).size).toBe(
            4
        );
        expect(coerce).not.toHaveBeenCalled();
    });

    it('keeps cancellation and NaN request direction consistent with strict matching', async () => {
        const { fixture, host, tabs, root } = await render([0, NaN]);
        host.cancel = true;
        tabs.forEach((tab, index) =>
            vi
                .spyOn(tab, 'getBoundingClientRect')
                .mockReturnValue(DOMRect.fromRect({ x: index * 100, width: 100, height: 40 }))
        );
        tabs[1].click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(root.value()).toBe(0);
        expect(host.changes[0].value).toBeNaN();
        expect(host.changes[0].eventDetails.activationDirection).toBe('left');
        expect(host.changes[0].eventDetails.isCanceled()).toBe(true);
    });
});

@Component({ imports: [RdxTabsRoot, RdxTabsPanel], template: '<div rdxTabsRoot><div rdxTabsPanel></div></div>' })
class MissingPanelValue {}

it('still diagnoses a genuinely missing Panel input', () => {
    const fixture = TestBed.createComponent(MissingPanelValue);
    expect(() => fixture.detectChanges()).toThrow(/Supply a Panel value/);
});
