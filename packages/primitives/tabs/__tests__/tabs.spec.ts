import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataOrientation } from '@radix-ng/primitives/core';
import { RdxTabsList } from '../src/tabs-list';
import { RdxTabsPanel } from '../src/tabs-panel';
import { RdxTabsPanelPresence } from '../src/tabs-panel-presence';
import { RdxTabsRoot, RdxTabsValueChangeEvent } from '../src/tabs-root';
import { RdxTabsTab } from '../src/tabs-tab';

@Component({
    template: `
        <div
            [(value)]="value"
            [defaultValue]="defaultValue"
            [orientation]="orientation()"
            (onValueChange)="onValueChange($event)"
            rdxTabsRoot
        >
            <div [activateOnFocus]="activateOnFocus()" [loopFocus]="loopFocus()" rdxTabsList>
                <button rdxTabsTab value="one">One</button>
                <button [disabled]="disabledTwo()" rdxTabsTab value="two">Two</button>
                <button rdxTabsTab value="three">Three</button>
            </div>
            <div rdxTabsPanel value="one">Panel one</div>
            <div rdxTabsPanel value="two">Panel two</div>
            <div rdxTabsPanel value="three">Panel three</div>
        </div>
    `,
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel]
})
class TestHostComponent {
    readonly value = signal<string | undefined>(undefined);
    defaultValue: string | undefined = 'one';
    readonly orientation = signal<DataOrientation>('horizontal');
    readonly activateOnFocus = signal(false);
    readonly loopFocus = signal(true);
    readonly disabledTwo = signal(false);
    cancelNext = false;
    changes: string[] = [];

    onValueChange(change: RdxTabsValueChangeEvent): void {
        this.changes.push(change.value);
        if (this.cancelNext) {
            change.eventDetails.cancel();
            this.cancelNext = false;
        }
    }
}

describe('Tabs', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;

    const tabs = () => Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    const panels = () => Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]')) as HTMLElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestHostComponent] });
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('renders tablist / tab / tabpanel roles', () => {
        expect(fixture.nativeElement.querySelector('[role="tablist"]')).toBeTruthy();
        expect(tabs().length).toBe(3);
        expect(panels().length).toBe(3);
    });

    it('selects the defaultValue tab and marks it active', () => {
        const [one, two] = tabs();
        expect(one.getAttribute('data-active')).toBe('');
        expect(one.getAttribute('aria-selected')).toBe('true');
        expect(one.getAttribute('tabindex')).toBe('0');
        expect(two.getAttribute('data-active')).toBeNull();
        expect(two.getAttribute('tabindex')).toBe('-1');
    });

    it('wires aria-controls / aria-labelledby between tab and panel', () => {
        const [one] = tabs();
        const panelOne = panels()[0];
        expect(one.getAttribute('aria-controls')).toBe(panelOne.id);
        expect(panelOne.getAttribute('aria-labelledby')).toBe(one.id);
    });

    it('hides inactive panels', () => {
        const [, panelTwo] = panels();
        expect(panelTwo.hidden).toBe(true);
        expect(panelTwo.getAttribute('data-hidden')).toBe('');
    });

    it('activates a tab on click and reveals its panel', () => {
        const [, two] = tabs();
        two.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
        fixture.detectChanges();

        expect(two.getAttribute('data-active')).toBe('');
        expect(panels()[1].hidden).toBe(false);
        expect(host.value()).toBe('two');
        expect(host.changes).toEqual(['two']);
    });

    it('allows canceling selection before state updates', () => {
        host.cancelNext = true;

        const [, two] = tabs();
        two.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
        fixture.detectChanges();

        expect(host.value()).toBe('one');
        expect(host.changes).toEqual(['two']);
        expect(two.getAttribute('data-active')).toBeNull();
    });

    it('does not activate a disabled tab on click', () => {
        host.disabledTwo.set(true);
        fixture.detectChanges();

        const [, two] = tabs();
        expect(two.getAttribute('data-disabled')).toBe('');
        two.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
        fixture.detectChanges();

        expect(two.getAttribute('data-active')).toBeNull();
        expect(host.value()).toBe('one');
    });

    it('activates on Enter / Space', () => {
        const [, , three] = tabs();
        three.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        fixture.detectChanges();
        expect(host.value()).toBe('three');
    });

    it('activates on focus only when activateOnFocus is set', () => {
        const [, , three] = tabs();

        three.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(host.value()).toBe('one');

        host.activateOnFocus.set(true);
        fixture.detectChanges();
        three.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(host.value()).toBe('three');
    });

    it('moves focus with arrow keys without selecting when activateOnFocus is false', async () => {
        const [one, two] = tabs();

        one.focus();
        one.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(document.activeElement).toBe(two);
        expect(one.getAttribute('tabindex')).toBe('-1');
        expect(two.getAttribute('tabindex')).toBe('0');
        expect(host.value()).toBe('one');
    });

    it('selects the focused tab during arrow navigation when activateOnFocus is true', async () => {
        host.activateOnFocus.set(true);
        fixture.detectChanges();

        const [one, two] = tabs();

        one.focus();
        one.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(document.activeElement).toBe(two);
        expect(host.value()).toBe('two');
    });

    it('supports Home and End key navigation', async () => {
        const [one, , three] = tabs();

        one.focus();
        one.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(document.activeElement).toBe(three);
        expect(three.getAttribute('tabindex')).toBe('0');

        three.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(document.activeElement).toBe(one);
        expect(one.getAttribute('tabindex')).toBe('0');
    });

    it('does not loop arrow navigation when loopFocus is false', async () => {
        host.loopFocus.set(false);
        fixture.detectChanges();

        const [one] = tabs();

        one.focus();
        one.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(document.activeElement).toBe(one);
        expect(one.getAttribute('tabindex')).toBe('0');
    });

    it('skips disabled tabs during arrow navigation', async () => {
        host.disabledTwo.set(true);
        fixture.detectChanges();

        const [one, two, three] = tabs();

        one.focus();
        one.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(two.getAttribute('aria-disabled')).toBe('true');
        expect(document.activeElement).toBe(three);
        expect(two.getAttribute('tabindex')).toBe('-1');
        expect(three.getAttribute('tabindex')).toBe('0');
    });

    it('does not give tabindex 0 to a disabled selected tab', async () => {
        host.disabledTwo.set(true);
        host.value.set('two');
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const [one, two] = tabs();

        expect(two.getAttribute('aria-selected')).toBe('true');
        expect(two.getAttribute('tabindex')).toBe('-1');
        expect(one.getAttribute('tabindex')).toBe('0');
    });

    it('exposes data-orientation and aria-orientation', () => {
        host.orientation.set('vertical');
        fixture.detectChanges();

        const list = fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
        expect(list.getAttribute('data-orientation')).toBe('vertical');
        expect(list.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('reports the activation direction on selection change', () => {
        const root = fixture.nativeElement.querySelector('[rdxTabsRoot]') as HTMLElement;

        tabs()[2].dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
        fixture.detectChanges();
        expect(root.getAttribute('data-activation-direction')).toBe('right');

        tabs()[0].dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
        fixture.detectChanges();
        expect(root.getAttribute('data-activation-direction')).toBe('left');
    });
});

@Component({
    template: `
        <div [(value)]="value" defaultValue="one" rdxTabsRoot>
            <div rdxTabsList>
                <button rdxTabsTab value="one">One</button>
                <button rdxTabsTab value="two">Two</button>
            </div>
            <div [keepMounted]="keepMounted()" rdxTabsPanel value="one">
                <p class="content-one" *rdxTabsPanelPresence>Panel one</p>
            </div>
            <div [keepMounted]="keepMounted()" rdxTabsPanel value="two">
                <p class="content-two" *rdxTabsPanelPresence>Panel two</p>
            </div>
        </div>
    `,
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence]
})
class PresenceHostComponent {
    readonly value = signal<string | undefined>(undefined);
    readonly keepMounted = signal(false);
}

describe('Tabs with *rdxTabsPanelPresence', () => {
    let fixture: ComponentFixture<PresenceHostComponent>;
    let host: PresenceHostComponent;

    const content = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement | null;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [PresenceHostComponent] });
        fixture = TestBed.createComponent(PresenceHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('mounts only the active panel contents', () => {
        expect(content('.content-one')).toBeTruthy();
        expect(content('.content-two')).toBeNull();
    });

    it('unmounts the previous panel and mounts the next on selection change', async () => {
        host.value.set('two');
        fixture.detectChanges();
        // The presence directive defers the unmount decision to the next render.
        await fixture.whenStable();
        fixture.detectChanges();

        expect(content('.content-two')).toBeTruthy();
        expect(content('.content-one')).toBeNull();
    });

    it('keeps inactive panel contents mounted when keepMounted is set', () => {
        host.keepMounted.set(true);
        fixture.detectChanges();

        expect(content('.content-one')).toBeTruthy();
        expect(content('.content-two')).toBeTruthy();
    });
});
