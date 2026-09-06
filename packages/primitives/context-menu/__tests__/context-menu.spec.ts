import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxContextMenuModule, RdxContextMenuRoot } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule, RdxMenuRoot } from '@radix-ng/primitives/menu';
import { afterEach, vi } from 'vitest';

function rightClick(target: Element, clientX = 120, clientY = 80) {
    target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX, clientY }));
}

function pointerDown(target: Element) {
    target.dispatchEvent(new Event('pointerdown', { bubbles: true }));
}

function keydown(target: Element, key: string) {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function flushRaf() {
    return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

afterEach(() => {
    vi.useRealTimers();
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxContextMenuModule, RdxMenuModule],
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div [attr.data-disabled-trigger]="disabled" rdxContextMenuTrigger>Right click area</div>

            @if (root.menuRoot.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>Back</button>
                        <button rdxMenuItem>Reload</button>
                    </div>
                </div>
            }
        </ng-container>
    `
})
class ContextMenuHost {
    disabled = false;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxContextMenuModule, RdxMenuModule],
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div [disabled]="true" rdxContextMenuTrigger>Right click area</div>

            @if (root.menuRoot.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>Back</button>
                    </div>
                </div>
            }
        </ng-container>
    `
})
class DisabledContextMenuHost {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxContextMenuModule, RdxMenuModule],
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div rdxContextMenuTrigger>Right click area</div>

            @if (root.menuRoot.open()) {
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button rdxMenuItem>Back</button>
                        <ng-container #sub="rdxMenuRoot" rdxMenuRoot>
                            <button rdxMenuSubTrigger>More</button>
                            <div class="submenu-positioner" *rdxMenuPortal rdxMenuPositioner>
                                <div rdxMenuPopup>
                                    <button rdxMenuItem>Save as…</button>
                                </div>
                            </div>
                        </ng-container>
                    </div>
                </div>
            }
        </ng-container>
    `
})
class NestedContextMenuHost {
    /** The submenu's own root — it carries no context-menu marker of its own. */
    readonly submenu = viewChild<RdxMenuRoot>('sub');
    /** The context menu's root, for comparison. */
    readonly root = viewChild<RdxContextMenuRoot>('root');
}

describe('ContextMenu', () => {
    let fixture: ComponentFixture<ContextMenuHost>;
    let trigger: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ContextMenuHost] });
        fixture = TestBed.createComponent(ContextMenuHost);
        fixture.detectChanges();
        trigger = fixture.nativeElement.querySelector('[rdxContextMenuTrigger]');
    });

    it('is closed by default', () => {
        expect(trigger.hasAttribute('data-popup-open')).toBe(false);
        expect(fixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(0);
    });

    it('opens the popup on right click', () => {
        rightClick(trigger);
        fixture.detectChanges();

        expect(trigger.hasAttribute('data-popup-open')).toBe(true);
        expect(fixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(1);
    });

    it('a pointer right-click focuses the popup without highlighting an item', async () => {
        // A pointerdown immediately precedes the contextmenu, marking it as pointer-initiated.
        pointerDown(trigger);
        rightClick(trigger);
        fixture.detectChanges();
        await flushRaf();
        fixture.detectChanges();

        const popup: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuPopup]');
        expect(document.activeElement).toBe(popup);
        expect(fixture.nativeElement.querySelector('[rdxMenuItem][data-highlighted]')).toBeNull();
    });

    it('a keyboard context menu highlights the first item', async () => {
        // No preceding pointerdown — treated as keyboard-initiated.
        rightClick(trigger);
        fixture.detectChanges();
        await flushRaf();
        fixture.detectChanges();

        const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[rdxMenuItem]'));
        expect(document.activeElement).toBe(items[0]);
        expect(items[0].getAttribute('data-highlighted')).toBe('');
    });

    it('prevents the native context menu', () => {
        const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 });
        trigger.dispatchEvent(event);
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
    });

    it('does not cancel opening on mouseup before the 500ms grace window elapses', () => {
        vi.useFakeTimers();

        pointerDown(trigger);
        rightClick(trigger);
        fixture.detectChanges();

        vi.advanceTimersByTime(499);
        document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        fixture.detectChanges();

        expect(trigger.hasAttribute('data-popup-open')).toBe(true);
        expect(fixture.nativeElement.querySelector('[rdxMenuPopup]')).not.toBeNull();
    });

    it('cancels opening on mouseup outside after the 500ms grace window', () => {
        vi.useFakeTimers();

        pointerDown(trigger);
        rightClick(trigger);
        fixture.detectChanges();

        vi.advanceTimersByTime(500);
        document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        fixture.detectChanges();

        expect(trigger.hasAttribute('data-popup-open')).toBe(false);
        expect(fixture.nativeElement.querySelector('[rdxMenuPopup]')).toBeNull();
    });

    it('closes on Escape and stays closed', () => {
        rightClick(trigger);
        fixture.detectChanges();
        expect(trigger.hasAttribute('data-popup-open')).toBe(true);

        const popup: HTMLElement = fixture.nativeElement.querySelector('[rdxMenuPopup]');
        keydown(popup, 'Escape');
        fixture.detectChanges();

        expect(trigger.hasAttribute('data-popup-open')).toBe(false);
        expect(fixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(0);
    });

    describe('a submenu inside it', () => {
        /** Opens the submenu so its portaled positioner mounts. */
        function openSubmenu(nested: ComponentFixture<NestedContextMenuHost>): void {
            const subTrigger: HTMLElement = nested.nativeElement.querySelector('[rdxMenuSubTrigger]');
            keydown(subTrigger, 'Enter');
            nested.detectChanges();
        }

        function openNested(): ComponentFixture<NestedContextMenuHost> {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [NestedContextMenuHost] });
            const nested = TestBed.createComponent(NestedContextMenuHost);
            nested.detectChanges();
            rightClick(nested.nativeElement.querySelector('[rdxContextMenuTrigger]'));
            nested.detectChanges();
            return nested;
        }

        it('inherits the context-menu flag, so its items follow the same gesture rules', () => {
            const nested = openNested();
            // Only the root marks itself as a context menu; a submenu has no marker of its own and
            // must read the flag through its parent, or its items would fall back to dropdown rules.
            expect(nested.componentInstance.root()?.menuRoot.isContextMenu()).toBe(true);
            expect(nested.componentInstance.submenu()?.isContextMenu()).toBe(true);
        });

        it('shares one owner id across the whole chain, submenu included', () => {
            const nested = openNested();
            openSubmenu(nested);
            // The submenu positioner is portaled into <body>, so collect from the document.
            const owners = Array.from(document.querySelectorAll<HTMLElement>('[rdxMenuPositioner]')).map((element) =>
                element.getAttribute('data-rdx-menu-owner')
            );

            expect(owners.length).toBeGreaterThan(1);
            expect(new Set(owners).size).toBe(1);
        });
    });

    describe('the cancel-open guard', () => {
        // The trigger watches for the release that ends the opening gesture and closes the menu when it
        // lands outside. "Outside" must mean outside the whole menu chain — the positioner wraps the
        // popup, and a submenu is portaled as a sibling rather than nested inside it.
        function mouseUpOn(target: Element): void {
            target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }

        /** Opens the menu and waits out the guard's arming delay. */
        function openAndArm(host: ComponentFixture<NestedContextMenuHost>): void {
            vi.useFakeTimers();
            rightClick(host.nativeElement.querySelector('[rdxContextMenuTrigger]'));
            host.detectChanges();
            vi.advanceTimersByTime(600);
        }

        function nestedFixture(): ComponentFixture<NestedContextMenuHost> {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [NestedContextMenuHost] });
            const nested = TestBed.createComponent(NestedContextMenuHost);
            nested.detectChanges();
            return nested;
        }

        it('closes on a release outside the menu', () => {
            // Without this the two checks below would pass on a guard that never fires.
            const nested = nestedFixture();
            openAndArm(nested);
            expect(nested.componentInstance.root()?.menuRoot.open()).toBe(true);

            mouseUpOn(document.body);
            nested.detectChanges();

            expect(nested.componentInstance.root()?.menuRoot.open()).toBe(false);
        });

        it('survives a release on the positioner that wraps the popup', () => {
            const nested = nestedFixture();
            openAndArm(nested);

            mouseUpOn(nested.nativeElement.querySelector('[rdxMenuPositioner]'));
            nested.detectChanges();

            expect(nested.componentInstance.root()?.menuRoot.open()).toBe(true);
        });

        it('survives a release inside a submenu of the same chain', () => {
            const nested = nestedFixture();
            openAndArm(nested);

            // The submenu positioner is a DOM sibling of the root's, not a descendant; it is recognized
            // through the shared owner id rather than containment.
            const subTrigger: HTMLElement = nested.nativeElement.querySelector('[rdxMenuSubTrigger]');
            keydown(subTrigger, 'Enter');
            nested.detectChanges();

            const submenuPositioner = document.querySelector<HTMLElement>('.submenu-positioner');
            expect(submenuPositioner).not.toBeNull();
            expect(nested.nativeElement.contains(submenuPositioner)).toBe(false);
            mouseUpOn(submenuPositioner!);
            nested.detectChanges();

            expect(nested.componentInstance.root()?.menuRoot.open()).toBe(true);
        });
    });

    it('does not open when the trigger is disabled', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ imports: [DisabledContextMenuHost] });
        const disabledFixture = TestBed.createComponent(DisabledContextMenuHost);
        disabledFixture.detectChanges();
        const disabledTrigger: HTMLElement = disabledFixture.nativeElement.querySelector('[rdxContextMenuTrigger]');

        rightClick(disabledTrigger);
        disabledFixture.detectChanges();

        expect(disabledTrigger.hasAttribute('data-popup-open')).toBe(false);
        expect(disabledFixture.nativeElement.querySelectorAll('[rdxMenuPopup]').length).toBe(0);
    });
});
