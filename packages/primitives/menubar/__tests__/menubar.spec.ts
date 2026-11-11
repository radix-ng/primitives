import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxMenuModule, RdxMenuRoot, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';

function keydown(target: Element, key: string) {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

const flushMicrotasks = () => Promise.resolve();

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxMenubarRoot, RdxMenuModule],
    template: `
        <div [orientation]="orientation()" rdxMenubarRoot>
            <ng-container
                #fileMenu="rdxMenuRoot"
                [defaultOpen]="fileDefaultOpen()"
                [disabled]="fileDisabled()"
                rdxMenuRoot
            >
                <button rdxMenuTrigger>File</button>
                @if (fileMenu.open()) {
                    <div rdxMenuPositioner>
                        <div rdxMenuPopup>
                            <button rdxMenuItem>New Tab</button>
                            <button rdxMenuItem>New Window</button>
                            @if (showChild()) {
                                <ng-container rdxMenuSubmenuRoot>
                                    <button rdxMenuSubTrigger>Export</button>
                                </ng-container>
                            }
                        </div>
                    </div>
                }
            </ng-container>

            <ng-container #editMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger>Edit</button>
                @if (editMenu.open()) {
                    <div rdxMenuPositioner>
                        <div rdxMenuPopup>
                            <button rdxMenuItem>Undo</button>
                        </div>
                    </div>
                }
            </ng-container>

            <ng-container #viewMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger>View</button>
                @if (viewMenu.open()) {
                    <div rdxMenuPositioner>
                        <div rdxMenuPopup>
                            <button rdxMenuItem>Reload</button>
                        </div>
                    </div>
                }
            </ng-container>
        </div>
    `
})
class MenubarHost {
    readonly fileDisabled = signal(false);
    readonly fileDefaultOpen = signal(false);
    readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
    readonly showChild = signal(false);
    readonly bar = viewChild.required(RdxMenubarRoot);
    readonly fileMenu = viewChild.required(RdxMenuRoot);
    readonly editMenu = viewChild.required<RdxMenuRoot>('editMenu');
}

@Component({
    imports: [RdxMenubarRoot, RdxMenuModule],
    template: `
        <div rdxMenubarRoot>
            <ng-container #menu="rdxMenuRoot" [open]="open()" rdxMenuRoot>
                <button rdxMenuTrigger>File</button>
                @if (menu.open()) {
                    <div rdxMenuPositioner>
                        <div rdxMenuPopup><button rdxMenuItem>New</button></div>
                    </div>
                }
            </ng-container>
        </div>
    `
})
class BoundMenubarHost {
    readonly open = signal(false);
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxMenubarRoot, RdxMenuModule],
    template: `
        <div rdxMenubarRoot>
            <ng-container #fileMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger>File</button>
                @if (fileMenu.open()) {
                    <div rdxMenuPositioner>
                        <div rdxMenuPopup>
                            <button rdxMenuItem>New</button>
                            <button rdxMenuItem>Open</button>
                        </div>
                    </div>
                }
            </ng-container>

            <ng-container #editMenu="rdxMenuRoot" rdxMenuRoot>
                <button [disabled]="true" rdxMenuTrigger>Edit</button>
                @if (editMenu.open()) {
                    <div rdxMenuPositioner>
                        <div rdxMenuPopup>
                            <button rdxMenuItem>Undo</button>
                        </div>
                    </div>
                }
            </ng-container>

            <ng-container #viewMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger>View</button>
                @if (viewMenu.open()) {
                    <div rdxMenuPositioner>
                        <div rdxMenuPopup>
                            <button rdxMenuItem>Reload</button>
                        </div>
                    </div>
                }
            </ng-container>
        </div>
    `
})
class MenubarWithDisabledHost {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxMenubarRoot, RdxMenuModule],
    template: `
        <div rdxMenubarRoot>
            <ng-container #fileMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger>File</button>
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>New Tab</button>
                    </div>
                </div>
            </ng-container>

            <ng-container #editMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger>Edit</button>
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>Undo</button>
                    </div>
                </div>
            </ng-container>

            <ng-container #viewMenu="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger>View</button>
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>Reload</button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
class MenubarWithAlwaysMountedPopupsHost {}

function pointerEnter(el: Element) {
    const event =
        typeof PointerEvent === 'undefined'
            ? new Event('pointerenter', { bubbles: true })
            : new PointerEvent('pointerenter', { bubbles: true, pointerType: 'mouse' });

    Object.defineProperty(event, 'pointerType', { value: 'mouse' });
    el.dispatchEvent(event);
}

describe('Menubar', () => {
    let fixture: ComponentFixture<MenubarHost>;
    let triggers: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [MenubarHost] });
        fixture = TestBed.createComponent(MenubarHost);
        fixture.detectChanges();
        triggers = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuTrigger]'));
    });

    it('retains the active top-level registration when a descendant submenu mounts and unmounts', async () => {
        triggers[0].click();
        await fixture.whenStable();
        const active = fixture.componentInstance.bar().activeId();
        expect(active).not.toBeNull();
        for (const visible of [true, false]) {
            fixture.componentInstance.showChild.set(visible);
            fixture.detectChanges();
            await fixture.whenStable();
            expect(fixture.componentInstance.bar().activeId()).toBe(active);
            expect(fixture.componentInstance.fileMenu().open()).toBe(true);
        }
    });

    it('root has role="menubar" and horizontal orientation', () => {
        const root: HTMLElement = fixture.nativeElement.querySelector('[rdxMenubarRoot]');
        expect(root.getAttribute('role')).toBe('menubar');
        expect(root.getAttribute('data-orientation')).toBe('horizontal');
        expect(root.hasAttribute('tabindex')).toBe(false);
    });

    it('enters interaction mode for an initially default-open menu', async () => {
        fixture.destroy();
        fixture = TestBed.createComponent(MenubarHost);
        fixture.componentInstance.fileDefaultOpen.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(fixture.componentInstance.fileMenu().open()).toBe(true);
        expect(fixture.nativeElement.querySelector('[rdxMenubarRoot]').hasAttribute('data-has-submenu-open')).toBe(
            true
        );
    });

    it('updates interaction mode when an Angular binding changes open state', async () => {
        const bound = TestBed.createComponent(BoundMenubarHost);
        bound.detectChanges();
        const bar: HTMLElement = bound.nativeElement.querySelector('[rdxMenubarRoot]');
        bound.componentInstance.open.set(true);
        await bound.whenStable();
        expect(bar.hasAttribute('data-has-submenu-open')).toBe(true);
        bound.componentInstance.open.set(false);
        await bound.whenStable();
        expect(bar.hasAttribute('data-has-submenu-open')).toBe(false);
    });

    it('triggers have role="menuitem" and aria-haspopup="menu"', () => {
        triggers.forEach((t) => {
            expect(t.getAttribute('role')).toBe('menuitem');
            expect(t.getAttribute('aria-haspopup')).toBe('menu');
        });
    });

    it('puts only the current trigger in the tab order', () => {
        expect(triggers[0].getAttribute('tabindex')).toBe('0');
        expect(triggers[1].getAttribute('tabindex')).toBe('-1');
        expect(triggers[2].getAttribute('tabindex')).toBe('-1');

        keydown(triggers[0], 'ArrowRight');
        fixture.detectChanges();

        expect(triggers[0].getAttribute('tabindex')).toBe('-1');
        expect(triggers[1].getAttribute('tabindex')).toBe('0');
        expect(triggers[2].getAttribute('tabindex')).toBe('-1');
    });

    it('keeps an enabled Tab entry when the focused trigger becomes disabled', async () => {
        triggers[0].focus();
        fixture.detectChanges();
        fixture.componentInstance.fileDisabled.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(triggers[0].disabled).toBe(true);
        expect(triggers[0].tabIndex).toBe(-1);
        expect(triggers.filter((trigger) => !trigger.disabled && trigger.tabIndex === 0)).toHaveLength(1);
        triggers[1].focus();
        keydown(triggers[1], 'ArrowRight');
        fixture.detectChanges();
        expect(document.activeElement).toBe(triggers[2]);
    });

    it('reopens a vertical navigation return through native trigger focus', async () => {
        fixture.componentInstance.orientation.set('vertical');
        fixture.detectChanges();
        keydown(triggers[0], 'ArrowRight');
        fixture.detectChanges();
        await fixture.whenStable();
        const root = fixture.componentInstance.fileMenu();
        const changes: RdxMenuOpenChange[] = [];
        const preventedAtClose: boolean[] = [];
        const completions: boolean[] = [];
        root.onOpenChangeComplete.subscribe((open) => completions.push(open));
        root.onOpenChange.subscribe((change) => {
            changes.push(change);
            if (!change.open) preventedAtClose.push(change.event.defaultPrevented);
        });
        const popup = fixture.nativeElement.querySelector('[rdxMenuPopup]') as HTMLElement;
        popup.querySelector<HTMLElement>('[rdxMenuItem]')!.focus();
        const highlightedIndex = root.activeIndex();
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
        popup.dispatchEvent(event);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(root.open()).toBe(true);
        expect(changes.map(({ open, reason }) => ({ open, reason }))).toEqual([
            { open: false, reason: 'list-navigation' },
            { open: true, reason: 'trigger-focus' }
        ]);
        expect(changes[0].event).toBe(event);
        expect(changes[1].event).toBeInstanceOf(FocusEvent);
        expect(preventedAtClose).toEqual([true]);
        expect(root.activeIndex()).toBe(highlightedIndex);
        expect(fixture.nativeElement.querySelector('[rdxMenuPopup]')).toBe(popup);
        expect(completions).not.toContain(false);
        expect(document.activeElement).toBe(triggers[0]);
        expect(fixture.nativeElement.querySelector('[rdxMenubarRoot]').hasAttribute('data-has-submenu-open')).toBe(
            true
        );
        keydown(triggers[0], 'Escape');
        fixture.detectChanges();
        await fixture.whenStable();
        expect(root.open()).toBe(false);
        expect(fixture.nativeElement.querySelector('[rdxMenubarRoot]').hasAttribute('data-has-submenu-open')).toBe(
            false
        );
    });

    it('does not close a disabled vertical menu through its return arrow', async () => {
        fixture.componentInstance.orientation.set('vertical');
        fixture.detectChanges();
        keydown(triggers[0], 'ArrowRight');
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.componentInstance.fileDisabled.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        const popup = fixture.nativeElement.querySelector('[rdxMenuPopup]') as HTMLElement;
        popup.focus();
        keydown(popup, 'ArrowLeft');
        fixture.detectChanges();
        expect(fixture.componentInstance.fileMenu().open()).toBe(true);
    });

    it('click opens a menu', () => {
        triggers[0].click();
        fixture.detectChanges();

        expect(triggers[0].hasAttribute('data-popup-open')).toBe(true);
        expect(fixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(1);
    });

    it('click again closes the menu', () => {
        triggers[0].click();
        fixture.detectChanges();
        triggers[0].click();
        fixture.detectChanges();

        expect(triggers[0].hasAttribute('data-popup-open')).toBe(false);
        expect(fixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(0);
    });

    it('does NOT open on hover when nothing is open', () => {
        pointerEnter(triggers[1]);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(0);
    });

    it('hovering a sibling trigger switches the open menu', () => {
        // Open File first
        triggers[0].click();
        fixture.detectChanges();
        expect(triggers[0].hasAttribute('data-popup-open')).toBe(true);

        // Hover Edit — should close File and open Edit
        pointerEnter(triggers[1]);
        fixture.detectChanges();

        expect(triggers[0].hasAttribute('data-popup-open')).toBe(false);
        expect(triggers[1].hasAttribute('data-popup-open')).toBe(true);
        // exactly one popup open at a time
        expect(fixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(1);
    });

    it('preserves a retained hover open and its pre-open return focus', async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ imports: [MenubarWithAlwaysMountedPopupsHost] });
        const mountedFixture = TestBed.createComponent(MenubarWithAlwaysMountedPopupsHost);
        mountedFixture.detectChanges();
        const mountedTriggers: HTMLButtonElement[] = Array.from(
            mountedFixture.nativeElement.querySelectorAll('[rdxMenuTrigger]')
        );

        const settle = async () => {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            // Let the dismissable-layer focus-outside check (two microtasks) settle.
            await Promise.resolve();
            await Promise.resolve();
            mountedFixture.detectChanges();
        };

        // Open File and let its auto-focus + the async focus-outside check fully settle, exactly as
        // it would before the user moves the pointer to a sibling trigger.
        mountedTriggers[0].click();
        mountedFixture.detectChanges();
        await settle();
        expect(mountedTriggers[0].hasAttribute('data-popup-open')).toBe(true);

        // Hover Edit — focuses the trigger and opens Edit without pulling focus into the popup.
        // With always-mounted popups, every dismissable layer (and its focus listener) already
        // exists, so focusing the trigger schedules an async focus-outside check on Edit's layer.
        pointerEnter(mountedTriggers[1]);
        mountedTriggers[1].focus();
        mountedFixture.detectChanges();
        expect(mountedTriggers[1].hasAttribute('data-popup-open')).toBe(true);

        // The focus-outside check resolves after a couple of microtasks; the trigger must be a
        // dismissable-layer branch so the freshly opened popup is not dismissed.
        await settle();

        expect(mountedTriggers[0].hasAttribute('data-popup-open')).toBe(false);
        expect(mountedTriggers[1].hasAttribute('data-popup-open')).toBe(true);

        const popup = mountedFixture.nativeElement.querySelectorAll('[rdxMenuPopup]')[1];
        keydown(popup, 'Escape');
        mountedFixture.detectChanges();
        await settle();
        expect(mountedTriggers[1].hasAttribute('data-popup-open')).toBe(false);
        expect(document.activeElement).toBe(mountedTriggers[0]);
    });

    it('hovering a sibling trigger switches always-mounted top-level popups', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ imports: [MenubarWithAlwaysMountedPopupsHost] });
        const mountedFixture = TestBed.createComponent(MenubarWithAlwaysMountedPopupsHost);
        mountedFixture.detectChanges();
        const mountedTriggers: HTMLButtonElement[] = Array.from(
            mountedFixture.nativeElement.querySelectorAll('[rdxMenuTrigger]')
        );
        const mountedPopups: HTMLElement[] = Array.from(
            mountedFixture.nativeElement.querySelectorAll('[rdxMenuPopup]')
        );

        expect(mountedPopups.length).toBe(3);

        pointerEnter(mountedTriggers[1]);
        mountedFixture.detectChanges();

        expect(mountedTriggers[1].hasAttribute('data-popup-open')).toBe(false);

        mountedTriggers[0].click();
        mountedFixture.detectChanges();

        expect(mountedTriggers[0].hasAttribute('data-popup-open')).toBe(true);
        expect(mountedPopups[0].hasAttribute('data-open')).toBe(true);

        pointerEnter(mountedTriggers[1]);
        mountedFixture.detectChanges();

        expect(mountedTriggers[0].hasAttribute('data-popup-open')).toBe(false);
        expect(mountedTriggers[1].hasAttribute('data-popup-open')).toBe(true);
        expect(mountedPopups[0].hasAttribute('data-open')).toBe(false);
        expect(mountedPopups[1].hasAttribute('data-open')).toBe(true);
    });

    it('ArrowRight moves focus to next trigger and opens it when a menu was open', async () => {
        triggers[0].click();
        fixture.detectChanges();

        keydown(triggers[0], 'ArrowRight');
        await flushMicrotasks();
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggers[1]);
        expect(triggers[1].hasAttribute('data-popup-open')).toBe(true);
        expect(triggers[0].hasAttribute('data-popup-open')).toBe(false);
    });

    it('ArrowDown after switching an open menubar moves focus into the current popup', async () => {
        triggers[0].click();
        fixture.detectChanges();

        keydown(triggers[0], 'ArrowRight');
        await flushMicrotasks();
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggers[1]);
        expect(triggers[1].hasAttribute('data-popup-open')).toBe(true);

        keydown(triggers[1], 'ArrowDown');
        fixture.detectChanges();

        const item: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuPopup][data-open] [rdxMenuItem]');
        expect(document.activeElement).toBe(item);
        expect(item.textContent?.trim()).toContain('Undo');
    });

    it('ArrowRight from an open menu item switches to the next trigger menu', async () => {
        triggers[0].focus();
        keydown(triggers[0], 'ArrowDown');
        fixture.detectChanges();
        await fixture.whenStable();
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        fixture.detectChanges();

        const item: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuItem]');
        expect(document.activeElement).toBe(item);

        keydown(item, 'ArrowRight');
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggers[1]);
        expect(triggers[0].hasAttribute('data-popup-open')).toBe(false);
        expect(triggers[1].hasAttribute('data-popup-open')).toBe(true);
    });

    it('ArrowRight wraps to the first trigger from the last', async () => {
        triggers[2].click();
        fixture.detectChanges();

        keydown(triggers[2], 'ArrowRight');
        await flushMicrotasks();
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggers[0]);
        expect(triggers[0].hasAttribute('data-popup-open')).toBe(true);
    });

    it('ArrowLeft moves to previous trigger', async () => {
        triggers[1].click();
        fixture.detectChanges();

        keydown(triggers[1], 'ArrowLeft');
        await flushMicrotasks();
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggers[0]);
        expect(triggers[0].hasAttribute('data-popup-open')).toBe(true);
    });

    it('ArrowLeft from an open menu item switches to the previous trigger menu', async () => {
        triggers[1].focus();
        keydown(triggers[1], 'ArrowDown');
        fixture.detectChanges();
        await fixture.whenStable();
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        fixture.detectChanges();

        const item: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuItem]');
        expect(document.activeElement).toBe(item);

        const changes: RdxMenuOpenChange[] = [];
        const preventedAtClose: boolean[] = [];
        fixture.componentInstance.editMenu().onOpenChange.subscribe((change) => {
            changes.push(change);
            if (!change.open) preventedAtClose.push(change.event.defaultPrevented);
        });
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
        item.dispatchEvent(event);
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggers[0]);
        expect(triggers[0].hasAttribute('data-popup-open')).toBe(true);
        expect(triggers[1].hasAttribute('data-popup-open')).toBe(false);
        expect(changes.map(({ open, reason }) => ({ open, reason }))).toEqual([
            { open: false, reason: 'list-navigation' },
            { open: true, reason: 'trigger-focus' },
            { open: false, reason: 'sibling-open' }
        ]);
        expect(changes[0].event).toBe(event);
        expect(changes[1].event).toBeInstanceOf(FocusEvent);
        expect(preventedAtClose[0]).toBe(false);
        expect(event.defaultPrevented).toBe(true);
    });

    it('ArrowDown opens the focused menu without a prior open menu', () => {
        triggers[0].focus();
        keydown(triggers[0], 'ArrowDown');
        fixture.detectChanges();

        expect(triggers[0].hasAttribute('data-popup-open')).toBe(true);
    });

    it('ArrowDown opens the menu after moving focus with ArrowRight', async () => {
        triggers[0].focus();
        keydown(triggers[0], 'ArrowRight');
        await flushMicrotasks();
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggers[1]);

        keydown(triggers[1], 'ArrowDown');
        fixture.detectChanges();

        expect(triggers[1].hasAttribute('data-popup-open')).toBe(true);
    });

    it('Enter opens the focused menu, focuses the first item, and ArrowDown advances highlight', async () => {
        triggers[0].focus();
        keydown(triggers[0], 'Enter');
        fixture.detectChanges();
        await fixture.whenStable();
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        fixture.detectChanges();

        const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuItem]'));
        expect(triggers[0].hasAttribute('data-popup-open')).toBe(true);
        expect(document.activeElement).toBe(items[0]);
        expect(items[0].hasAttribute('data-highlighted')).toBe(true);

        keydown(items[0], 'ArrowDown');
        fixture.detectChanges();
        expect(document.activeElement).toBe(items[1]);
        expect(items[1].hasAttribute('data-highlighted')).toBe(true);
    });

    it('does not keep the trigger highlighted after focus moves into the popup', async () => {
        triggers[0].focus();
        keydown(triggers[0], 'ArrowDown');
        fixture.detectChanges();
        await fixture.whenStable();
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        fixture.detectChanges();

        const item: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuItem]');
        expect(document.activeElement).toBe(item);
        expect(triggers[0].hasAttribute('data-highlighted')).toBe(false);
        expect(item.hasAttribute('data-highlighted')).toBe(true);
    });

    it('ArrowUp opens the focused menu and focuses the last item', async () => {
        triggers[0].focus();
        keydown(triggers[0], 'ArrowUp');
        fixture.detectChanges();
        await fixture.whenStable();
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuItem]'));
        expect(triggers[0].hasAttribute('data-popup-open')).toBe(true);
        expect(document.activeElement).toBe(items[items.length - 1]);
    });

    it('Home and End move focus to menubar boundaries', async () => {
        triggers[1].focus();
        keydown(triggers[1], 'Home');
        await flushMicrotasks();
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggers[0]);

        keydown(triggers[0], 'End');
        await flushMicrotasks();
        fixture.detectChanges();

        expect(document.activeElement).toBe(triggers[2]);
    });

    it('Escape closes the open menu and returns focus to the trigger', () => {
        triggers[0].click();
        fixture.detectChanges();

        keydown(triggers[0], 'Escape');
        fixture.detectChanges();

        expect(triggers[0].hasAttribute('data-popup-open')).toBe(false);
        expect(document.activeElement).toBe(triggers[0]);
    });

    it('skips disabled triggers when moving across an open menubar', async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ imports: [MenubarWithDisabledHost] });
        const disabledFixture = TestBed.createComponent(MenubarWithDisabledHost);
        disabledFixture.detectChanges();
        const disabledTriggers: HTMLButtonElement[] = Array.from(
            disabledFixture.nativeElement.querySelectorAll('[rdxMenuTrigger]')
        );

        disabledTriggers[0].click();
        disabledFixture.detectChanges();
        keydown(disabledTriggers[0], 'ArrowRight');
        await flushMicrotasks();
        disabledFixture.detectChanges();

        expect(disabledTriggers[1].hasAttribute('data-disabled')).toBe(true);
        expect(document.activeElement).toBe(disabledTriggers[2]);
        expect(disabledTriggers[2].hasAttribute('data-popup-open')).toBe(true);
    });
});
