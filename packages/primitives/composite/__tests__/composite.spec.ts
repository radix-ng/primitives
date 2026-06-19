import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    RdxCompositeItem,
    RdxCompositeList,
    RdxCompositeListItem,
    RdxCompositeRoot
} from '@radix-ng/primitives/composite';
import { Direction } from '@radix-ng/primitives/core';

const flushMicrotasks = () => Promise.resolve();

function keydown(element: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    element.dispatchEvent(event);
    return event;
}

@Component({
    template: `
        <div
            [dir]="dir"
            [disabledIndices]="disabledIndices"
            [enableHomeAndEndKeys]="enableHomeAndEndKeys"
            [highlightItemOnHover]="highlightItemOnHover"
            [loopFocus]="loopFocus"
            [modifierKeys]="modifierKeys"
            [orientation]="orientation"
            (onMapChange)="itemMap = $event"
            rdxCompositeRoot
        >
            <button [metadata]="{ id: 'one' }" rdxCompositeItem>One</button>
            <button
                [attr.aria-disabled]="ariaDisableSecond ? 'true' : undefined"
                [attr.data-composite-item-active]="activeSecond ? '' : undefined"
                [metadata]="{ id: 'two' }"
                rdxCompositeItem
            >
                Two
            </button>
            <button [metadata]="{ id: 'three' }" rdxCompositeItem>Three</button>
        </div>
    `,
    imports: [RdxCompositeRoot, RdxCompositeItem]
})
class CompositeHostComponent {
    orientation: 'horizontal' | 'vertical' | 'both' = 'horizontal';
    dir: Direction = 'ltr';
    loopFocus = true;
    enableHomeAndEndKeys = false;
    highlightItemOnHover = false;
    modifierKeys: Array<'Shift' | 'Control' | 'Alt' | 'Meta'> = [];
    disabledIndices: number[] | undefined;
    activeSecond = false;
    ariaDisableSecond = false;
    itemMap = new Map<HTMLElement, { index: number; id?: unknown }>();
}

@Component({
    template: `
        <div orientation="horizontal" rdxCompositeRoot>
            <input rdxCompositeItem value="abc" />
            <button rdxCompositeItem>Next</button>
        </div>
    `,
    imports: [RdxCompositeRoot, RdxCompositeItem]
})
class CompositeInputHostComponent {}

@Component({
    template: `
        <div (onMapChange)="itemMap = $event" rdxCompositeList>
            <button [metadata]="{ id: 'one' }" rdxCompositeListItem>One</button>
            <button [metadata]="{ id: 'two' }" rdxCompositeListItem>Two</button>
        </div>
    `,
    imports: [RdxCompositeList, RdxCompositeListItem]
})
class CompositeListHostComponent {
    itemMap = new Map<HTMLElement, { index: number; id?: unknown }>();
}

describe('RdxCompositeRoot / RdxCompositeItem', () => {
    let fixture: ComponentFixture<CompositeHostComponent>;
    let root: HTMLElement;
    let items: HTMLElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CompositeHostComponent, CompositeInputHostComponent, CompositeListHostComponent]
        });
        fixture = TestBed.createComponent(CompositeHostComponent);
        fixture.detectChanges();
        root = fixture.nativeElement.querySelector('[rdxCompositeRoot]');
        items = Array.from(root.querySelectorAll<HTMLElement>('[rdxCompositeItem]'));
    });

    it('puts the initial highlighted item in the tab order', () => {
        expect(root.hasAttribute('tabindex')).toBe(false);
        expect(items.map((item) => item.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    });

    it('moves focus with arrow keys and updates roving tabindex', async () => {
        items[0].focus();
        fixture.detectChanges();

        const event = keydown(items[0], 'ArrowRight');
        await flushMicrotasks();
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(items[1]);
        expect(items.map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    });

    it('loops focus by default', async () => {
        items[2].focus();
        fixture.detectChanges();

        keydown(items[2], 'ArrowRight');
        await flushMicrotasks();

        expect(document.activeElement).toBe(items[0]);
    });

    it('does not loop when loopFocus is false', async () => {
        fixture.componentInstance.loopFocus = false;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        items[2].focus();
        fixture.detectChanges();

        const event = keydown(items[2], 'ArrowRight');
        await flushMicrotasks();

        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(items[2]);
    });

    it('supports Home and End when enabled', async () => {
        fixture.componentInstance.enableHomeAndEndKeys = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        items[0].focus();
        fixture.detectChanges();

        keydown(items[0], 'End');
        await flushMicrotasks();
        expect(document.activeElement).toBe(items[2]);

        keydown(items[2], 'Home');
        await flushMicrotasks();
        expect(document.activeElement).toBe(items[0]);
    });

    it('ignores Home and End when not enabled', async () => {
        items[0].focus();
        fixture.detectChanges();

        const event = keydown(items[0], 'End');
        await flushMicrotasks();

        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(items[0]);
    });

    it('uses RTL-aware horizontal navigation', async () => {
        fixture.componentInstance.dir = 'rtl';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        items[1].focus();
        fixture.detectChanges();

        keydown(items[1], 'ArrowRight');
        await flushMicrotasks();

        expect(document.activeElement).toBe(items[0]);
    });

    it('skips explicit disabled indices', async () => {
        fixture.componentInstance.disabledIndices = [1];
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        items[0].focus();
        fixture.detectChanges();

        keydown(items[0], 'ArrowRight');
        await flushMicrotasks();

        expect(document.activeElement).toBe(items[2]);
    });

    it('uses aria-disabled only when disabledIndices is not provided', async () => {
        fixture.componentInstance.ariaDisableSecond = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        items[0].focus();
        fixture.detectChanges();

        keydown(items[0], 'ArrowRight');
        await flushMicrotasks();
        expect(document.activeElement).toBe(items[2]);

        fixture.componentInstance.disabledIndices = [];
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        items[0].focus();
        fixture.detectChanges();

        keydown(items[0], 'ArrowRight');
        await flushMicrotasks();
        expect(document.activeElement).toBe(items[1]);
    });

    it('uses data-composite-item-active as the initial highlighted item', () => {
        const activeFixture = TestBed.createComponent(CompositeHostComponent);
        activeFixture.componentInstance.activeSecond = true;
        activeFixture.changeDetectorRef.markForCheck();
        activeFixture.detectChanges();

        const activeRoot: HTMLElement = activeFixture.nativeElement.querySelector('[rdxCompositeRoot]');
        const activeItems = Array.from(activeRoot.querySelectorAll<HTMLElement>('[rdxCompositeItem]'));

        expect(activeItems.map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    });

    it('emits an ordered metadata map', () => {
        expect(Array.from(fixture.componentInstance.itemMap.values())).toEqual([
            { id: 'one', index: 0 },
            { id: 'two', index: 1 },
            { id: 'three', index: 2 }
        ]);
    });

    it('focuses items on hover when highlightItemOnHover is true', () => {
        fixture.componentInstance.highlightItemOnHover = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        items[1].dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));

        expect(document.activeElement).toBe(items[1]);
    });

    it('lets text inputs keep arrow keys until the caret reaches an edge', async () => {
        const inputFixture = TestBed.createComponent(CompositeInputHostComponent);
        inputFixture.detectChanges();

        const input: HTMLInputElement = inputFixture.nativeElement.querySelector('input');
        const button: HTMLButtonElement = inputFixture.nativeElement.querySelector('button');

        input.focus();
        input.setSelectionRange(1, 1);

        const kept = keydown(input, 'ArrowRight');
        await flushMicrotasks();

        expect(kept.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(input);

        input.setSelectionRange(input.value.length, input.value.length);

        const moved = keydown(input, 'ArrowRight');
        await flushMicrotasks();

        expect(moved.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(button);
    });

    it('can collect a composite list without roving focus behavior', () => {
        const listFixture = TestBed.createComponent(CompositeListHostComponent);
        listFixture.detectChanges();

        const list: HTMLElement = listFixture.nativeElement.querySelector('[rdxCompositeList]');
        const listItems = Array.from(list.querySelectorAll<HTMLElement>('[rdxCompositeListItem]'));

        expect(listItems.map((item) => item.getAttribute('tabindex'))).toEqual([null, null]);
        expect(Array.from(listFixture.componentInstance.itemMap.values())).toEqual([
            { id: 'one', index: 0 },
            { id: 'two', index: 1 }
        ]);
    });
});
