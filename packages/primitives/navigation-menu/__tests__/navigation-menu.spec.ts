import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    navigationMenuImports,
    RdxNavigationMenuOpenChange,
    RdxNavigationMenuRoot
} from '@radix-ng/primitives/navigation-menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [...navigationMenuImports],
    template: `
        <nav
            #root="rdxNavigationMenuRoot"
            [defaultValue]="defaultValue"
            (onOpenChange)="handleOpenChange($event)"
            rdxNavigationMenuRoot
        >
            <ul rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="one">
                    <button rdxNavigationMenuTrigger>One</button>
                    <ng-container *rdxNavigationMenuContent>
                        <div><a rdxNavigationMenuLink href="#">One link</a></div>
                    </ng-container>
                </li>
                <li rdxNavigationMenuItem value="two">
                    <button rdxNavigationMenuTrigger>Two</button>
                    <ng-container *rdxNavigationMenuContent>
                        <div><a rdxNavigationMenuLink href="#">Two link</a></div>
                    </ng-container>
                </li>
                <li rdxNavigationMenuItem>
                    <a rdxNavigationMenuLink href="#">Plain</a>
                </li>
            </ul>

            <ng-template rdxNavigationMenuPortal>
                <div data-test-backdrop rdxNavigationMenuBackdrop></div>
                <div data-test-positioner rdxNavigationMenuPositioner>
                    <div data-test-popup rdxNavigationMenuPopup>
                        <div data-test-viewport rdxNavigationMenuViewport></div>
                    </div>
                </div>
            </ng-template>
        </nav>
    `
})
class HostComponent {
    defaultValue: string | null = null;
    cancelClose = false;
    keepMountedOnClose = false;
    events: RdxNavigationMenuOpenChange[] = [];

    handleOpenChange(change: RdxNavigationMenuOpenChange) {
        this.events.push(change);

        if (!change.open && this.cancelClose) {
            change.eventDetails.cancel();
        }

        if (!change.open && this.keepMountedOnClose) {
            change.eventDetails.preventUnmountOnClose();
        }
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [...navigationMenuImports],
    template: `
        <nav defaultValue="outer" rdxNavigationMenuRoot>
            <ul rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="outer">
                    <button rdxNavigationMenuTrigger>Outer</button>
                    <ng-container *rdxNavigationMenuContent>
                        <nav defaultValue="nested" orientation="vertical" rdxNavigationMenuRoot>
                            <ul rdxNavigationMenuList>
                                <li rdxNavigationMenuItem value="nested">
                                    <button rdxNavigationMenuTrigger>Nested</button>
                                    <ng-container *rdxNavigationMenuContent>
                                        <a [closeOnClick]="true" data-test-nested-link rdxNavigationMenuLink href="#">
                                            Nested link
                                        </a>
                                    </ng-container>
                                </li>
                            </ul>
                            <div rdxNavigationMenuViewport></div>
                        </nav>
                    </ng-container>
                </li>
            </ul>

            <div rdxNavigationMenuViewport></div>
        </nav>
    `
})
class NestedHostComponent {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [...navigationMenuImports],
    template: `
        <nav rdxNavigationMenuRoot>
            <ul rdxNavigationMenuList>
                <li rdxNavigationMenuItem value="one">
                    <button rdxNavigationMenuTrigger>One</button>
                    <ng-template [forceMount]="true" rdxNavigationMenuContent>
                        <div data-test-force-content>Forced content</div>
                    </ng-template>
                </li>
            </ul>

            <ng-template [keepMounted]="true" rdxNavigationMenuPortal>
                <div data-test-keep-positioner rdxNavigationMenuPositioner>
                    <div data-test-keep-popup rdxNavigationMenuPopup>
                        <div data-test-keep-viewport rdxNavigationMenuViewport></div>
                    </div>
                </div>
            </ng-template>
        </nav>
    `
})
class KeepMountedHostComponent {}

describe('RdxNavigationMenu', () => {
    let fixture: ComponentFixture<HostComponent>;

    function createComponent() {
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        return fixture;
    }

    function root(): RdxNavigationMenuRoot {
        return fixture.debugElement.query(By.directive(RdxNavigationMenuRoot)).injector.get(RdxNavigationMenuRoot);
    }

    function triggers(): HTMLButtonElement[] {
        return fixture.debugElement.queryAll(By.css('button[rdxNavigationMenuTrigger]')).map((el) => el.nativeElement);
    }

    afterEach(() => fixture?.destroy());

    it('starts closed', () => {
        createComponent();
        expect(root().value()).toBeNull();
        expect(root().isOpen()).toBe(false);
        expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
    });

    it('opens and closes the matching item on click', () => {
        createComponent();
        const [one] = triggers();

        one.click();
        fixture.detectChanges();
        expect(root().value()).toBe('one');
        expect(one.getAttribute('aria-expanded')).toBe('true');
        expect(one.getAttribute('data-state')).toBe('open');

        one.click();
        fixture.detectChanges();
        expect(root().value()).toBeNull();
        expect(one.getAttribute('aria-expanded')).toBe('false');
    });

    it('switches the active item when another trigger is clicked', () => {
        createComponent();
        const [one, two] = triggers();

        one.click();
        fixture.detectChanges();
        two.click();
        fixture.detectChanges();

        expect(root().value()).toBe('two');
        expect(one.getAttribute('aria-expanded')).toBe('false');
        expect(two.getAttribute('aria-expanded')).toBe('true');
    });

    it('notifies the viewport with previous/next triggers on switch (drives the content morph)', () => {
        createComponent();
        const [one, two] = triggers();
        const calls: Array<[HTMLElement, HTMLElement]> = [];
        root().registerViewport((previous, next) => calls.push([previous, next]));

        one.click();
        fixture.detectChanges();
        two.click();
        fixture.detectChanges();

        // Regression: open() used to pre-set the trigger so previous === next and this never fired.
        expect(calls).toEqual([[one, two]]);
        expect(root().previousValue()).toBe('one');
    });

    it('keeps focus navigation separate from opening until the entry key is pressed', () => {
        createComponent();
        const [one, two] = triggers();
        document.body.appendChild(fixture.nativeElement);

        one.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(root().value()).toBeNull();

        one.click();
        fixture.detectChanges();
        two.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(root().value()).toBe('one');

        two.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
        fixture.detectChanges();
        expect(root().value()).toBe('two');

        fixture.nativeElement.remove();
    });

    it('moves top-level focus with horizontal arrow keys across triggers and links', async () => {
        createComponent();
        const [one, two] = triggers();
        const plainLink = fixture.nativeElement.querySelector<HTMLAnchorElement>('ul > li:last-child a');
        document.body.appendChild(fixture.nativeElement);

        one.focus();
        expect(document.activeElement).toBe(one);

        const leftBoundaryEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
        one.dispatchEvent(leftBoundaryEvent);
        await new Promise((resolve) => queueMicrotask(resolve));
        fixture.detectChanges();

        expect(leftBoundaryEvent.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(one);

        one.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
        await new Promise((resolve) => queueMicrotask(resolve));
        fixture.detectChanges();

        expect(document.activeElement).toBe(two);

        two.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
        await new Promise((resolve) => queueMicrotask(resolve));
        fixture.detectChanges();

        expect(document.activeElement).toBe(plainLink);

        const rightBoundaryEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
        plainLink?.dispatchEvent(rightBoundaryEvent);
        await new Promise((resolve) => queueMicrotask(resolve));
        fixture.detectChanges();

        expect(rightBoundaryEvent.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(plainLink);

        plainLink?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
        await new Promise((resolve) => queueMicrotask(resolve));
        fixture.detectChanges();

        expect(document.activeElement).toBe(two);

        two.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
        await new Promise((resolve) => queueMicrotask(resolve));
        fixture.detectChanges();

        expect(document.activeElement).toBe(one);

        fixture.nativeElement.remove();
    });

    it('wires aria-controls to the active popup id only while open', async () => {
        createComponent();
        const [one] = triggers();
        expect(one.hasAttribute('aria-haspopup')).toBe(false);
        expect(one.hasAttribute('aria-controls')).toBe(false);

        one.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const popup = document.querySelector('[data-test-popup]');
        expect(popup?.getAttribute('role')).toBeNull();
        expect(one.getAttribute('aria-controls')).toBe(popup?.id);
    });

    it('does not force menu roles on root or list', () => {
        createComponent();
        const host = fixture.nativeElement as HTMLElement;
        const nav = host.querySelector('[rdxNavigationMenuRoot]');
        const list = host.querySelector('[rdxNavigationMenuList]');

        expect(nav?.getAttribute('role')).toBeNull();
        expect(nav?.getAttribute('aria-label')).toBeNull();
        expect(list?.getAttribute('role')).toBeNull();
    });

    it('renders the active content into the shared viewport', async () => {
        createComponent();
        triggers()[0].click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const viewport = document.querySelector('[data-test-viewport]');
        expect(viewport?.textContent).toContain('One link');
        const content = document.getElementById(root().contentId('one'));
        expect(content).not.toBeNull();
    });

    it('moves focus inside the popup with horizontal arrow keys', async () => {
        createComponent();
        triggers()[0].click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const popup = document.querySelector<HTMLElement>('[data-test-popup]');
        const links = document.querySelectorAll<HTMLAnchorElement>('[data-test-viewport] a[rdxNavigationMenuLink]');
        expect(links.length).toBeGreaterThanOrEqual(1);
        expect(links[0].hasAttribute('tabindex')).toBe(false);

        const extraLink = document.createElement('a');
        extraLink.href = '#extra';
        extraLink.textContent = 'Extra link';
        links[0].after(extraLink);

        links[0].focus();
        expect(document.activeElement).toBe(links[0]);

        popup?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
        expect(document.activeElement).toBe(extraLink);

        popup?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
        expect(document.activeElement).toBe(links[0]);
    });

    it('keeps native Tab movement inside the popup until the last focusable', async () => {
        createComponent();
        triggers()[0].click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const popup = document.querySelector<HTMLElement>('[data-test-popup]');
        const links = document.querySelectorAll<HTMLAnchorElement>('[data-test-viewport] a[rdxNavigationMenuLink]');
        expect(links.length).toBeGreaterThanOrEqual(1);

        const extraLink = document.createElement('a');
        extraLink.href = '#extra';
        extraLink.textContent = 'Extra link';
        links[0].after(extraLink);

        links[0].focus();
        expect(document.activeElement).toBe(links[0]);

        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        popup?.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(links[0]);
    });

    it('moves Tab from the last popup focusable to the next top-level trigger', async () => {
        createComponent();
        const [, two] = triggers();
        triggers()[0].click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const popup = document.querySelector<HTMLElement>('[data-test-popup]');
        const link = document.querySelector<HTMLAnchorElement>('[data-test-viewport] a[rdxNavigationMenuLink]');
        link?.focus();
        expect(document.activeElement).toBe(link);

        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        popup?.dispatchEvent(event);
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(two);
        expect(root().value()).toBe('one');
    });

    it('moves Tab from the last popup focusable to the next top-level link', async () => {
        createComponent();
        const [, two] = triggers();
        two.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const popup = document.querySelector<HTMLElement>('[data-test-popup]');
        const popupLink = document.querySelector<HTMLAnchorElement>('[data-test-viewport] a[rdxNavigationMenuLink]');
        const plainLink = fixture.nativeElement.querySelector<HTMLAnchorElement>('ul > li:last-child a');
        popupLink?.focus();
        expect(document.activeElement).toBe(popupLink);

        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        popup?.dispatchEvent(event);
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(plainLink);
    });

    it('does not close when a link is clicked unless closeOnClick is enabled', async () => {
        createComponent();
        triggers()[0].click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const link = document.querySelector<HTMLAnchorElement>('[data-test-viewport] a[rdxNavigationMenuLink]');
        link?.click();
        fixture.detectChanges();

        expect(root().value()).toBe('one');
        expect(root().isOpen()).toBe(true);
    });

    it('applies defaultValue once', () => {
        fixture = TestBed.createComponent(HostComponent);
        fixture.componentInstance.defaultValue = 'two';
        fixture.detectChanges();
        expect(root().value()).toBe('two');
        expect(root().isOpen()).toBe(true);
    });

    it('closes via the public close() method', () => {
        createComponent();
        triggers()[0].click();
        fixture.detectChanges();

        root().close();
        fixture.detectChanges();
        expect(root().value()).toBeNull();
    });

    it('uses intentional outside-press timing', async () => {
        createComponent();
        triggers()[0].click();
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));

        document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
        fixture.detectChanges();
        expect(root().isOpen()).toBe(true);

        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        fixture.detectChanges();
        expect(root().isOpen()).toBe(false);
    });

    it('lets onOpenChange cancel closing before the value commits', () => {
        createComponent();
        const host = fixture.componentInstance;
        const [one] = triggers();

        one.click();
        fixture.detectChanges();

        host.cancelClose = true;
        one.click();
        fixture.detectChanges();

        expect(root().value()).toBe('one');
        expect(root().isOpen()).toBe(true);
        expect(host.events.at(-1)?.eventDetails.reason).toBe('trigger-press');
    });

    it('keeps the portal present when close requests preventUnmountOnClose', async () => {
        createComponent();
        const host = fixture.componentInstance;
        const [one] = triggers();

        one.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        host.keepMountedOnClose = true;
        one.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(root().isOpen()).toBe(false);
        expect(root().present()).toBe(true);
        expect(document.querySelector('[data-test-popup]')).not.toBeNull();
    });

    it('applies Base UI size CSS variables to popup and positioner', async () => {
        createComponent();
        triggers()[0].click();
        fixture.detectChanges();
        await fixture.whenStable();

        root().setSize({ width: 320, height: 180 });
        fixture.detectChanges();

        const popup = document.querySelector<HTMLElement>('[data-test-popup]');
        const positioner = document.querySelector<HTMLElement>('[data-test-positioner]');
        const viewport = document.querySelector<HTMLElement>('[data-test-viewport]');

        expect(popup?.style.getPropertyValue('--popup-width')).toBe('320px');
        expect(popup?.style.getPropertyValue('--popup-height')).toBe('180px');
        expect(positioner?.style.getPropertyValue('--positioner-width')).toBe('320px');
        expect(positioner?.style.getPropertyValue('--positioner-height')).toBe('180px');
        expect(viewport?.style.getPropertyValue('--popup-width')).toBe('');
    });

    it('marks the backdrop as presentational and non-selectable', async () => {
        createComponent();
        triggers()[0].click();
        fixture.detectChanges();
        await fixture.whenStable();

        const backdrop = document.querySelector<HTMLElement>('[data-test-backdrop]');
        expect(backdrop?.getAttribute('role')).toBe('presentation');
        expect(backdrop?.style.userSelect).toBe('none');
        expect(backdrop?.style.webkitUserSelect).toBe('none');
    });

    it('blocks list pointer events while the pointer traverses from trigger to popup', async () => {
        createComponent();
        const [one] = triggers();
        const list = fixture.nativeElement.querySelector('[rdxNavigationMenuList]') as HTMLElement;

        one.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const positioner = document.querySelector<HTMLElement>('[data-test-positioner]');
        expect(positioner).not.toBeNull();

        one.getBoundingClientRect = () =>
            ({
                top: 0,
                right: 100,
                bottom: 40,
                left: 0,
                width: 100,
                height: 40,
                x: 0,
                y: 0,
                toJSON: () => ({})
            }) as DOMRect;
        positioner!.getBoundingClientRect = () =>
            ({
                top: 60,
                right: 200,
                bottom: 160,
                left: 0,
                width: 200,
                height: 100,
                x: 0,
                y: 60,
                toJSON: () => ({})
            }) as DOMRect;

        one.dispatchEvent(new MouseEvent('pointerleave', { bubbles: false, clientX: 50, clientY: 40 }) as PointerEvent);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(list.style.pointerEvents).toBe('none');

        document.dispatchEvent(
            new MouseEvent('pointermove', { bubbles: true, clientX: 50, clientY: 70 }) as PointerEvent
        );
        positioner!.dispatchEvent(
            new MouseEvent('pointermove', { bubbles: true, clientX: 50, clientY: 70 }) as PointerEvent
        );
        fixture.detectChanges();
        await fixture.whenStable();

        expect(list.style.pointerEvents).toBe('');
    });
});

describe('RdxNavigationMenu nested behavior', () => {
    let fixture: ComponentFixture<NestedHostComponent>;

    afterEach(() => fixture?.destroy());

    it('closes the parent root when a nested link is selected', async () => {
        fixture = TestBed.createComponent(NestedHostComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const roots = fixture.debugElement
            .queryAll(By.directive(RdxNavigationMenuRoot))
            .map((el) => el.injector.get(RdxNavigationMenuRoot));
        expect(roots.length).toBe(2);
        expect(roots[0].value()).toBe('outer');
        expect(roots[1].value()).toBe('nested');

        const link = fixture.nativeElement.querySelector('[data-test-nested-link]') as HTMLAnchorElement;
        link.click();
        fixture.detectChanges();

        expect(roots[0].value()).toBeNull();
        expect(roots[1].value()).toBeNull();
    });

    it('keeps nested roots composite-managed and leaves arrow keys to the parent content', async () => {
        fixture = TestBed.createComponent(NestedHostComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const nestedTrigger = fixture.nativeElement.querySelectorAll(
            'button[rdxNavigationMenuTrigger]'
        )[1] as HTMLButtonElement;
        expect(nestedTrigger.getAttribute('tabindex')).toBe('0');

        const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
        nestedTrigger.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);

        const entryArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
        nestedTrigger.dispatchEvent(entryArrowEvent);
        expect(entryArrowEvent.defaultPrevented).toBe(false);

        const activationEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
        nestedTrigger.dispatchEvent(activationEvent);
        expect(activationEvent.defaultPrevented).toBe(true);
    });
});

describe('RdxNavigationMenu keepMounted behavior', () => {
    let fixture: ComponentFixture<KeepMountedHostComponent>;

    afterEach(() => fixture?.destroy());

    it('keeps the portal and force-mounted content in the DOM while closed', async () => {
        fixture = TestBed.createComponent(KeepMountedHostComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const popup = document.querySelector<HTMLElement>('[data-test-keep-popup]');
        const content = document.querySelector<HTMLElement>('[data-test-force-content]');

        expect(popup).not.toBeNull();
        expect(content).not.toBeNull();
        expect(content?.parentElement?.hidden).toBe(true);
        expect(content?.parentElement?.getAttribute('aria-hidden')).toBe('true');
    });

    it('preserves force-mounted content when its item closes', async () => {
        fixture = TestBed.createComponent(KeepMountedHostComponent);
        fixture.detectChanges();

        const root = fixture.debugElement
            .query(By.directive(RdxNavigationMenuRoot))
            .injector.get(RdxNavigationMenuRoot);
        const trigger = fixture.nativeElement.querySelector('button[rdxNavigationMenuTrigger]') as HTMLButtonElement;

        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const content = document.querySelector<HTMLElement>('[data-test-force-content]');
        expect(content?.parentElement?.hidden).toBe(false);
        expect(root.value()).toBe('one');

        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(root.value()).toBeNull();
        expect(document.querySelector('[data-test-force-content]')).toBe(content);
        expect(content?.parentElement?.hidden).toBe(true);
    });
});

describe('NavigationMenu structural portal', () => {
    it('throws in dev mode when rdxNavigationMenuPortal is used as an attribute instead of structurally', () => {
        @Component({
            changeDetection: ChangeDetectionStrategy.Eager,
            imports: [...navigationMenuImports],
            template: `
                <nav rdxNavigationMenuRoot>
                    <ul rdxNavigationMenuList></ul>

                    <div rdxNavigationMenuPortal>
                        <div rdxNavigationMenuPositioner>
                            <div rdxNavigationMenuPopup>Oops</div>
                        </div>
                    </div>
                </nav>
            `
        })
        class MisuseHost {}

        expect(() => {
            const fixture = TestBed.createComponent(MisuseHost);
            fixture.detectChanges();
        }).toThrow(/structural directive/);
    });
});
