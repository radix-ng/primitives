import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxRovingFocusGroupDirective } from '../src/roving-focus-group.directive';
import { RdxRovingFocusItemDirective } from '../src/roving-focus-item.directive';

const flushMicrotasks = () => Promise.resolve();

function pressKey(element: HTMLElement, key: string, init: KeyboardEventInit = {}): void {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
}

@Component({
    template: `
        <div [orientation]="orientation" [loop]="loop" rdxRovingFocusGroup>
            <button rdxRovingFocusItem>One</button>
            <button [focusable]="secondFocusable" rdxRovingFocusItem>Two</button>
            <button rdxRovingFocusItem>Three</button>
        </div>
    `,
    imports: [RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective]
})
class ItemHostComponent {
    orientation: 'horizontal' | 'vertical' = 'horizontal';
    loop = true;
    secondFocusable = true;
}

describe('RdxRovingFocusItemDirective', () => {
    let fixture: ComponentFixture<ItemHostComponent>;
    let host: HTMLElement;
    let buttons: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ItemHostComponent] });
        fixture = TestBed.createComponent(ItemHostComponent);
        fixture.detectChanges();
        host = fixture.nativeElement.querySelector('[rdxRovingFocusGroup]');
        buttons = Array.from(host.querySelectorAll('button'));
    });

    it('does not mark items as active by default', () => {
        expect(buttons.some((button) => button.hasAttribute('data-active'))).toBe(false);
    });

    it('moves the tab stop to the focused item', () => {
        expect(buttons.every((button) => button.getAttribute('tabindex') === '-1')).toBe(true);

        buttons[0].focus();
        fixture.detectChanges();

        expect(buttons[0].getAttribute('tabindex')).toBe('0');
        expect(buttons[1].getAttribute('tabindex')).toBe('-1');
        expect(buttons[2].getAttribute('tabindex')).toBe('-1');
    });

    it('navigates to the next item on ArrowRight', async () => {
        buttons[0].focus();
        fixture.detectChanges();

        pressKey(buttons[0], 'ArrowRight');
        await flushMicrotasks();

        expect(document.activeElement).toBe(buttons[1]);
    });

    it('navigates to the previous item on ArrowLeft', async () => {
        buttons[2].focus();
        fixture.detectChanges();

        pressKey(buttons[2], 'ArrowLeft');
        await flushMicrotasks();

        expect(document.activeElement).toBe(buttons[1]);
    });

    it('loops from the last item back to the first when loop is enabled', async () => {
        buttons[2].focus();
        fixture.detectChanges();

        pressKey(buttons[2], 'ArrowRight');
        await flushMicrotasks();

        expect(document.activeElement).toBe(buttons[0]);
    });

    it('does not loop past the last item when loop is disabled', async () => {
        fixture.componentInstance.loop = false;
        fixture.detectChanges();

        buttons[2].focus();
        fixture.detectChanges();

        pressKey(buttons[2], 'ArrowRight');
        await flushMicrotasks();

        expect(document.activeElement).toBe(buttons[2]);
    });

    it('focuses the first/last item on Home/End', async () => {
        buttons[1].focus();
        fixture.detectChanges();

        pressKey(buttons[1], 'End');
        await flushMicrotasks();
        expect(document.activeElement).toBe(buttons[2]);

        pressKey(buttons[2], 'Home');
        await flushMicrotasks();
        expect(document.activeElement).toBe(buttons[0]);
    });

    it('ignores horizontal arrows when orientation is vertical', async () => {
        fixture.componentInstance.orientation = 'vertical';
        fixture.detectChanges();

        buttons[0].focus();
        fixture.detectChanges();

        pressKey(buttons[0], 'ArrowRight');
        await flushMicrotasks();
        expect(document.activeElement).toBe(buttons[0]);

        pressKey(buttons[0], 'ArrowDown');
        await flushMicrotasks();
        expect(document.activeElement).toBe(buttons[1]);
    });

    it('skips non-focusable items during navigation', async () => {
        fixture.componentInstance.secondFocusable = false;
        fixture.detectChanges();

        expect(buttons[1].getAttribute('data-disabled')).toBe('');

        buttons[0].focus();
        fixture.detectChanges();

        pressKey(buttons[0], 'ArrowRight');
        await flushMicrotasks();

        expect(document.activeElement).toBe(buttons[2]);
    });

    it('moves the tab stop when the current item becomes non-focusable', () => {
        buttons[1].focus();
        fixture.detectChanges();

        fixture.componentInstance.secondFocusable = false;
        fixture.detectChanges();

        expect(buttons[0].getAttribute('tabindex')).toBe('0');
        expect(buttons[1].getAttribute('tabindex')).toBe('-1');
        expect(buttons[2].getAttribute('tabindex')).toBe('-1');
    });

    it('registers an item once focusable flips to true', async () => {
        fixture.componentInstance.secondFocusable = false;
        fixture.detectChanges();

        fixture.componentInstance.secondFocusable = true;
        fixture.detectChanges();

        buttons[0].focus();
        fixture.detectChanges();

        // The re-registered item lands between its DOM siblings, not at the end of the registry.
        pressKey(buttons[0], 'ArrowRight');
        await flushMicrotasks();

        expect(document.activeElement).toBe(buttons[1]);
    });

    it('restores focus to the current tab stop when focus re-enters the group', () => {
        buttons[1].focus();
        fixture.detectChanges();

        // Simulate tabbing back into the group container.
        host.focus();

        expect(document.activeElement).toBe(buttons[1]);
    });

    it('focuses the active item first when focus enters the group', () => {
        // Mark the third item as active via its data attribute path.
        buttons[2].setAttribute('data-active', 'true');

        host.focus();

        expect(document.activeElement).toBe(buttons[2]);
    });

    it('restores the group tab stop after tabbing backwards out', () => {
        buttons[0].focus();
        fixture.detectChanges();

        pressKey(buttons[0], 'Tab', { shiftKey: true });
        fixture.detectChanges();
        expect(host.getAttribute('tabindex')).toBe('-1');

        buttons[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        fixture.detectChanges();

        expect(host.getAttribute('tabindex')).toBe('0');
    });

    it('exposes the orientation value on items', () => {
        expect(buttons[0].getAttribute('data-orientation')).toBe('horizontal');

        fixture.componentInstance.orientation = 'vertical';
        fixture.detectChanges();

        expect(buttons[0].getAttribute('data-orientation')).toBe('vertical');
    });

    it('does not apply visual styles to the group', () => {
        expect(host.style.outline).toBe('');
    });
});
