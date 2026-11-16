import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab, type RdxTabsValueChangeEvent } from '../index';

@Component({
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    template: `
        <div [value]="value()" (onValueChange)="change($event)" (valueChange)="outputs.push($event)" rdxTabsRoot>
            <div rdxTabsList>
                <button [value]="0" rdxTabsTab>Zero</button>
                <button [value]="1" rdxTabsTab>One</button>
                <button [value]="2" rdxTabsTab>Two</button>
            </div>
            <div [value]="0" rdxTabsPanel>Zero</div>
            <div [value]="1" rdxTabsPanel>One</div>
            <div [value]="2" rdxTabsPanel>Two</div>
        </div>
    `
})
class ControlledHost {
    readonly value = signal<unknown>(0);
    readonly outputs: unknown[] = [];
    readonly changes: RdxTabsValueChangeEvent[] = [];
    policy: 'ignore' | 'replace' | 'cancel' = 'ignore';
    change(event: RdxTabsValueChangeEvent) {
        this.changes.push(event);
        if (this.policy === 'cancel') event.eventDetails.cancel();
        if (this.policy === 'replace') this.value.set(2);
    }
}

@Component({
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab],
    template: `
        <div
            #root="rdxTabsRoot"
            [defaultValue]="0"
            (onValueChange)="changes.push({ selected: root.value(), direction: root.activationDirection() })"
            rdxTabsRoot
        >
            <div rdxTabsList>
                <button [value]="0" rdxTabsTab>Zero</button>
                <button [value]="1" [disabled]="disabled()" rdxTabsTab>One</button>
            </div>
        </div>
    `
})
class UncontrolledHost {
    readonly disabled = signal(false);
    readonly changes: { selected: unknown; direction: string }[] = [];
}

describe('Tabs controlled ownership', () => {
    async function render(initial: unknown = 0) {
        const fixture = TestBed.createComponent(ControlledHost);
        fixture.componentInstance.value.set(initial);
        fixture.detectChanges();
        await fixture.whenStable();
        const root = fixture.debugElement.query(By.directive(RdxTabsRoot)).injector.get(RdxTabsRoot);
        const tabs = [...fixture.nativeElement.querySelectorAll('[role="tab"]')] as HTMLElement[];
        tabs.forEach((tab, index) =>
            vi
                .spyOn(tab, 'getBoundingClientRect')
                .mockReturnValue(DOMRect.fromRect({ x: index * 100, width: 100, height: 40 }))
        );
        return { fixture, root, tabs, host: fixture.componentInstance };
    }

    it.each([0, null, 99])('retains controlled %s when the parent ignores repeated requests', async (initial) => {
        const { fixture, root, tabs, host } = await render(initial);
        for (let index = 0; index < 2; index++) {
            tabs[1].click();
            expect(root.value()).toBe(initial);
            fixture.detectChanges();
            await fixture.whenStable();
            expect(root.value()).toBe(initial);
        }
        expect(host.changes.map((change) => change.value)).toEqual([1, 1]);
        expect(host.outputs).toEqual([1, 1]);
        expect(root.activationDirection()).toBe('none');
    });

    it('uses the parent replacement and derives rendered direction from the actual selection', async () => {
        const { fixture, root, tabs, host } = await render();
        host.policy = 'replace';
        tabs[1].click();
        expect(root.value()).toBe(0);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(root.value()).toBe(2);
        expect(host.outputs).toEqual([1]);
        tabs[1].click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(root.value()).toBe(2);
        expect(host.changes.map((change) => change.value)).toEqual([1, 1]);
    });

    it('accepts a delayed parent input without issuing another request', async () => {
        const { fixture, root, tabs, host } = await render();
        tabs[1].click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(root.value()).toBe(0);
        expect(root.activationDirection()).toBe('none');
        host.value.set(1);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(root.value()).toBe(1);
        expect(root.activationDirection()).toBe('right');
        expect(host.changes).toHaveLength(1);
        expect(host.outputs).toEqual([1]);
    });

    it('does not emit valueChange for canceled requests', async () => {
        const { fixture, root, tabs, host } = await render();
        host.policy = 'cancel';
        tabs[1].click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(root.value()).toBe(0);
        expect(host.changes).toHaveLength(1);
        expect(host.outputs).toEqual([]);
    });

    it('does not emit requests for external input changes', async () => {
        const { fixture, root, host } = await render();
        host.value.set(2);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(root.value()).toBe(2);
        expect(host.changes).toEqual([]);
        expect(host.outputs).toEqual([]);
    });

    it('publishes uncontrolled request and fallback state atomically before valueChange subscribers', async () => {
        const fixture = TestBed.createComponent(UncontrolledHost);
        fixture.detectChanges();
        await fixture.whenStable();
        const root = fixture.debugElement.query(By.directive(RdxTabsRoot)).injector.get(RdxTabsRoot);
        const tabs = [...fixture.nativeElement.querySelectorAll('[role="tab"]')] as HTMLElement[];
        tabs.forEach((tab, index) =>
            vi
                .spyOn(tab, 'getBoundingClientRect')
                .mockReturnValue(DOMRect.fromRect({ x: index * 100, width: 100, height: 40 }))
        );
        const outputs: unknown[] = [];
        root.valueChange.subscribe((value) =>
            outputs.push({ value, selected: root.value(), direction: root.activationDirection() })
        );
        tabs[1].click();
        expect(outputs).toEqual([{ value: 1, selected: 1, direction: 'right' }]);
        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(outputs).toEqual([
            { value: 1, selected: 1, direction: 'right' },
            { value: 0, selected: 0, direction: 'none' }
        ]);
        expect(fixture.componentInstance.changes).toEqual([
            { selected: 0, direction: 'none' },
            { selected: 0, direction: 'none' }
        ]);
    });
});
