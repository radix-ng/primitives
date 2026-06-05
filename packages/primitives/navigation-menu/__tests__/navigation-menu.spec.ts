import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { navigationMenuImports, RdxNavigationMenuRoot } from '@radix-ng/primitives/navigation-menu';

@Component({
    imports: [...navigationMenuImports],
    template: `
        <nav #root="rdxNavigationMenuRoot" [defaultValue]="defaultValue" rdxNavigationMenuRoot>
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

            <ng-template rdxNavigationMenuPortalPresence>
                <div rdxNavigationMenuPortal>
                    <div rdxNavigationMenuPositioner>
                        <div data-test-popup rdxNavigationMenuPopup>
                            <div data-test-viewport rdxNavigationMenuViewport></div>
                        </div>
                    </div>
                </div>
            </ng-template>
        </nav>
    `
})
class HostComponent {
    defaultValue: string | null = null;
}

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

    it('opens-follows-focus: focusing a trigger only switches content while already open', () => {
        createComponent();
        const [one, two] = triggers();
        document.body.appendChild(fixture.nativeElement);

        // Closed: focusing a trigger must not open the menu.
        one.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(root().value()).toBeNull();

        // Open, then focus a sibling trigger → the shared popup follows focus.
        one.click();
        fixture.detectChanges();
        two.dispatchEvent(new FocusEvent('focus'));
        fixture.detectChanges();
        expect(root().value()).toBe('two');

        fixture.nativeElement.remove();
    });

    it('wires aria-controls to the content id', () => {
        createComponent();
        const [one] = triggers();
        expect(one.getAttribute('aria-controls')).toBe(root().contentId('one'));
    });

    it('renders the active content into the shared viewport', fakeAsync(() => {
        createComponent();
        triggers()[0].click();
        fixture.detectChanges();
        tick();

        const viewport = document.querySelector('[data-test-viewport]');
        expect(viewport?.textContent).toContain('One link');
        const content = document.getElementById(root().contentId('one'));
        expect(content).not.toBeNull();
    }));

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
});
