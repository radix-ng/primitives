import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxMenuModule, RdxMenuRoot } from '@radix-ng/primitives/menu';
import { describe, expect, it } from 'vitest';

@Component({
    imports: [RdxMenuModule],
    template: `
        <ng-container #main="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger><span>Actions</span></button>
            <div rdxMenuPopup>
                <button [disabled]="true" rdxMenuItem>Disabled item</button>
                <button [disabled]="true" rdxMenuCheckboxItem>Disabled checkbox</button>
                <div rdxMenuRadioGroup>
                    <button [disabled]="true" value="one" rdxMenuRadioItem>Disabled radio</button>
                </div>
                <ng-container #child="rdxMenuRoot" rdxMenuRoot><button rdxMenuSubTrigger>More</button></ng-container>
            </div>
        </ng-container>
    `
})
class TouchMenu {
    readonly main = viewChild.required<RdxMenuRoot>('main');
    readonly child = viewChild.required<RdxMenuRoot>('child');
}

function pointer(target: HTMLElement, type: 'touch' | 'mouse') {
    const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, detail: 1 });
    Object.defineProperty(event, 'pointerType', { value: type });
    target.dispatchEvent(event);
    return event;
}

describe('Menu touch ownership', () => {
    it('classifies compatibility mousedown from its trigger while preserving the original event', async () => {
        TestBed.resetTestingModule();
        const fixture = TestBed.createComponent(TouchMenu);
        fixture.autoDetectChanges();
        try {
            await fixture.whenStable();
            const root = fixture.componentInstance.main();
            const label = fixture.nativeElement.querySelector('span') as HTMLElement;
            const trigger = fixture.nativeElement.querySelector('[rdxMenuTrigger]') as HTMLElement;
            let original: Event | undefined;
            root.onOpenChange.subscribe((change) => {
                original = change.event;
            });
            pointer(label, 'touch');
            const mouse = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, detail: 1 });
            label.dispatchEvent(mouse);
            await fixture.whenStable();
            expect(original).toBe(mouse);
            expect(root.openInteractionType()).toBe('touch');
            expect(root.openedByTouch()).toBe(true);
            trigger.dispatchEvent(new Event('pointerup'));
            await fixture.whenStable();
            expect(trigger.hasAttribute('data-pressed')).toBe(true);
            root.close();
            await fixture.whenStable();
            expect(trigger.hasAttribute('data-pressed')).toBe(false);

            pointer(label, 'mouse');
            label.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, detail: 1 }));
            expect(root.openInteractionType()).toBe('mouse');
            expect(root.openedByTouch()).toBe(false);
        } finally {
            fixture.destroy();
        }
    });

    it.each(['rdxMenuItem', 'rdxMenuCheckboxItem', 'rdxMenuRadioItem'])(
        'prevents pointer focus on disabled %s without making it unfocusable',
        async (selector) => {
            TestBed.resetTestingModule();
            const fixture = TestBed.createComponent(TouchMenu);
            fixture.autoDetectChanges();
            try {
                fixture.componentInstance.main().open.set(true);
                await fixture.whenStable();
                const item = fixture.nativeElement.querySelector(`[${selector}]`) as HTMLElement;
                expect(pointer(item, 'touch').defaultPrevented).toBe(true);
                item.focus();
                expect(document.activeElement).toBe(item);
            } finally {
                fixture.destroy();
            }
        }
    );

    it('toggles a touch submenu on mousedown and consumes its compatibility click', async () => {
        TestBed.resetTestingModule();
        const fixture = TestBed.createComponent(TouchMenu);
        fixture.autoDetectChanges();
        try {
            fixture.componentInstance.main().open.set(true);
            await fixture.whenStable();
            const root = fixture.componentInstance.child();
            const trigger = fixture.nativeElement.querySelector('[rdxMenuSubTrigger]') as HTMLElement;
            const changes: Event[] = [];
            root.onOpenChange.subscribe((change) => changes.push(change.event));
            for (const expected of [true, false, true]) {
                pointer(trigger, 'touch');
                const mouse = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, detail: 1 });
                trigger.dispatchEvent(mouse);
                expect(root.open()).toBe(expected);
                expect(changes.at(-1)).toBe(mouse);
                const count = changes.length;
                trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
                expect(changes).toHaveLength(count);
                expect(root.open()).toBe(expected);
                await fixture.whenStable();
            }
        } finally {
            fixture.destroy();
        }
    });

    it.each(['Enter', ' '])('closes a touch-opened child on %s without replacing the key event', async (key) => {
        TestBed.resetTestingModule();
        const fixture = TestBed.createComponent(TouchMenu);
        fixture.autoDetectChanges();
        try {
            fixture.componentInstance.main().open.set(true);
            await fixture.whenStable();
            const root = fixture.componentInstance.child();
            const trigger = fixture.nativeElement.querySelector('[rdxMenuSubTrigger]') as HTMLElement;
            pointer(trigger, 'touch');
            trigger.dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, detail: 1 })
            );
            trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
            await fixture.whenStable();
            let original: Event | undefined;
            root.onOpenChange.subscribe((change) => {
                original = change.event;
            });
            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
            trigger.dispatchEvent(event);
            expect(root.open()).toBe(false);
            expect(root.lastOpenChangeReason()).toBe('trigger-press');
            expect(original).toBe(event);
        } finally {
            fixture.destroy();
        }
    });

    it.each([false, true])('promotes an arrow-opened child before touch toggling (veto first: %s)', async (veto) => {
        TestBed.resetTestingModule();
        const fixture = TestBed.createComponent(TouchMenu);
        fixture.autoDetectChanges();
        try {
            fixture.componentInstance.main().open.set(true);
            await fixture.whenStable();
            const root = fixture.componentInstance.child();
            const trigger = fixture.nativeElement.querySelector('[rdxMenuSubTrigger]') as HTMLElement;
            trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
            await fixture.whenStable();
            expect(root.lastOpenChangeReason()).toBe('list-navigation');
            root.onOpenChange.subscribe((change) => {
                if (veto && change.open && change.reason === 'trigger-press') {
                    change.eventDetails.cancel();
                    veto = false;
                }
            });
            const press = () => {
                pointer(trigger, 'touch');
                trigger.dispatchEvent(
                    new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, detail: 1 })
                );
                trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
            };
            if (veto) {
                press();
                expect(root.open()).toBe(true);
                expect(root.lastOpenChangeReason()).toBe('list-navigation');
            }
            press();
            expect(root.open()).toBe(true);
            expect(root.lastOpenChangeReason()).toBe('trigger-press');
            press();
            expect(root.open()).toBe(false);
        } finally {
            fixture.destroy();
        }
    });

    it('opens a hover-capable submenu from a touch click', async () => {
        TestBed.resetTestingModule();
        const fixture = TestBed.createComponent(TouchMenu);
        fixture.autoDetectChanges();
        try {
            fixture.componentInstance.main().open.set(true);
            await fixture.whenStable();
            const trigger = fixture.nativeElement.querySelector('[rdxMenuSubTrigger]') as HTMLElement;
            pointer(trigger, 'touch');
            trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
            expect(fixture.componentInstance.child().open()).toBe(true);
            expect(fixture.componentInstance.child().openInteractionType()).toBe('touch');
        } finally {
            fixture.destroy();
        }
    });
});
