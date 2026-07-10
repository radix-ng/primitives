import { ChangeDetectionStrategy, Component, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    RdxCompositeItem,
    RdxCompositeList,
    RdxCompositeListItem,
    RdxCompositeRoot,
    scrollIntoViewIfNeeded
} from '@radix-ng/primitives/composite';
import { Direction } from '@radix-ng/primitives/core';

const flushMicrotasks = () => Promise.resolve();

function keydown(element: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    element.dispatchEvent(event);
    return event;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div orientation="horizontal" rdxCompositeRoot>
            <input rdxCompositeItem type="checkbox" />
            <button rdxCompositeItem>Next</button>
        </div>
    `,
    imports: [RdxCompositeRoot, RdxCompositeItem]
})
class CompositeCheckboxHostComponent {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div (onMapChange)="itemMap = $event" orientation="horizontal" rdxCompositeRoot>
            @for (id of order(); track id) {
                <button [metadata]="{ id }" rdxCompositeItem>{{ id }}</button>
            }
        </div>
    `,
    imports: [RdxCompositeRoot, RdxCompositeItem]
})
class CompositeForHostComponent {
    readonly order = signal(['one', 'two', 'three']);
    itemMap = new Map<HTMLElement, { index: number; id?: unknown }>();
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div (onMapChange)="itemMap = $event" orientation="horizontal" rdxCompositeRoot>
            @for (group of groups(); track group.id) {
                <div class="group">
                    @for (item of group.items; track item) {
                        <button [metadata]="{ id: item }" rdxCompositeItem>{{ item }}</button>
                    }
                </div>
            }
        </div>
    `,
    imports: [RdxCompositeRoot, RdxCompositeItem]
})
class CompositeGroupedHostComponent {
    readonly groups = signal([
        { id: 'a', items: ['a1', 'a2'] },
        { id: 'b', items: ['b1', 'b2'] }
    ]);
    itemMap = new Map<HTMLElement, { index: number; id?: unknown }>();
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div [disabledIndices]="disabledIndices" orientation="horizontal" rdxCompositeRoot>
            <button rdxCompositeItem>One</button>
            <button aria-disabled="true" rdxCompositeItem>Two</button>
            <button rdxCompositeItem>Three</button>
        </div>
    `,
    imports: [RdxCompositeRoot, RdxCompositeItem]
})
class CompositeControlledHostComponent {
    disabledIndices: number[] | undefined = undefined;
    @ViewChild(RdxCompositeRoot) root!: RdxCompositeRoot;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div
            [(highlightedIndex)]="highlightedIndex"
            [disabledIndices]="disabledIndices"
            orientation="horizontal"
            rdxCompositeRoot
        >
            <button rdxCompositeItem>One</button>
            <button aria-disabled="true" rdxCompositeItem>Two</button>
            <button rdxCompositeItem>Three</button>
        </div>
    `,
    imports: [RdxCompositeRoot, RdxCompositeItem]
})
class CompositeBoundHostComponent {
    highlightedIndex = 0;
    disabledIndices: number[] | undefined = undefined;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div [disabledIndices]="disabledIndices" orientation="horizontal" rdxCompositeRoot>
            <button rdxCompositeItem>One</button>
            <button disabled rdxCompositeItem>Two</button>
            <button rdxCompositeItem>Three</button>
        </div>
    `,
    imports: [RdxCompositeRoot, RdxCompositeItem]
})
class CompositeNativeDisabledHostComponent {
    // An empty explicit list marks every item enabled — the natively disabled one must still be skipped.
    disabledIndices: number[] | undefined = [];
}

describe('RdxCompositeRoot / RdxCompositeItem', () => {
    let fixture: ComponentFixture<CompositeHostComponent>;
    let root: HTMLElement;
    let items: HTMLElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CompositeHostComponent,
                CompositeInputHostComponent,
                CompositeCheckboxHostComponent,
                CompositeListHostComponent,
                CompositeForHostComponent,
                CompositeGroupedHostComponent,
                CompositeControlledHostComponent,
                CompositeBoundHostComponent,
                CompositeNativeDisabledHostComponent
            ]
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

    it('always skips a natively disabled item, even when disabledIndices marks it enabled', async () => {
        const nativeFixture = TestBed.createComponent(CompositeNativeDisabledHostComponent);
        nativeFixture.detectChanges();
        const nativeItems = Array.from(nativeFixture.nativeElement.querySelectorAll<HTMLElement>('[rdxCompositeItem]'));

        nativeItems[0].focus();
        nativeFixture.detectChanges();

        keydown(nativeItems[0], 'ArrowRight');
        await flushMicrotasks();
        nativeFixture.detectChanges();

        // A natively disabled element can never receive focus, so it can't hold the roving tab stop —
        // unlike aria-disabled (see the previous test), an explicit disabledIndices does not re-enable it.
        expect(document.activeElement).toBe(nativeItems[2]);
        expect(nativeItems.map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
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

    it('re-sorts registered items when they are moved in the DOM without re-registering', async () => {
        const [one, two, three] = items;

        // Reorder in place: (One, Two, Three) -> (Three, One, Two). This mirrors an
        // `@for` reorder that reuses views — the item directives never re-register,
        // so only a DOM-move observer can keep the index map correct.
        root.insertBefore(three, one);

        // Let the MutationObserver deliver (microtask) and the reorder tick flush.
        await new Promise((resolve) => setTimeout(resolve));
        await fixture.whenStable();
        fixture.detectChanges();

        const orderedIds = Array.from(fixture.componentInstance.itemMap.entries())
            .sort(([, a], [, b]) => a.index - b.index)
            .map(([, meta]) => meta.id);

        expect(orderedIds).toEqual(['three', 'one', 'two']);
        // Roving tabindex is positional: index 0 stays highlighted, now on "Three".
        expect(three.getAttribute('tabindex')).toBe('0');
        expect(one.getAttribute('tabindex')).toBe('-1');
        expect(two.getAttribute('tabindex')).toBe('-1');
    });

    it('re-sorts items after an @for reorder that reuses views', async () => {
        const forFixture = TestBed.createComponent(CompositeForHostComponent);
        forFixture.detectChanges();
        await forFixture.whenStable();
        forFixture.detectChanges();

        const idsByIndex = () =>
            Array.from(forFixture.componentInstance.itemMap.entries())
                .sort(([, a], [, b]) => a.index - b.index)
                .map(([, meta]) => meta.id);

        expect(idsByIndex()).toEqual(['one', 'two', 'three']);

        // Reverse the tracked array: Angular reuses the views and moves the DOM
        // nodes without re-running item registration.
        forFixture.componentInstance.order.set(['three', 'two', 'one']);
        forFixture.detectChanges();

        await new Promise((resolve) => setTimeout(resolve));
        await forFixture.whenStable();
        forFixture.detectChanges();

        expect(idsByIndex()).toEqual(['three', 'two', 'one']);
    });

    it('re-sorts items when a wrapping group is moved (grouped reorder)', async () => {
        const groupedFixture = TestBed.createComponent(CompositeGroupedHostComponent);
        groupedFixture.detectChanges();
        await groupedFixture.whenStable();
        groupedFixture.detectChanges();

        const idsByIndex = () =>
            Array.from(groupedFixture.componentInstance.itemMap.entries())
                .sort(([, a], [, b]) => a.index - b.index)
                .map(([, meta]) => meta.id);

        expect(idsByIndex()).toEqual(['a1', 'a2', 'b1', 'b2']);

        // Reverse the GROUPS: Angular moves the wrapper `div`s (with their items) as
        // units — the items are never directly re-registered, and the move shows up
        // as a childList mutation on the root (the groups' common ancestor).
        groupedFixture.componentInstance.groups.update((current) => [...current].reverse());
        groupedFixture.detectChanges();

        await new Promise((resolve) => setTimeout(resolve));
        await groupedFixture.whenStable();
        groupedFixture.detectChanges();

        expect(idsByIndex()).toEqual(['b1', 'b2', 'a1', 'a2']);
    });

    it('does not steal a controlled highlightedIndex on a DOM-disabled item when disabledIndices is absent', async () => {
        const controlledFixture = TestBed.createComponent(CompositeControlledHostComponent);
        controlledFixture.detectChanges();
        await controlledFixture.whenStable();
        controlledFixture.detectChanges();

        const root = controlledFixture.componentInstance.root;

        // Consumer moves the tab stop onto the aria-disabled item. With no `disabledIndices`, the root
        // must not re-validate the index away (Base UI parity) — the DOM disabled fallback drives
        // navigation, not the root's index ownership.
        root.highlightedIndex.set(1);
        controlledFixture.detectChanges();
        await controlledFixture.whenStable();
        controlledFixture.detectChanges();

        expect(root.highlightedIndex()).toBe(1);
    });

    it('re-validates a highlightedIndex off a disabled item when disabledIndices is provided', async () => {
        const controlledFixture = TestBed.createComponent(CompositeControlledHostComponent);
        controlledFixture.componentInstance.disabledIndices = [1];
        controlledFixture.changeDetectorRef.markForCheck();
        controlledFixture.detectChanges();
        await controlledFixture.whenStable();
        controlledFixture.detectChanges();

        const root = controlledFixture.componentInstance.root;

        // With `disabledIndices` explicitly provided, the gate opens: a highlighted index landing on a
        // disabled item is moved to the first enabled one.
        root.highlightedIndex.set(1);
        controlledFixture.detectChanges();
        await controlledFixture.whenStable();
        controlledFixture.detectChanges();

        expect(root.highlightedIndex()).toBe(0);
    });

    it('leaves an externally bound highlightedIndex on a DOM-disabled item alone without disabledIndices', async () => {
        const boundFixture = TestBed.createComponent(CompositeBoundHostComponent);
        boundFixture.detectChanges();
        await boundFixture.whenStable();
        boundFixture.detectChanges();

        // Parent drives the two-way binding onto the aria-disabled item. With no `disabledIndices` the
        // gate is closed, so the root does not touch the consumer's bound value.
        boundFixture.componentInstance.highlightedIndex = 1;
        boundFixture.changeDetectorRef.markForCheck();
        boundFixture.detectChanges();
        await boundFixture.whenStable();
        boundFixture.detectChanges();

        expect(boundFixture.componentInstance.highlightedIndex).toBe(1);
    });

    it('re-validates and writes back an externally bound highlightedIndex when disabledIndices is provided', async () => {
        // Documents the deliberate divergence from Base UI: Angular's `model()` cannot tell a controlled
        // `[(highlightedIndex)]` from an uncontrolled one, so with `disabledIndices` provided the root
        // corrects a disabled index and the correction propagates back through the two-way binding.
        const boundFixture = TestBed.createComponent(CompositeBoundHostComponent);
        boundFixture.componentInstance.disabledIndices = [1];
        boundFixture.changeDetectorRef.markForCheck();
        boundFixture.detectChanges();
        await boundFixture.whenStable();
        boundFixture.detectChanges();

        boundFixture.componentInstance.highlightedIndex = 1;
        boundFixture.changeDetectorRef.markForCheck();
        boundFixture.detectChanges();
        await boundFixture.whenStable();
        boundFixture.detectChanges();

        expect(boundFixture.componentInstance.highlightedIndex).toBe(0);
    });

    it('aligns a wider-than-container item by the leading edge per direction (Base UI edge order)', () => {
        const container = document.createElement('div');
        const element = document.createElement('div');
        container.appendChild(element);
        document.body.appendChild(container);

        const setGeometry = (el: HTMLElement, props: Record<string, unknown>) => {
            for (const [key, value] of Object.entries(props)) {
                Object.defineProperty(el, key, { configurable: true, value });
            }
        };

        // Container shows [100, 200); the element spans [50, 250], so it overflows on both sides —
        // the only case where the LTR/RTL edge order matters. jsdom has no layout, so mock the geometry.
        setGeometry(container, {
            clientWidth: 100,
            scrollWidth: 300,
            clientHeight: 0,
            scrollHeight: 0,
            scrollLeft: 100,
            scrollTop: 0
        });
        setGeometry(element, {
            offsetWidth: 200,
            offsetHeight: 0,
            offsetLeft: 50,
            offsetTop: 0,
            offsetParent: container
        });

        let scrolledLeft: number | undefined;
        container.scrollTo = ((options: ScrollToOptions) => {
            scrolledLeft = options.left;
        }) as typeof container.scrollTo;

        // LTR resolves the right-edge overflow first → align right edges: 50 + 200 - 100 = 150.
        scrollIntoViewIfNeeded(container, element, 'ltr', 'horizontal');
        expect(scrolledLeft).toBe(150);

        // RTL resolves the left-edge overflow first → align left edges: 50.
        scrollIntoViewIfNeeded(container, element, 'rtl', 'horizontal');
        expect(scrolledLeft).toBe(50);

        container.remove();
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

    it('navigates with arrow keys when a non-text input (checkbox) is the focused item', async () => {
        const checkboxFixture = TestBed.createComponent(CompositeCheckboxHostComponent);
        checkboxFixture.detectChanges();

        const checkbox: HTMLInputElement = checkboxFixture.nativeElement.querySelector('input');
        const button: HTMLButtonElement = checkboxFixture.nativeElement.querySelector('button');

        checkbox.focus();
        checkboxFixture.detectChanges();

        const event = keydown(checkbox, 'ArrowRight');
        await flushMicrotasks();

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(button);
    });

    it('selects the whole value when focus lands on a native text input item', () => {
        const inputFixture = TestBed.createComponent(CompositeInputHostComponent);
        inputFixture.detectChanges();

        const input: HTMLInputElement = inputFixture.nativeElement.querySelector('input');

        input.focus();
        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

        expect(input.selectionStart).toBe(0);
        expect(input.selectionEnd).toBe(input.value.length);
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
