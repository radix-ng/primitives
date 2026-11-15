import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DataOrientation, resetRdxDevWarnings } from '@radix-ng/primitives/core';
import { vi } from 'vitest';
import { RdxTabsList } from '../src/tabs-list';
import { RdxTabsPanel } from '../src/tabs-panel';
import { RdxTabsPanelPresence } from '../src/tabs-panel-presence';
import { RdxTabsRoot, RdxTabsValueChangeEvent } from '../src/tabs-root';
import { RdxTabsTab } from '../src/tabs-tab';
import { RdxTabsValue } from '../src/utils';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
    readonly value = signal<RdxTabsValue | undefined>(undefined);
    defaultValue: string | undefined = 'one';
    readonly orientation = signal<DataOrientation>('horizontal');
    readonly activateOnFocus = signal(false);
    readonly loopFocus = signal(true);
    readonly disabledTwo = signal(false);
    cancelNext = false;
    changes: RdxTabsValue[] = [];
    changeDetails: RdxTabsValueChangeEvent['eventDetails'][] = [];

    onValueChange(change: RdxTabsValueChangeEvent): void {
        this.changes.push(change.value);
        this.changeDetails.push(change.eventDetails);
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
        // jsdom has no layout: direction assertions use explicit geometry, while parity tests use real layout.
        tabs().forEach((tab, index) => {
            vi.spyOn(tab, 'getBoundingClientRect').mockReturnValue(
                DOMRect.fromRect({ x: index * 100, y: index * 50, width: 100, height: 40 })
            );
        });
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

    it('[APG Tabs] makes inactive panels inert and enables the newly selected panel', () => {
        const [one, two] = panels();
        expect(one.hasAttribute('inert')).toBe(false);
        expect(two.hasAttribute('inert')).toBe(true);

        tabs()[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();

        expect(one.hasAttribute('inert')).toBe(true);
        expect(two.hasAttribute('inert')).toBe(false);
    });

    it('exposes panel indexes from the composite list', async () => {
        await fixture.whenStable();
        fixture.detectChanges();

        expect(panels().map((panel) => panel.getAttribute('data-index'))).toEqual(['0', '1', '2']);
    });

    it('activates a tab on click and reveals its panel', () => {
        const [, two] = tabs();
        two.dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true }));
        fixture.detectChanges();

        expect(two.getAttribute('data-active')).toBe('');
        expect(panels()[1].hidden).toBe(false);
        expect(host.value()).toBe('two');
        expect(host.changes).toEqual(['two']);
        expect(host.changeDetails[0].reason).toBe('none');
        expect(host.changeDetails[0].activationDirection).toBe('right');
    });

    it('allows canceling selection before state updates', () => {
        host.cancelNext = true;

        const [, two] = tabs();
        two.dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true }));
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
        expect(two.disabled).toBe(false);
        two.dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true }));
        fixture.detectChanges();

        expect(two.getAttribute('data-active')).toBeNull();
        expect(host.value()).toBe('one');
    });

    it('activates composite Space through its click path', () => {
        const [, , three] = tabs();
        three.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
        fixture.detectChanges();
        expect(host.value()).toBe('three');
    });

    it('activates on focus only when activateOnFocus is set', () => {
        const [, , three] = tabs();

        three.focus();
        fixture.detectChanges();
        expect(host.value()).toBe('one');

        host.activateOnFocus.set(true);
        fixture.detectChanges();
        tabs()[0].focus();
        three.focus();
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

    it('moves focus to disabled tabs during arrow navigation without activating them', async () => {
        host.disabledTwo.set(true);
        fixture.detectChanges();

        const [one, two, three] = tabs();

        one.focus();
        one.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(two.getAttribute('aria-disabled')).toBe('true');
        expect(document.activeElement).toBe(two);
        expect(two.getAttribute('tabindex')).toBe('0');
        expect(three.getAttribute('tabindex')).toBe('-1');
        expect(host.value()).toBe('one');
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

    it('omits horizontal aria-orientation and exposes vertical aria-orientation', () => {
        const list = fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
        expect(list.getAttribute('data-orientation')).toBe('horizontal');
        expect(list.hasAttribute('aria-orientation')).toBe(false);

        host.orientation.set('vertical');
        fixture.detectChanges();

        expect(list.getAttribute('data-orientation')).toBe('vertical');
        expect(list.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('reports the activation direction on selection change', () => {
        const root = fixture.nativeElement.querySelector('[rdxTabsRoot]') as HTMLElement;

        tabs()[2].dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true }));
        fixture.detectChanges();
        expect(root.getAttribute('data-activation-direction')).toBe('right');

        tabs()[0].dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true }));
        fixture.detectChanges();
        expect(root.getAttribute('data-activation-direction')).toBe('left');
    });

    it('publishes request and fallback direction before synchronous model subscribers run', async () => {
        const root = fixture.debugElement.query(By.directive(RdxTabsRoot)).injector.get(RdxTabsRoot);
        const directions: string[] = [];
        root.value.subscribe(() => directions.push(root.activationDirection()));

        tabs()[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(directions).toEqual(['right']);
        await fixture.whenStable();

        host.disabledTwo.set(true);
        await fixture.whenStable();
        expect(directions).toEqual(['right', 'none']);
    });

    it.each([
        { orientation: 'horizontal' as const, forward: 'right', backward: 'left' },
        { orientation: 'vertical' as const, forward: 'down', backward: 'up' }
    ])(
        'updates direction for external $orientation changes and null restoration',
        async ({ orientation, forward, backward }) => {
            host.orientation.set(orientation);
            await fixture.whenStable();
            const element = fixture.nativeElement.querySelector('[rdxTabsRoot]') as HTMLElement;

            host.value.set('three');
            await fixture.whenStable();
            expect(element.getAttribute('data-activation-direction')).toBe(forward);
            host.value.set('one');
            await fixture.whenStable();
            expect(element.getAttribute('data-activation-direction')).toBe(backward);
            host.value.set(null);
            await fixture.whenStable();
            expect(element.getAttribute('data-activation-direction')).toBe('none');
            host.value.set('two');
            await fixture.whenStable();
            expect(element.getAttribute('data-activation-direction')).toBe('none');
            expect(host.changes).toEqual([]);
        }
    );

    it('reports no direction when registered tabs have equal coordinates', () => {
        tabs().forEach((tab) =>
            vi.mocked(tab.getBoundingClientRect).mockReturnValue(DOMRect.fromRect({ width: 100, height: 40 }))
        );
        tabs()[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(host.changeDetails[0].activationDirection).toBe('none');
        expect((fixture.nativeElement as HTMLElement).querySelector('[rdxTabsRoot]')).toHaveAttribute(
            'data-activation-direction',
            'none'
        );
    });
});

@Component({
    selector: 'test-projected-tabs',
    hostDirectives: [
        {
            directive: RdxTabsRoot,
            outputs: ['onValueChange']
        }
    ],
    imports: [RdxTabsList],
    template: `
        @if (showList()) {
            <div [activateOnFocus]="activateOnFocus()" rdxTabsList>
                <ng-content select="[rdxTabsTab]" />
            </div>
        }
        <ng-content />
    `
})
class ProjectedTabsWrapperComponent {
    readonly showList = input(true);
    readonly activateOnFocus = input(false);
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ProjectedTabsWrapperComponent, RdxTabsTab, RdxTabsPanel],
    template: `
        <test-projected-tabs
            [activateOnFocus]="activateOnFocus()"
            [showList]="showList()"
            (onValueChange)="onValueChange($event)"
        >
            <button rdxTabsTab value="one">One</button>
            <button rdxTabsTab value="two">Two</button>
            <button rdxTabsTab value="three">Three</button>
            <div rdxTabsPanel value="one">Panel one</div>
            <div rdxTabsPanel value="two">Panel two</div>
            <div rdxTabsPanel value="three">Panel three</div>
        </test-projected-tabs>
    `
})
class ProjectedTabsHostComponent {
    readonly showList = signal(true);
    readonly activateOnFocus = signal(false);
    readonly changes: RdxTabsValueChangeEvent[] = [];

    onValueChange(change: RdxTabsValueChangeEvent): void {
        this.changes.push(change);
    }
}

describe('Tabs projected through a hostDirectives wrapper', () => {
    let fixture: ComponentFixture<ProjectedTabsHostComponent>;
    let host: ProjectedTabsHostComponent;

    const tabs = () => Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    const panels = () => Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]')) as HTMLElement[];
    const root = () => fixture.debugElement.query(By.directive(RdxTabsRoot)).injector.get(RdxTabsRoot) as RdxTabsRoot;

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [ProjectedTabsHostComponent] });
        fixture = TestBed.createComponent(ProjectedTabsHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    it('keeps tabs in the tab-list composite and panels in the root list', async () => {
        const tabElements = tabs();
        const panelElements = panels();

        expect(tabElements.map((tab) => tab.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
        expect(tabElements.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
        expect(panelElements.map((panel) => panel.getAttribute('data-index'))).toEqual(['0', '1', '2']);
        expect(panelElements.map((panel) => panel.hidden)).toEqual([false, true, true]);

        tabElements[0].focus();
        tabElements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();
        expect(document.activeElement).toBe(tabElements[1]);

        tabElements[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();
        expect(document.activeElement).toBe(tabElements[2]);

        tabElements[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();
        expect(document.activeElement).toBe(tabElements[0]);

        tabElements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();
        expect(document.activeElement).toBe(tabElements[2]);
    });

    it('selects a projected tab on click', () => {
        tabs()[1].click();
        fixture.detectChanges();

        expect(root().value()).toBe('two');
        expect(tabs().map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
        expect(panels().map((panel) => panel.hidden)).toEqual([true, false, true]);
        expect(host.changes.at(-1)?.eventDetails.reason).toBe('none');
    });

    it('selects projected tabs on focus when activateOnFocus is enabled', async () => {
        host.activateOnFocus.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        tabs()[2].focus();
        fixture.detectChanges();

        expect(document.activeElement).toBe(tabs()[2]);
        expect(root().value()).toBe('three');
        expect(panels().map((panel) => panel.hidden)).toEqual([true, true, false]);
    });

    it('keeps the selected tab when the projected list is destroyed and recreated', async () => {
        host.activateOnFocus.set(true);
        tabs()[1].click();
        fixture.detectChanges();
        await fixture.whenStable();

        const tabsRoot = root();
        const firstCompositeRoot = tabsRoot.tabCompositeRoot();
        const firstCompositeList = tabsRoot.tabCompositeList();
        const changesBeforeUnmount = host.changes.length;

        expect(tabsRoot.value()).toBe('two');
        expect(tabsRoot.activateOnFocus()).toBe(true);
        expect(tabsRoot.tabMap().size).toBe(3);

        host.showList.set(false);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(tabs()).toHaveLength(0);
        expect(tabsRoot.tabListElement()).toBeNull();
        expect(tabsRoot.tabCompositeRoot()).toBeNull();
        expect(tabsRoot.tabCompositeList()).toBeNull();
        expect(tabsRoot.activateOnFocus()).toBe(false);
        // A temporary List absence must not look like removal of every tab to the selection effect.
        expect(tabsRoot.tabMap().size).toBe(3);
        expect(tabsRoot.value()).toBe('two');
        expect(host.changes).toHaveLength(changesBeforeUnmount);

        host.showList.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(tabsRoot.tabCompositeRoot()).not.toBe(firstCompositeRoot);
        expect(tabsRoot.tabCompositeList()).not.toBe(firstCompositeList);
        expect(tabsRoot.tabMap().size).toBe(3);
        expect(tabsRoot.activateOnFocus()).toBe(true);
        expect(tabsRoot.value()).toBe('two');
        expect(tabs().map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
        expect(panels().map((panel) => panel.hidden)).toEqual([true, false, true]);
        expect(host.changes).toHaveLength(changesBeforeUnmount);
    });

    it('ignores cleanup from an older tab-list registration', async () => {
        const replacementFixture = TestBed.createComponent(ProjectedTabsHostComponent);
        replacementFixture.detectChanges();
        await replacementFixture.whenStable();
        replacementFixture.detectChanges();

        const tabsRoot = root();
        const replacementRoot = replacementFixture.debugElement
            .query(By.directive(RdxTabsRoot))
            .injector.get(RdxTabsRoot);
        const firstCompositeRoot = tabsRoot.tabCompositeRoot();
        const firstCompositeList = tabsRoot.tabCompositeList();
        const replacementCompositeRoot = replacementRoot.tabCompositeRoot();
        const replacementCompositeList = replacementRoot.tabCompositeList();

        expect(firstCompositeRoot).not.toBeNull();
        expect(firstCompositeList).not.toBeNull();
        expect(replacementCompositeRoot).not.toBeNull();
        expect(replacementCompositeList).not.toBeNull();

        const staleElement = document.createElement('div');
        const replacementElement = document.createElement('div');
        const staleCleanup = tabsRoot.registerTabList(staleElement, firstCompositeRoot!, firstCompositeList!);
        const currentCleanup = tabsRoot.registerTabList(
            replacementElement,
            replacementCompositeRoot!,
            replacementCompositeList!
        );
        const currentMap = replacementRoot.tabMap();
        tabsRoot.tabMap.set(currentMap);
        tabsRoot.activateOnFocus.set(true);

        staleCleanup();

        expect(tabsRoot.tabListElement()).toBe(replacementElement);
        expect(tabsRoot.tabCompositeRoot()).toBe(replacementCompositeRoot);
        expect(tabsRoot.tabCompositeList()).toBe(replacementCompositeList);
        expect(tabsRoot.tabMap()).toBe(currentMap);
        expect(tabsRoot.activateOnFocus()).toBe(true);

        currentCleanup();

        expect(tabsRoot.tabListElement()).toBeNull();
        expect(tabsRoot.tabCompositeRoot()).toBeNull();
        expect(tabsRoot.tabCompositeList()).toBeNull();
        expect(tabsRoot.tabMap()).toBe(currentMap);
        expect(tabsRoot.activateOnFocus()).toBe(false);

        replacementFixture.destroy();
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div (onValueChange)="onValueChange($event)" rdxTabsRoot>
            <div rdxTabsList>
                <button [disabled]="firstDisabled()" [value]="0" rdxTabsTab>Zero</button>
                <button [value]="1" rdxTabsTab>One</button>
            </div>
            <div [value]="0" rdxTabsPanel>Panel zero</div>
            <div [value]="1" rdxTabsPanel>Panel one</div>
        </div>
    `,
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel]
})
class ImplicitDefaultHostComponent {
    readonly firstDisabled = signal(false);
    changes: RdxTabsValueChangeEvent[] = [];

    onValueChange(change: RdxTabsValueChangeEvent): void {
        this.changes.push(change);
        change.eventDetails.cancel();
    }
}

describe('Tabs implicit defaultValue', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ImplicitDefaultHostComponent] });
    });

    it('selects value 0 and emits an uncancelable initial change when defaultValue is omitted', async () => {
        const fixture = TestBed.createComponent(ImplicitDefaultHostComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const tabs = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
        const host = fixture.componentInstance;

        expect(tabs[0].getAttribute('aria-selected')).toBe('true');
        expect(host.changes.length).toBe(1);
        expect(host.changes[0].value).toBe(0);
        expect(host.changes[0].eventDetails.reason).toBe('initial');
        expect(host.changes[0].eventDetails.activationDirection).toBe('none');
    });

    it('falls back to the first enabled tab when the implicit tab is disabled', async () => {
        const fixture = TestBed.createComponent(ImplicitDefaultHostComponent);
        const host = fixture.componentInstance;
        host.firstDisabled.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const tabs = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];

        expect(tabs[0].getAttribute('aria-selected')).toBe('false');
        expect(tabs[1].getAttribute('aria-selected')).toBe('true');
        expect(host.changes.length).toBe(1);
        expect(host.changes[0].value).toBe(1);
        expect(host.changes[0].eventDetails.reason).toBe('initial');
    });

    it('falls back with reason disabled when the selected uncontrolled tab becomes disabled', async () => {
        const fixture = TestBed.createComponent(ImplicitDefaultHostComponent);
        const host = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        host.changes = [];
        host.firstDisabled.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const tabs = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];

        expect(tabs[0].getAttribute('aria-selected')).toBe('false');
        expect(tabs[1].getAttribute('aria-selected')).toBe('true');
        expect(host.changes.length).toBe(1);
        expect(host.changes[0].value).toBe(1);
        expect(host.changes[0].eventDetails.reason).toBe('disabled');
        expect(host.changes[0].eventDetails.activationDirection).toBe('none');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    template: `
        <div rdxTabsRoot defaultValue="one">
            <div rdxTabsList>
                <button rdxTabsTab value="one">One</button>
            </div>
            @if (renderStrayTab()) {
                <button class="stray" rdxTabsTab value="two">Two</button>
            }
            <div rdxTabsPanel value="one">Panel one</div>
            <div rdxTabsPanel value="two">Panel two</div>
        </div>
    `
})
class StrayTabHostComponent {
    readonly renderStrayTab = signal(true);
}

describe('Tabs diagnostics', () => {
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        resetRdxDevWarnings();
        warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        warn.mockRestore();
    });

    it('warns when a tab is rendered outside its list', async () => {
        TestBed.configureTestingModule({ imports: [StrayTabHostComponent] });
        const fixture = TestBed.createComponent(StrayTabHostComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('[rdx:tabs/tab-outside-list]'));
    });

    it('stays silent when every tab is inside the list', async () => {
        TestBed.configureTestingModule({ imports: [StrayTabHostComponent] });
        const fixture = TestBed.createComponent(StrayTabHostComponent);
        fixture.componentInstance.renderStrayTab.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(warn).not.toHaveBeenCalled();
    });

    it('stays silent while the list is unmounted', async () => {
        TestBed.configureTestingModule({ imports: [ProjectedTabsHostComponent] });
        const fixture = TestBed.createComponent(ProjectedTabsHostComponent);
        fixture.componentInstance.showList.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(warn).not.toHaveBeenCalled();
    });
});

@Component({
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    template: `
        <div [defaultValue]="defaultValue()" (onValueChange)="changes.push($event)" rdxTabsRoot>
            <div rdxTabsList>
                @for (value of values(); track value) {
                    <button [value]="value" rdxTabsTab>{{ value }}</button>
                }
            </div>
            @for (value of values(); track value) {
                <div [value]="value" rdxTabsPanel>Panel {{ value }}</div>
            }
        </div>
    `
})
class NullDefaultHostComponent {
    readonly defaultValue = input<RdxTabsValue>(null);
    readonly values = input<RdxTabsValue[]>([0, 1]);
    readonly changes: RdxTabsValueChangeEvent[] = [];
}

describe('Tabs explicit null defaultValue', () => {
    it.each([
        { kind: 'numeric', values: [0, 1] },
        { kind: 'string', values: ['one', 'two'] }
    ])('preserves no selection without notifications for $kind values and later defaults', async ({ values }) => {
        TestBed.configureTestingModule({ imports: [NullDefaultHostComponent] });
        const fixture = TestBed.createComponent(NullDefaultHostComponent);
        fixture.componentRef.setInput('values', values);
        await fixture.whenStable();

        const root = fixture.debugElement.query(By.directive(RdxTabsRoot)).injector.get(RdxTabsRoot);
        const element = fixture.nativeElement as HTMLElement;
        const expectNoSelection = () => {
            expect(root.value()).toBeNull();
            expect(element.querySelectorAll('[role="tab"][aria-selected="true"]')).toHaveLength(0);
            const panels = Array.from(element.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
            expect(panels).toHaveLength(2);
            expect(panels.every((panel) => panel.hidden)).toBe(true);
            expect(fixture.componentInstance.changes).toEqual([]);
        };
        expectNoSelection();

        fixture.componentRef.setInput('defaultValue', values[1]);
        await fixture.whenStable();
        expectNoSelection();
    });
});
