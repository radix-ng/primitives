import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxMenuItemHighlightedEvent, RdxMenuModule, RdxMenuRoot } from '../index';

@Component({
    imports: [RdxMenuModule],
    template: `
        <ng-container #root="rdxMenuRoot" (onItemHighlighted)="changes.push($event)" rdxMenuRoot>
            <button rdxMenuTrigger>Actions</button>
            <div *rdxMenuPortal rdxMenuPositioner>
                <div rdxMenuPopup>
                    @for (item of items(); track item.id) {
                        <button [label]="item.label" rdxMenuItem>{{ item.text }}</button>
                    }
                    <button rdxMenuCheckboxItem>Checkbox</button>
                    <div rdxMenuRadioGroup><button value="one" rdxMenuRadioItem>Radio</button></div>
                    <a href="#action" rdxMenuLinkItem>Link</a>
                </div>
            </div>
        </ng-container>
    `
})
class Host {
    readonly root = viewChild.required(RdxMenuRoot);
    readonly items = signal([
        { id: 'first', text: 'First action', label: 'Explicit label' },
        { id: 'second', text: 'Second action', label: undefined as string | undefined }
    ]);
    readonly changes: RdxMenuItemHighlightedEvent[] = [];
}

async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    fixture.componentInstance.root().show('popup');
    await fixture.whenStable();
    return { fixture, host: fixture.componentInstance };
}

describe('Menu highlighted-item output', () => {
    it('preserves the original keyboard event, explicit label, and does not repeat on focus or a no-op', async () => {
        const { fixture, host } = await setup();
        try {
            expect(host.changes).toEqual([]);
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
            document.querySelector('[rdxMenuPopup]')!.dispatchEvent(event);
            await fixture.whenStable();
            expect(host.changes).toEqual([
                {
                    item: document.querySelector('[rdxMenuItem]'),
                    label: 'Explicit label',
                    reason: 'keyboard',
                    event
                }
            ]);
            host.root().setActiveIndex(0, new KeyboardEvent('keydown', { key: 'Home' }));
            await fixture.whenStable();
            expect(host.changes).toHaveLength(1);
        } finally {
            fixture.destroy();
        }
    });

    it('reports a replacement at the same index with no stale keyboard provenance', async () => {
        const { fixture, host } = await setup();
        try {
            host.root().setActiveIndex(0, new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            await fixture.whenStable();
            const first = host.changes.at(-1)!.item;
            host.items.update((items) => [{ id: 'new', text: 'New action', label: undefined }, ...items.slice(1)]);
            await fixture.whenStable();
            expect(host.root().activeIndex()).toBe(0);
            expect(host.changes).toHaveLength(2);
            expect(host.changes.at(-1)).toMatchObject({ label: 'New action', reason: 'none' });
            expect(host.changes.at(-1)!.item).not.toBe(first);
            expect(host.changes.at(-1)!.event).not.toBeInstanceOf(KeyboardEvent);
        } finally {
            fixture.destroy();
        }
    });

    it('does not re-emit a label update alone, and reads the new label on the next entry', async () => {
        const { fixture, host } = await setup();
        try {
            host.root().setActiveIndex(0);
            await fixture.whenStable();
            host.items.update((items) => items.map((item) => ({ ...item, label: 'Updated label' })));
            await fixture.whenStable();
            expect(host.changes).toHaveLength(1);
            host.root().setActiveIndex(1);
            await fixture.whenStable();
            host.root().setActiveIndex(0);
            await fixture.whenStable();
            expect(host.changes.at(-1)?.label).toBe('Updated label');
        } finally {
            fixture.destroy();
        }
    });

    it.each(['rdxMenuItem', 'rdxMenuCheckboxItem', 'rdxMenuRadioItem', 'rdxMenuLinkItem'])(
        'reports native hover and leave for %s',
        async (part) => {
            const { fixture, host } = await setup();
            try {
                const item = document.querySelector<HTMLElement>(`[${part}]`)!;
                const move = Object.assign(
                    new MouseEvent('pointermove', {
                        clientX: 30,
                        clientY: 20,
                        bubbles: true
                    }),
                    { pointerType: 'mouse' }
                );
                item.dispatchEvent(move);
                await fixture.whenStable();
                expect(host.changes.at(-1)).toMatchObject({ item, reason: 'pointer', event: move });
                const leave = Object.assign(new MouseEvent('pointerleave'), { pointerType: 'mouse' });
                item.dispatchEvent(leave);
                await fixture.whenStable();
                expect(host.changes.at(-1)).toMatchObject({ item: undefined, reason: 'pointer', event: leave });
            } finally {
                fixture.destroy();
            }
        }
    );

    it('a subscriber added after highlighting receives the later clear, without replaying the old item', async () => {
        const { fixture, host } = await setup();
        try {
            host.root().setActiveIndex(0);
            await fixture.whenStable();
            const listener = vi.fn();
            const subscription = host.root().onItemHighlighted.subscribe(listener);
            await fixture.whenStable();
            expect(listener).not.toHaveBeenCalled();
            host.root().close();
            await fixture.whenStable();
            expect(listener).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ item: undefined, reason: 'none' })
            );
            subscription.unsubscribe();
        } finally {
            fixture.destroy();
        }
    });
});
