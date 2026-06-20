import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
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
