import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    RdxMenuArrow,
    RdxMenuBackdrop,
    RdxMenuCheckboxItem,
    RdxMenuCheckboxItemIndicator,
    RdxMenuGroup,
    RdxMenuItem,
    RdxMenuLinkItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPortalMisuseGuard,
    RdxMenuPositioner,
    RdxMenuRadioGroup,
    RdxMenuRadioItem,
    RdxMenuRadioItemIndicator,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger,
    RdxMenuTrigger,
    RdxMenuViewport
} from '@radix-ng/primitives/menu';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function keydown(target: Element, key: string) {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

/** Flush a single rAF tick so auto-focus effects land. */
async function nextFrame() {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

// ─── Test host components ─────────────────────────────────────────────────────

@Component({
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    template: `
        <div #root="rdxMenuRoot" [(open)]="open" rdxMenuRoot>
            <button rdxMenuTrigger>Open</button>

            @if (root.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button (onSelect)="selected.push('a')" rdxMenuItem>Alpha</button>
                        <button (onSelect)="selected.push('b')" rdxMenuItem>Beta</button>
                        <button (onSelect)="selected.push('c')" rdxMenuItem>Charlie</button>
                    </div>
                </div>
            }
        </div>
    `
})
class BasicMenuComponent {
    open = false;
    selected: string[] = [];
}

@Component({
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    template: `
        <div #root="rdxMenuRoot" [modal]="false" rdxMenuRoot>
            <button rdxMenuTrigger>Open</button>

            @if (root.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>Item</button>
                    </div>
                </div>
            }
        </div>
    `
})
class NonModalMenuComponent {}

@Component({
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    template: `
        <div #root="rdxMenuRoot" [defaultOpen]="true" rdxMenuRoot>
            <button rdxMenuTrigger>Open</button>

            @if (root.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>Item</button>
                    </div>
                </div>
            }
        </div>
    `
})
class DefaultOpenMenuComponent {}

@Component({
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    template: `
        <div #root="rdxMenuRoot" [disabled]="disabled" rdxMenuRoot>
            <button rdxMenuTrigger>Open</button>

            @if (root.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>Item</button>
                    </div>
                </div>
            }
        </div>
    `
})
class DisabledRootMenuComponent {
    disabled = true;
}

@Component({
    imports: [
        RdxMenuRoot,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuCheckboxItem,
        RdxMenuRadioGroup,
        RdxMenuRadioItem,
        RdxMenuLinkItem,
        RdxMenuSubTrigger
    ],
    template: `
        <div [open]="true" [disabled]="true" rdxMenuRoot>
            <div rdxMenuPositioner>
                <div rdxMenuPopup>
                    <button (onSelect)="selections.push('item')" rdxMenuItem>Item</button>
                    <button [(checked)]="checked" rdxMenuCheckboxItem>Checkbox</button>
                    <div [(value)]="radioValue" rdxMenuRadioGroup>
                        <button value="radio" rdxMenuRadioItem>Radio</button>
                    </div>
                    <a (onSelect)="selections.push('link')" href="#disabled-link" rdxMenuLinkItem>Link</a>

                    <ng-container #submenu="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuSubTrigger>Submenu</button>
                        @if (submenu.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>Submenu item</button>
                                </div>
                            </div>
                        }
                    </ng-container>
                </div>
            </div>
        </div>
    `
})
class DisabledRootItemsMenuComponent {
    selections: string[] = [];
    checked = false;
    radioValue: string | undefined;
}

@Component({
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    template: `
        <div #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger>Open</button>

            @if (root.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>Enabled</button>
                        <button [disabled]="true" rdxMenuItem>Disabled</button>
                        <button rdxMenuItem>Last</button>
                    </div>
                </div>
            }
        </div>
    `
})
class DisabledItemMenuComponent {}

@Component({
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuCheckboxItem,
        RdxMenuCheckboxItemIndicator
    ],
    template: `
        <div #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger>Open</button>

            @if (root.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <label [(checked)]="bookmarks" (onCheckedChange)="changes.push($event)" rdxMenuCheckboxItem>
                            <span rdxMenuCheckboxItemIndicator></span>
                            Bookmarks
                        </label>
                        <label [checked]="'indeterminate'" rdxMenuCheckboxItem>Indeterminate</label>
                    </div>
                </div>
            }
        </div>
    `
})
class CheckboxMenuComponent {
    bookmarks = false;
    changes: unknown[] = [];
}

@Component({
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuRadioGroup,
        RdxMenuRadioItem,
        RdxMenuRadioItemIndicator
    ],
    template: `
        <div #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger>Open</button>

            @if (root.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <div [(value)]="selected" (onValueChange)="changes.push($event)" rdxMenuRadioGroup>
                            <label value="a" rdxMenuRadioItem>
                                <span rdxMenuRadioItemIndicator></span>
                                A
                            </label>
                            <label value="b" rdxMenuRadioItem>
                                <span rdxMenuRadioItemIndicator></span>
                                B
                            </label>
                        </div>
                    </div>
                </div>
            }
        </div>
    `
})
class RadioMenuComponent {
    selected: string | undefined = undefined;
    changes: string[] = [];
}

@Component({
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuGroup,
        RdxMenuSeparator
    ],
    template: `
        <div #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger>Open</button>

            @if (root.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <div rdxMenuGroup>
                            <button rdxMenuItem>Item 1</button>
                        </div>
                        <div rdxMenuSeparator></div>
                        <button rdxMenuItem>Item 2</button>
                    </div>
                </div>
            }
        </div>
    `
})
class StructureMenuComponent {}

// ─── Spec ─────────────────────────────────────────────────────────────────────

describe('Menu', () => {
    describe('trigger', () => {
        let fixture: ComponentFixture<BasicMenuComponent>;
        let trigger: HTMLButtonElement;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [BasicMenuComponent] });
            fixture = TestBed.createComponent(BasicMenuComponent);
            fixture.detectChanges();
            trigger = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
        });

        it('opens on click', () => {
            expect(fixture.componentInstance.open).toBe(false);
            expect(trigger.getAttribute('data-state')).toBe('closed');
            expect(trigger.getAttribute('aria-expanded')).toBe('false');

            trigger.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.open).toBe(true);
            expect(trigger.getAttribute('data-state')).toBe('open');
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
        });

        it('closes on second click', () => {
            trigger.click();
            fixture.detectChanges();
            trigger.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.open).toBe(false);
            expect(trigger.getAttribute('data-state')).toBe('closed');
        });

        it('has aria-haspopup="menu"', () => {
            expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
        });

        it('opens on ArrowDown', () => {
            keydown(trigger, 'ArrowDown');
            fixture.detectChanges();

            expect(fixture.componentInstance.open).toBe(true);
        });

        it('opens on ArrowUp', () => {
            keydown(trigger, 'ArrowUp');
            fixture.detectChanges();

            expect(fixture.componentInstance.open).toBe(true);
        });
    });

    describe('defaultOpen', () => {
        it('opens without interaction', () => {
            TestBed.configureTestingModule({ imports: [DefaultOpenMenuComponent] });
            const fixture = TestBed.createComponent(DefaultOpenMenuComponent);
            fixture.detectChanges();

            const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            expect(fixture.nativeElement.querySelector('[rdxMenuPopup]')).not.toBeNull();
        });

        it('can close after the initial default open', () => {
            TestBed.configureTestingModule({ imports: [DefaultOpenMenuComponent] });
            const fixture = TestBed.createComponent(DefaultOpenMenuComponent);
            fixture.detectChanges();

            const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            trigger.click();
            fixture.detectChanges();

            expect(trigger.getAttribute('aria-expanded')).toBe('false');
            expect(fixture.nativeElement.querySelector('[rdxMenuPopup]')).toBeNull();
        });
    });

    describe('disabled root', () => {
        it('prevents the trigger from opening the menu', () => {
            TestBed.configureTestingModule({ imports: [DisabledRootMenuComponent] });
            const fixture = TestBed.createComponent(DisabledRootMenuComponent);
            fixture.detectChanges();

            const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            expect(trigger.hasAttribute('data-disabled')).toBe(true);

            trigger.click();
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('[rdxMenuPopup]')).toBeNull();
        });
    });

    describe('popup', () => {
        let fixture: ComponentFixture<BasicMenuComponent>;
        let trigger: HTMLButtonElement;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [BasicMenuComponent] });
            fixture = TestBed.createComponent(BasicMenuComponent);
            fixture.detectChanges();
            trigger = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            trigger.click();
            fixture.detectChanges();
        });

        it('has role="menu"', () => {
            const popup: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuPopup]');
            expect(popup.getAttribute('role')).toBe('menu');
        });

        it('has data-state="open"', () => {
            const popup: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuPopup]');
            expect(popup.getAttribute('data-state')).toBe('open');
        });

        it('has aria-orientation="vertical"', () => {
            const popup: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuPopup]');
            expect(popup.getAttribute('aria-orientation')).toBe('vertical');
        });

        it('locks page scrolling by default and restores it when closed', () => {
            expect(document.documentElement.style.overflow).toBe('hidden');
            expect(document.body.style.overflow).toBe('hidden');

            trigger.click();
            fixture.detectChanges();

            expect(document.documentElement.style.overflow).toBe('');
            expect(document.body.style.overflow).toBe('');
        });

        it('does not lock page scrolling when modal=false', () => {
            fixture.destroy();
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [NonModalMenuComponent] });
            const nonModalFixture = TestBed.createComponent(NonModalMenuComponent);
            nonModalFixture.detectChanges();

            nonModalFixture.nativeElement.querySelector('[rdxMenuTrigger]').click();
            nonModalFixture.detectChanges();

            expect(document.documentElement.style.overflow).toBe('');
            expect(document.body.style.overflow).toBe('');
        });

        it('items have role="menuitem" and tabindex="-1"', () => {
            const items: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('[rdxMenuItem]');
            items.forEach((item) => {
                expect(item.getAttribute('role')).toBe('menuitem');
                expect(item.getAttribute('tabindex')).toBe('-1');
            });
        });
    });

    describe('keyboard navigation', () => {
        let fixture: ComponentFixture<BasicMenuComponent>;
        let trigger: HTMLButtonElement;
        let popup: HTMLElement;
        let items: HTMLElement[];

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [BasicMenuComponent] });
            fixture = TestBed.createComponent(BasicMenuComponent);
            fixture.detectChanges();
            trigger = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            trigger.click();
            fixture.detectChanges();
            popup = fixture.nativeElement.querySelector('[rdxMenuPopup]');
            items = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuItem]'));
        });

        it('ArrowDown moves focus to the next item', () => {
            items[0].focus();
            keydown(popup, 'ArrowDown');

            expect(document.activeElement).toBe(items[1]);
        });

        it('ArrowDown wraps from last to first item', () => {
            items[items.length - 1].focus();
            keydown(popup, 'ArrowDown');

            expect(document.activeElement).toBe(items[0]);
        });

        it('ArrowUp moves focus to the previous item', () => {
            items[1].focus();
            keydown(popup, 'ArrowUp');

            expect(document.activeElement).toBe(items[0]);
        });

        it('ArrowUp wraps from first to last item', () => {
            items[0].focus();
            keydown(popup, 'ArrowUp');

            expect(document.activeElement).toBe(items[items.length - 1]);
        });

        it('Home moves focus to the first item', () => {
            items[2].focus();
            keydown(popup, 'Home');

            expect(document.activeElement).toBe(items[0]);
        });

        it('End moves focus to the last item', () => {
            items[0].focus();
            keydown(popup, 'End');

            expect(document.activeElement).toBe(items[items.length - 1]);
        });

        it('Escape closes the menu and returns focus to the trigger', () => {
            items[0].focus();
            keydown(popup, 'Escape');
            fixture.detectChanges();

            expect(fixture.componentInstance.open).toBe(false);
            expect(document.activeElement).toBe(trigger);
        });

        it('Tab closes the menu', () => {
            keydown(popup, 'Tab');
            fixture.detectChanges();

            expect(fixture.componentInstance.open).toBe(false);
        });

        it('typeahead focuses the first item whose text starts with the key', () => {
            // Items are "Alpha", "Beta", "Charlie"
            items[0].focus();
            keydown(popup, 'b');

            expect(document.activeElement).toBe(items[1]);
        });

        it('typeahead buffers multiple characters', () => {
            items[0].focus();
            keydown(popup, 'c');
            keydown(popup, 'h');

            expect(document.activeElement).toBe(items[2]);
        });
    });

    describe('disabled items', () => {
        let fixture: ComponentFixture<DisabledItemMenuComponent>;
        let popup: HTMLElement;
        let enabledItem: HTMLElement;
        let disabledItem: HTMLElement;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [DisabledItemMenuComponent] });
            fixture = TestBed.createComponent(DisabledItemMenuComponent);
            fixture.detectChanges();
            const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            trigger.click();
            fixture.detectChanges();
            popup = fixture.nativeElement.querySelector('[rdxMenuPopup]');
            const all: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuItem]'));
            enabledItem = all[0];
            disabledItem = all[1];
        });

        it('exposes data-disabled on disabled items', () => {
            expect(disabledItem.hasAttribute('data-disabled')).toBe(true);
            expect(enabledItem.hasAttribute('data-disabled')).toBe(false);
        });

        it('skips disabled items during ArrowDown navigation', () => {
            enabledItem.focus();
            keydown(popup, 'ArrowDown');

            // disabled item at index 1 should be skipped → focus lands on index 2
            const lastItem: HTMLElement = fixture.nativeElement.querySelectorAll('[rdxMenuItem]')[2];
            expect(document.activeElement).toBe(lastItem);
        });

        it('propagates root disabled state to every interactive item type', () => {
            const rootFixture = TestBed.createComponent(DisabledRootItemsMenuComponent);
            rootFixture.detectChanges();

            const interactiveItems: HTMLElement[] = Array.from(
                rootFixture.nativeElement.querySelectorAll(
                    '[rdxMenuItem],[rdxMenuCheckboxItem],[rdxMenuRadioItem],[rdxMenuLinkItem],[rdxMenuSubTrigger]'
                )
            );

            expect(interactiveItems).toHaveLength(5);
            for (const item of interactiveItems) {
                expect(item.hasAttribute('data-disabled')).toBe(true);
                expect(item.getAttribute('aria-disabled')).toBe('true');
                item.click();
            }
            rootFixture.detectChanges();

            expect(rootFixture.componentInstance.selections).toEqual([]);
            expect(rootFixture.componentInstance.checked).toBe(false);
            expect(rootFixture.componentInstance.radioValue).toBeUndefined();
            expect(rootFixture.nativeElement.querySelectorAll('[rdxMenuPopup]')).toHaveLength(1);
        });
    });

    describe('pointer highlight', () => {
        let fixture: ComponentFixture<BasicMenuComponent>;
        let popup: HTMLElement;
        let items: HTMLElement[];

        function pointer(el: Element, type: string) {
            const ev = new Event(type, { bubbles: true });
            Object.defineProperty(ev, 'pointerType', { value: 'mouse' });
            el.dispatchEvent(ev);
        }

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [BasicMenuComponent] });
            fixture = TestBed.createComponent(BasicMenuComponent);
            fixture.detectChanges();
            const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            trigger.click();
            fixture.detectChanges();
            popup = fixture.nativeElement.querySelector('[rdxMenuPopup]');
            items = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuItem]'));
        });

        it('pointermove highlights the item under the pointer', () => {
            pointer(items[0], 'pointermove');
            fixture.detectChanges();

            expect(items[0].hasAttribute('data-highlighted')).toBe(true);
        });

        it('pointerleave clears the highlight (focus returns to the popup)', () => {
            pointer(items[0], 'pointermove');
            fixture.detectChanges();
            expect(items[0].hasAttribute('data-highlighted')).toBe(true);

            pointer(items[0], 'pointerleave');
            fixture.detectChanges();

            expect(items[0].hasAttribute('data-highlighted')).toBe(false);
            expect(document.activeElement).toBe(popup);
        });

        it('moving from one item to another leaves only the new item highlighted', () => {
            pointer(items[0], 'pointermove');
            fixture.detectChanges();

            // Leaving A focuses the popup, then moving onto B focuses B (matches DOM event order)
            pointer(items[0], 'pointerleave');
            pointer(items[1], 'pointermove');
            fixture.detectChanges();

            expect(items[0].hasAttribute('data-highlighted')).toBe(false);
            expect(items[1].hasAttribute('data-highlighted')).toBe(true);
        });
    });

    describe('item selection', () => {
        let fixture: ComponentFixture<BasicMenuComponent>;
        let trigger: HTMLButtonElement;
        let items: HTMLElement[];

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [BasicMenuComponent] });
            fixture = TestBed.createComponent(BasicMenuComponent);
            fixture.detectChanges();
            trigger = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            trigger.click();
            fixture.detectChanges();
            items = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuItem]'));
        });

        it('click selects item and closes menu', () => {
            items[0].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selected).toContain('a');
            expect(fixture.componentInstance.open).toBe(false);
        });

        it('Enter selects focused item and closes menu', () => {
            items[1].focus();
            keydown(items[1], 'Enter');
            fixture.detectChanges();

            expect(fixture.componentInstance.selected).toContain('b');
            expect(fixture.componentInstance.open).toBe(false);
        });

        it('Space selects focused item and closes menu', () => {
            items[2].focus();
            keydown(items[2], ' ');
            fixture.detectChanges();

            expect(fixture.componentInstance.selected).toContain('c');
            expect(fixture.componentInstance.open).toBe(false);
        });
    });

    describe('outside pointer interaction', () => {
        it('closes when a pointerdown happens outside', async () => {
            TestBed.configureTestingModule({ imports: [BasicMenuComponent] });
            const fixture = TestBed.createComponent(BasicMenuComponent);
            fixture.detectChanges();

            const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            trigger.click();
            fixture.detectChanges();
            await new Promise((resolve) => setTimeout(resolve));

            document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.open).toBe(false);
        });
    });

    describe('checkbox item', () => {
        let fixture: ComponentFixture<CheckboxMenuComponent>;
        let checkboxItem: HTMLElement;
        let indetermItem: HTMLElement;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [CheckboxMenuComponent] });
            fixture = TestBed.createComponent(CheckboxMenuComponent);
            fixture.detectChanges();
            const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            trigger.click();
            fixture.detectChanges();
            const all: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuCheckboxItem]'));
            checkboxItem = all[0];
            indetermItem = all[1];
        });

        it('has role="menuitemcheckbox"', () => {
            expect(checkboxItem.getAttribute('role')).toBe('menuitemcheckbox');
        });

        it('starts unchecked with data-state="unchecked"', () => {
            expect(checkboxItem.getAttribute('data-state')).toBe('unchecked');
            expect(checkboxItem.getAttribute('aria-checked')).toBe('false');
        });

        it('toggles to checked on click and emits onCheckedChange without closing the menu', () => {
            checkboxItem.click();
            fixture.detectChanges();

            // Menu stays open — checkbox items do not close the menu
            expect(fixture.componentInstance.bookmarks).toBe(true);
            expect(checkboxItem.getAttribute('data-state')).toBe('checked');
            expect(checkboxItem.getAttribute('aria-checked')).toBe('true');
            expect(fixture.componentInstance.changes).toEqual([true]);
            expect(fixture.nativeElement.querySelector('[rdxMenuPopup]')).not.toBeNull();
        });

        it('toggles back to unchecked on second click', () => {
            checkboxItem.click();
            fixture.detectChanges();
            // menu stays open after first click
            const refreshed: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuCheckboxItem]');
            refreshed.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.bookmarks).toBe(false);
        });

        it('shows indeterminate state via aria-checked="mixed"', () => {
            expect(indetermItem.getAttribute('aria-checked')).toBe('mixed');
            expect(indetermItem.getAttribute('data-state')).toBe('indeterminate');
        });

        it('checkbox indicator is visible when checked', () => {
            // start — unchecked: display:none
            const indicator: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuCheckboxItemIndicator]');
            expect(indicator.style.display).toBe('none');

            // menu stays open after checkbox click
            checkboxItem.click();
            fixture.detectChanges();

            expect(indicator.style.display).not.toBe('none');
        });
    });

    describe('radio group', () => {
        let fixture: ComponentFixture<RadioMenuComponent>;
        let radioItems: HTMLElement[];

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [RadioMenuComponent] });
            fixture = TestBed.createComponent(RadioMenuComponent);
            fixture.detectChanges();
            const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            trigger.click();
            fixture.detectChanges();
            radioItems = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuRadioItem]'));
        });

        it('items have role="menuitemradio"', () => {
            radioItems.forEach((item) => expect(item.getAttribute('role')).toBe('menuitemradio'));
        });

        it('items start with data-state="unchecked"', () => {
            radioItems.forEach((item) => expect(item.getAttribute('data-state')).toBe('unchecked'));
        });

        it('clicking an item checks it and emits onValueChange', () => {
            radioItems[0].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selected).toBe('a');
            expect(fixture.componentInstance.changes).toEqual(['a']);
        });

        it('selecting a new item deselects the previous one without closing the menu', () => {
            radioItems[0].click();
            fixture.detectChanges();
            // menu stays open — radio items do not close the menu by default
            radioItems[1].click();
            fixture.detectChanges();

            const all: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuRadioItem]'));
            expect(all[0].getAttribute('data-state')).toBe('unchecked');
            expect(all[1].getAttribute('data-state')).toBe('checked');
            expect(fixture.componentInstance.selected).toBe('b');
            expect(fixture.nativeElement.querySelector('[rdxMenuPopup]')).not.toBeNull();
        });

        it('radio item indicator is visible when selected', () => {
            const indicators: HTMLElement[] = Array.from(
                fixture.nativeElement.querySelectorAll('[rdxMenuRadioItemIndicator]')
            );
            // both start hidden
            indicators.forEach((ind) => expect(ind.style.display).toBe('none'));

            // menu stays open after radio click
            radioItems[0].click();
            fixture.detectChanges();

            const refreshed: HTMLElement[] = Array.from(
                fixture.nativeElement.querySelectorAll('[rdxMenuRadioItemIndicator]')
            );
            expect(refreshed[0].style.display).not.toBe('none');
            expect(refreshed[1].style.display).toBe('none');
        });
    });

    describe('structure parts', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [StructureMenuComponent] });
            const fixture = TestBed.createComponent(StructureMenuComponent);
            fixture.detectChanges();
            const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
            trigger.click();
            fixture.detectChanges();
        });

        it('separator has role="separator"', () => {
            const sep: HTMLElement = document.querySelector('[rdxMenuSeparator]')!;
            expect(sep.getAttribute('role')).toBe('separator');
        });

        it('group has role="group"', () => {
            const group: HTMLElement = document.querySelector('[rdxMenuGroup]')!;
            expect(group.getAttribute('role')).toBe('group');
        });
    });

    // ─── closeOnClick ──────────────────────────────────────────────────────────

    describe('closeOnClick', () => {
        it('MenuItem closes menu by default (closeOnClick=true)', () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>Item</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            f.nativeElement.querySelector('[rdxMenuItem]').click();
            f.detectChanges();

            expect(f.nativeElement.querySelector('[rdxMenuPopup]')).toBeNull();
        });

        it('MenuItem with closeOnClick=false keeps menu open', () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button [closeOnClick]="false" rdxMenuItem>Item</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            f.nativeElement.querySelector('[rdxMenuItem]').click();
            f.detectChanges();

            expect(f.nativeElement.querySelector('[rdxMenuPopup]')).not.toBeNull();
        });

        it('RadioItem default closeOnClick=false keeps menu open', () => {
            @Component({
                imports: [
                    RdxMenuRoot,
                    RdxMenuTrigger,
                    RdxMenuPositioner,
                    RdxMenuPopup,
                    RdxMenuRadioGroup,
                    RdxMenuRadioItem
                ],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <div rdxMenuRadioGroup>
                                        <label value="a" rdxMenuRadioItem>A</label>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            f.nativeElement.querySelector('[rdxMenuRadioItem]').click();
            f.detectChanges();

            expect(f.nativeElement.querySelector('[rdxMenuPopup]')).not.toBeNull();
        });

        it('RadioItem with closeOnClick=true closes menu', () => {
            @Component({
                imports: [
                    RdxMenuRoot,
                    RdxMenuTrigger,
                    RdxMenuPositioner,
                    RdxMenuPopup,
                    RdxMenuRadioGroup,
                    RdxMenuRadioItem
                ],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <div rdxMenuRadioGroup>
                                        <label [closeOnClick]="true" value="a" rdxMenuRadioItem>A</label>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            f.nativeElement.querySelector('[rdxMenuRadioItem]').click();
            f.detectChanges();

            expect(f.nativeElement.querySelector('[rdxMenuPopup]')).toBeNull();
        });
    });

    // ─── loopFocus ────────────────────────────────────────────────────────────

    describe('loopFocus', () => {
        function makeFixture(loop: boolean) {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
                template: `
                    <div #root="rdxMenuRoot" [loopFocus]="loop" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>A</button>
                                    <button rdxMenuItem>B</button>
                                    <button rdxMenuItem>C</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {
                loop = loop;
            }

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();
            return f;
        }

        it('wraps from last to first when loopFocus=true', () => {
            const f = makeFixture(true);
            const popup: HTMLElement = f.nativeElement.querySelector('[rdxMenuPopup]');
            const items: HTMLElement[] = Array.from(f.nativeElement.querySelectorAll('[rdxMenuItem]'));

            items[items.length - 1].focus();
            keydown(popup, 'ArrowDown');

            expect(document.activeElement).toBe(items[0]);
        });

        it('stops at last item when loopFocus=false', () => {
            const f = makeFixture(false);
            const popup: HTMLElement = f.nativeElement.querySelector('[rdxMenuPopup]');
            const items: HTMLElement[] = Array.from(f.nativeElement.querySelectorAll('[rdxMenuItem]'));

            items[items.length - 1].focus();
            keydown(popup, 'ArrowDown');

            expect(document.activeElement).toBe(items[items.length - 1]);
        });

        it('wraps from first to last when loopFocus=true', () => {
            const f = makeFixture(true);
            const popup: HTMLElement = f.nativeElement.querySelector('[rdxMenuPopup]');
            const items: HTMLElement[] = Array.from(f.nativeElement.querySelectorAll('[rdxMenuItem]'));

            items[0].focus();
            keydown(popup, 'ArrowUp');

            expect(document.activeElement).toBe(items[items.length - 1]);
        });

        it('stops at first item when loopFocus=false', () => {
            const f = makeFixture(false);
            const popup: HTMLElement = f.nativeElement.querySelector('[rdxMenuPopup]');
            const items: HTMLElement[] = Array.from(f.nativeElement.querySelectorAll('[rdxMenuItem]'));

            items[0].focus();
            keydown(popup, 'ArrowUp');

            expect(document.activeElement).toBe(items[0]);
        });
    });

    // ─── label / typeahead ────────────────────────────────────────────────────

    describe('label input for typeahead', () => {
        let fixture: ComponentFixture<unknown>;
        let popup: HTMLElement;
        let items: HTMLElement[];

        beforeEach(() => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <!-- label overrides textContent which would include icon text -->
                                    <button label="Copy" rdxMenuItem>
                                        <svg>icon</svg>
                                        Copy action
                                    </button>
                                    <button label="Paste" rdxMenuItem>
                                        <svg>icon</svg>
                                        Paste action
                                    </button>
                                    <button rdxMenuItem>Delete</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            fixture = TestBed.createComponent(Host as any);
            fixture.detectChanges();
            (fixture.nativeElement as HTMLElement)
                .querySelector('[rdxMenuTrigger]')!
                .dispatchEvent(new MouseEvent('click'));
            fixture.detectChanges();
            popup = (fixture.nativeElement as HTMLElement).querySelector('[rdxMenuPopup]')!;
            items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuItem]'));
        });

        it('sets data-label attribute from label input', () => {
            expect(items[0].getAttribute('data-label')).toBe('Copy');
            expect(items[1].getAttribute('data-label')).toBe('Paste');
            expect(items[2].getAttribute('data-label')).toBeNull();
        });

        it('typeahead uses data-label when present', () => {
            items[0].focus();
            keydown(popup, 'p');

            expect(document.activeElement).toBe(items[1]);
        });

        it('typeahead falls back to textContent when label not set', () => {
            items[0].focus();
            keydown(popup, 'd');

            expect(document.activeElement).toBe(items[2]);
        });
    });

    // ─── keepMounted on indicators ───────────────────────────────────────────

    describe('keepMounted on indicators', () => {
        it('CheckboxItemIndicator is hidden by default when unchecked', () => {
            @Component({
                imports: [
                    RdxMenuRoot,
                    RdxMenuTrigger,
                    RdxMenuPositioner,
                    RdxMenuPopup,
                    RdxMenuCheckboxItem,
                    RdxMenuCheckboxItemIndicator
                ],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <label rdxMenuCheckboxItem>
                                        <span rdxMenuCheckboxItemIndicator></span>
                                    </label>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            const indicator: HTMLElement = f.nativeElement.querySelector('[rdxMenuCheckboxItemIndicator]');
            expect(indicator.style.display).toBe('none');
        });

        it('CheckboxItemIndicator stays in DOM with keepMounted and has data-state', () => {
            @Component({
                imports: [
                    RdxMenuRoot,
                    RdxMenuTrigger,
                    RdxMenuPositioner,
                    RdxMenuPopup,
                    RdxMenuCheckboxItem,
                    RdxMenuCheckboxItemIndicator
                ],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <label rdxMenuCheckboxItem>
                                        <span [keepMounted]="true" rdxMenuCheckboxItemIndicator></span>
                                    </label>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            const indicator: HTMLElement = f.nativeElement.querySelector('[rdxMenuCheckboxItemIndicator]');
            expect(indicator.style.display).not.toBe('none');
            expect(indicator.getAttribute('data-state')).toBe('unchecked');
            expect(indicator.hasAttribute('data-ending-style')).toBe(true);
        });

        it('RadioItemIndicator stays in DOM with keepMounted', () => {
            @Component({
                imports: [
                    RdxMenuRoot,
                    RdxMenuTrigger,
                    RdxMenuPositioner,
                    RdxMenuPopup,
                    RdxMenuRadioGroup,
                    RdxMenuRadioItem,
                    RdxMenuRadioItemIndicator
                ],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <div rdxMenuRadioGroup>
                                        <label value="a" rdxMenuRadioItem>
                                            <span [keepMounted]="true" rdxMenuRadioItemIndicator></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            const indicator: HTMLElement = f.nativeElement.querySelector('[rdxMenuRadioItemIndicator]');
            expect(indicator.style.display).not.toBe('none');
            expect(indicator.getAttribute('data-state')).toBe('unchecked');
        });
    });

    // ─── RdxMenuSubTrigger ────────────────────────────────────────────────────

    describe('RdxMenuSubTrigger', () => {
        let fixture: ComponentFixture<unknown>;
        let trigger: HTMLButtonElement;
        let popup: HTMLElement;
        let subTrigger: HTMLButtonElement;

        beforeEach(() => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem, RdxMenuSubTrigger],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>Item A</button>
                                    <ng-container #sub="rdxMenuRoot" rdxMenuRoot>
                                        <button rdxMenuSubTrigger>Sub ›</button>
                                        @if (sub.open()) {
                                            <div rdxMenuPositioner>
                                                <div rdxMenuPopup>
                                                    <button rdxMenuItem>Sub item 1</button>
                                                    <button rdxMenuItem>Sub item 2</button>
                                                </div>
                                            </div>
                                        }
                                    </ng-container>
                                    <ng-container #secondSub="rdxMenuRoot" rdxMenuRoot>
                                        <button rdxMenuSubTrigger>Second ›</button>
                                        @if (secondSub.open()) {
                                            <div rdxMenuPositioner>
                                                <div rdxMenuPopup>
                                                    <button rdxMenuItem>Second sub item</button>
                                                </div>
                                            </div>
                                        }
                                    </ng-container>
                                    <button rdxMenuItem>Item B</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            fixture = TestBed.createComponent(Host as any);
            fixture.detectChanges();
            trigger = (fixture.nativeElement as HTMLElement).querySelector('[rdxMenuTrigger]')!;
            trigger.click();
            fixture.detectChanges();
            popup = (fixture.nativeElement as HTMLElement).querySelector('[rdxMenuPopup]')!;
            subTrigger = (fixture.nativeElement as HTMLElement).querySelector('[rdxMenuSubTrigger]')!;
        });

        it('has role="menuitem" and aria-haspopup="menu"', () => {
            expect(subTrigger.getAttribute('role')).toBe('menuitem');
            expect(subTrigger.getAttribute('aria-haspopup')).toBe('menu');
            expect(subTrigger.getAttribute('type')).toBe('button');
        });

        it('is included in parent popup keyboard navigation', () => {
            const allItems: HTMLElement[] = Array.from(
                (fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuItem],[rdxMenuSubTrigger]')
            ).filter((el) => (el as HTMLElement).closest('[rdxMenuPopup]') === popup) as HTMLElement[];

            expect(allItems).toContain(subTrigger);
        });

        it('opens submenu on click', () => {
            subTrigger.click();
            fixture.detectChanges();

            expect(subTrigger.getAttribute('aria-expanded')).toBe('true');
            expect((fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuPopup]').length).toBe(2);
        });

        it('does not make a submenu modal when its parent menu is non-modal', () => {
            fixture.destroy();

            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem, RdxMenuSubTrigger],
                template: `
                    <div #root="rdxMenuRoot" [modal]="false" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <ng-container #sub="rdxMenuRoot" rdxMenuSubmenuRoot>
                                        <button rdxMenuSubTrigger>Sub</button>
                                        @if (sub.open()) {
                                            <div rdxMenuPositioner>
                                                <div rdxMenuPopup>
                                                    <button rdxMenuItem>Sub item</button>
                                                </div>
                                            </div>
                                        }
                                    </ng-container>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class NonModalParentHost {}

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [NonModalParentHost] });
            const nonModalFixture = TestBed.createComponent(NonModalParentHost);
            nonModalFixture.detectChanges();
            nonModalFixture.nativeElement.querySelector('[rdxMenuTrigger]').click();
            nonModalFixture.detectChanges();
            nonModalFixture.nativeElement.querySelector('[rdxMenuSubTrigger]').click();
            nonModalFixture.detectChanges();

            expect(nonModalFixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(2);
            expect(document.documentElement.style.overflow).toBe('');
            expect(document.body.style.overflow).toBe('');
        });

        it('opens submenu on ArrowRight', () => {
            keydown(subTrigger, 'ArrowRight');
            fixture.detectChanges();

            expect(subTrigger.getAttribute('aria-expanded')).toBe('true');
            expect(subTrigger.hasAttribute('data-popup-open')).toBe(true);
        });

        it('opens submenu on hover after the configured delay', async () => {
            const pointerMove = new Event('pointermove', { bubbles: true });
            Object.defineProperty(pointerMove, 'pointerType', { value: 'mouse' });
            subTrigger.dispatchEvent(pointerMove);

            await new Promise((resolve) => setTimeout(resolve, 120));
            fixture.detectChanges();

            expect(subTrigger.getAttribute('aria-expanded')).toBe('true');
        });

        it('closes submenu on ArrowLeft from within sub-popup', () => {
            subTrigger.click();
            fixture.detectChanges();

            const subPopups: HTMLElement[] = Array.from(
                (fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuPopup]')
            );
            const subPopup = subPopups[subPopups.length - 1];
            keydown(subPopup, 'ArrowLeft');
            fixture.detectChanges();

            expect(subTrigger.getAttribute('aria-expanded')).toBe('false');
            expect((fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuPopup]').length).toBe(1);
        });

        it('Escape closes submenu and returns focus to subTrigger', () => {
            subTrigger.click();
            fixture.detectChanges();

            const subPopups: HTMLElement[] = Array.from(
                (fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuPopup]')
            );
            const subPopup = subPopups[subPopups.length - 1];
            keydown(subPopup, 'Escape');
            fixture.detectChanges();

            expect((fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuPopup]').length).toBe(1);
            expect(document.activeElement).toBe(subTrigger);
        });

        it('keeps submenu open while moving pointer from trigger into submenu popup', async () => {
            const pointerMove = new Event('pointermove', { bubbles: true });
            Object.defineProperty(pointerMove, 'pointerType', { value: 'mouse' });
            subTrigger.dispatchEvent(pointerMove);

            await new Promise((resolve) => setTimeout(resolve, 250));
            fixture.detectChanges();

            const pointerLeave = new Event('pointerleave', { bubbles: true });
            subTrigger.dispatchEvent(pointerLeave);

            const subPopups: HTMLElement[] = Array.from(
                (fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuPopup]')
            );
            const subPopup = subPopups[subPopups.length - 1];
            const subItem: HTMLElement = subPopup.querySelector('[rdxMenuItem]')!;
            subItem.focus();
            await Promise.resolve();
            await Promise.resolve();
            fixture.detectChanges();

            expect(subTrigger.getAttribute('aria-expanded')).toBe('true');
            expect((fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuPopup]').length).toBe(2);
            expect(document.activeElement).toBe(subItem);
        });

        it('closes an open sibling submenu when another submenu opens', () => {
            const subTriggers: HTMLButtonElement[] = Array.from(
                (fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuSubTrigger]')
            );

            subTriggers[0].click();
            fixture.detectChanges();
            expect(subTriggers[0].getAttribute('aria-expanded')).toBe('true');
            expect(subTriggers[0].hasAttribute('data-highlighted')).toBe(true);

            subTriggers[1].click();
            fixture.detectChanges();

            expect(subTriggers[0].getAttribute('aria-expanded')).toBe('false');
            expect(subTriggers[0].hasAttribute('data-highlighted')).toBe(false);
            expect(subTriggers[1].getAttribute('aria-expanded')).toBe('true');
            expect((fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuPopup]').length).toBe(2);
        });

        it('clears sibling submenu trigger highlight immediately on hover', async () => {
            const subTriggers: HTMLButtonElement[] = Array.from(
                (fixture.nativeElement as HTMLElement).querySelectorAll('[rdxMenuSubTrigger]')
            );
            const pointerMove = new Event('pointermove', { bubbles: true });
            Object.defineProperty(pointerMove, 'pointerType', { value: 'mouse' });

            subTriggers[0].dispatchEvent(pointerMove);
            await new Promise((resolve) => setTimeout(resolve, 120));
            fixture.detectChanges();

            expect(subTriggers[0].hasAttribute('data-highlighted')).toBe(true);
            expect(subTriggers[0].getAttribute('aria-expanded')).toBe('true');

            subTriggers[1].dispatchEvent(pointerMove);
            fixture.detectChanges();

            expect(subTriggers[0].hasAttribute('data-highlighted')).toBe(false);
            expect(subTriggers[1].hasAttribute('data-highlighted')).toBe(true);
        });

        it('supports the dedicated rdxMenuSubmenuRoot alias', () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem, RdxMenuSubTrigger],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <ng-container #sub="rdxMenuRoot" rdxMenuSubmenuRoot>
                                        <button rdxMenuSubTrigger>Sub</button>
                                        @if (sub.open()) {
                                            <div rdxMenuPositioner>
                                                <div rdxMenuPopup>
                                                    <button rdxMenuItem>Sub item</button>
                                                </div>
                                            </div>
                                        }
                                    </ng-container>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class AliasHost {}

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [AliasHost] });
            const aliasFixture = TestBed.createComponent(AliasHost);
            aliasFixture.detectChanges();
            aliasFixture.nativeElement.querySelector('[rdxMenuTrigger]').click();
            aliasFixture.detectChanges();

            const aliasSubTrigger: HTMLButtonElement = aliasFixture.nativeElement.querySelector('[rdxMenuSubTrigger]');
            aliasSubTrigger.click();
            aliasFixture.detectChanges();

            expect(aliasSubTrigger.getAttribute('aria-expanded')).toBe('true');
            expect(aliasFixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(2);
        });

        it('respects highlightItemOnHover=false', () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
                template: `
                    <div #root="rdxMenuRoot" [highlightItemOnHover]="false" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>Item</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class NoHoverHighlightHost {}

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [NoHoverHighlightHost] });
            const noHoverFixture = TestBed.createComponent(NoHoverHighlightHost);
            noHoverFixture.detectChanges();
            noHoverFixture.nativeElement.querySelector('[rdxMenuTrigger]').click();
            noHoverFixture.detectChanges();

            const item: HTMLElement = noHoverFixture.nativeElement.querySelector('[rdxMenuItem]');
            const pointerMove = new Event('pointermove', { bubbles: true });
            Object.defineProperty(pointerMove, 'pointerType', { value: 'mouse' });
            item.dispatchEvent(pointerMove);
            noHoverFixture.detectChanges();

            expect(item.hasAttribute('data-highlighted')).toBe(false);
        });

        it('uses root orientation on the popup', () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
                template: `
                    <div #root="rdxMenuRoot" orientation="horizontal" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>Item</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class HorizontalHost {}

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [HorizontalHost] });
            const horizontalFixture = TestBed.createComponent(HorizontalHost);
            horizontalFixture.detectChanges();
            horizontalFixture.nativeElement.querySelector('[rdxMenuTrigger]').click();
            horizontalFixture.detectChanges();

            const horizontalPopup: HTMLElement = horizontalFixture.nativeElement.querySelector('[rdxMenuPopup]');
            expect(horizontalPopup.getAttribute('aria-orientation')).toBe('horizontal');
        });

        it('closes the parent menu on Escape when closeParentOnEsc=true', () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem, RdxMenuSubTrigger],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <ng-container #sub="rdxMenuRoot" [closeParentOnEsc]="true" rdxMenuRoot>
                                        <button rdxMenuSubTrigger>Sub</button>
                                        @if (sub.open()) {
                                            <div rdxMenuPositioner>
                                                <div rdxMenuPopup>
                                                    <button rdxMenuItem>Sub item</button>
                                                </div>
                                            </div>
                                        }
                                    </ng-container>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class CloseParentHost {}

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [CloseParentHost] });
            const closeParentFixture = TestBed.createComponent(CloseParentHost);
            closeParentFixture.detectChanges();
            closeParentFixture.nativeElement.querySelector('[rdxMenuTrigger]').click();
            closeParentFixture.detectChanges();
            closeParentFixture.nativeElement.querySelector('[rdxMenuSubTrigger]').click();
            closeParentFixture.detectChanges();

            const subPopups: HTMLElement[] = Array.from(
                closeParentFixture.nativeElement.querySelectorAll('[rdxMenuPopup]')
            );
            keydown(subPopups[subPopups.length - 1], 'Escape');
            closeParentFixture.detectChanges();

            expect(closeParentFixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(0);
        });
    });

    // ─── RdxMenuBackdrop ──────────────────────────────────────────────────────

    describe('RdxMenuBackdrop', () => {
        it('exposes data-state and data-open/closed', () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem, RdxMenuBackdrop],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuBackdrop></div>
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>Item</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            const backdrop: HTMLElement = f.nativeElement.querySelector('[rdxMenuBackdrop]');
            expect(backdrop).not.toBeNull();
            expect(backdrop.getAttribute('data-state')).toBe('open');
            expect(backdrop.hasAttribute('data-open')).toBe(true);
            expect(backdrop.hasAttribute('data-closed')).toBe(false);
        });
    });

    // ─── RdxMenuArrow ────────────────────────────────────────────────────────

    describe('RdxMenuArrow', () => {
        it('mounts inside the popup and reflects open state', () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem, RdxMenuArrow],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <span rdxMenuArrow></span>
                                    <button rdxMenuItem>Item</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            const arrow: HTMLElement = f.nativeElement.querySelector('[rdxMenuArrow]');
            expect(arrow).not.toBeNull();
            expect(arrow.hasAttribute('data-open')).toBe(true);
        });
    });

    // ─── Transition lifecycle ────────────────────────────────────────────────

    describe('transition lifecycle', () => {
        it('sets data-starting-style on popup when opening', () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>Item</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            const popup: HTMLElement = f.nativeElement.querySelector('[rdxMenuPopup]');
            expect(popup.hasAttribute('data-starting-style')).toBe(true);
        });

        it('emits onOpenChangeComplete(false) after close', async () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
                template: `
                    <div #root="rdxMenuRoot" [(open)]="open" (onOpenChangeComplete)="events.push($event)" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>Item</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {
                open = true;
                events: boolean[] = [];
            }

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            // Wait for open transition to complete
            await new Promise((r) => setTimeout(r, 30));
            f.detectChanges();

            // Now close
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();
            await new Promise((r) => setTimeout(r, 30));
            f.detectChanges();

            expect((f.componentInstance as Host).events).toContain(false);
        });

        it('emits onOpenChangeComplete after open transition', async () => {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
                template: `
                    <div #root="rdxMenuRoot" (onOpenChangeComplete)="events.push($event)" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>Item</button>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {
                events: boolean[] = [];
            }

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host);
            f.detectChanges();
            f.nativeElement.querySelector('[rdxMenuTrigger]').click();
            f.detectChanges();

            await new Promise((r) => setTimeout(r, 30));
            f.detectChanges();

            expect((f.componentInstance as Host).events).toEqual([true]);
        });
    });

    // ─── RdxMenuViewport ──────────────────────────────────────────────────────

    describe('RdxMenuViewport', () => {
        let originalRO: typeof globalThis.ResizeObserver;
        let triggerResize: ((width: number, height: number) => void) | undefined;

        beforeEach(() => {
            originalRO = globalThis.ResizeObserver;
            triggerResize = undefined;
            class MockResizeObserver {
                constructor(private cb: ResizeObserverCallback) {
                    triggerResize = (width: number, height: number) => {
                        this.cb(
                            [{ contentRect: { width, height } } as ResizeObserverEntry],
                            this as unknown as ResizeObserver
                        );
                    };
                }
                observe() {}
                disconnect() {}
                unobserve() {}
            }
            Object.defineProperty(globalThis, 'ResizeObserver', {
                configurable: true,
                value: MockResizeObserver
            });
        });

        afterEach(() => {
            Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: originalRO });
        });

        function makeFixture() {
            @Component({
                imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPositioner, RdxMenuPopup, RdxMenuViewport, RdxMenuItem],
                template: `
                    <div #root="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuTrigger>Open</button>
                        @if (root.open()) {
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <div rdxMenuViewport>
                                        <button rdxMenuItem>Item</button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                `
            })
            class Host {}

            TestBed.configureTestingModule({ imports: [Host] });
            const f = TestBed.createComponent(Host as any);
            f.detectChanges();
            (f.nativeElement as HTMLElement).querySelector('[rdxMenuTrigger]')!.dispatchEvent(new MouseEvent('click'));
            f.detectChanges();
            return f;
        }

        it('renders and exposes --popup-width / --popup-height after first render', async () => {
            const f = makeFixture();
            await nextFrame();
            f.detectChanges();

            const viewport: HTMLElement = (f.nativeElement as HTMLElement).querySelector('[rdxMenuViewport]')!;
            expect(viewport).not.toBeNull();
            // jsdom reports 0 sizes; the vars are still set (px unit binding)
            expect(viewport.style.getPropertyValue('--popup-width')).toBe('0px');
            expect(viewport.style.getPropertyValue('--popup-height')).toBe('0px');
            expect(viewport.hasAttribute('data-transitioning')).toBe(false);
        });

        it('marks data-transitioning when content size changes', async () => {
            const f = makeFixture();
            await nextFrame();
            f.detectChanges();

            const viewport: HTMLElement = (f.nativeElement as HTMLElement).querySelector('[rdxMenuViewport]')!;

            triggerResize?.(220, 120);
            f.detectChanges();

            expect(viewport.style.getPropertyValue('--popup-width')).toBe('220px');
            expect(viewport.style.getPropertyValue('--popup-height')).toBe('120px');
            expect(viewport.hasAttribute('data-transitioning')).toBe(true);
        });
    });
});

describe('Menu structural portal', () => {
    @Component({
        imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPortal, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
        template: `
            <ng-container #root="rdxMenuRoot" rdxMenuRoot>
                <button rdxMenuTrigger>Open</button>

                <div *rdxMenuPortal data-test-portal rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>Item</button>
                    </div>
                </div>
            </ng-container>
        `
    })
    class PortalHost {}

    it('teleports the popup into document.body while open', () => {
        const fixture = TestBed.createComponent(PortalHost);
        fixture.detectChanges();
        expect(document.body.querySelector('[data-test-portal]')).toBeNull();

        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxMenuTrigger]');
        trigger.click();
        fixture.detectChanges();

        const positioner = document.body.querySelector('[data-test-portal]');
        expect(positioner).not.toBeNull();
        expect(positioner!.parentElement).toBe(document.body);
        fixture.destroy();
    });

    it('throws in dev mode when rdxMenuPortal is used as an attribute instead of structurally', () => {
        @Component({
            imports: [
                RdxMenuRoot,
                RdxMenuTrigger,
                RdxMenuPortal,
                RdxMenuPortalMisuseGuard,
                RdxMenuPositioner,
                RdxMenuPopup
            ],
            template: `
                <ng-container rdxMenuRoot>
                    <button rdxMenuTrigger>Open</button>

                    <div rdxMenuPortal>
                        <div rdxMenuPositioner>
                            <div rdxMenuPopup>Oops</div>
                        </div>
                    </div>
                </ng-container>
            `
        })
        class MisuseHost {}

        expect(() => {
            const fixture = TestBed.createComponent(MisuseHost);
            fixture.detectChanges();
        }).toThrow(/structural directive/);
    });
});
