import { _importsSelect } from '../index';
import { RdxSelectItemAlignedPosition } from '../src/select-item-aligned-position';
import { RdxSelectItemAlignedPositionContent } from '../src/select-item-aligned-position-content';
import { RdxSelectOpenChangeEvent, RdxSelectRoot, RdxSelectValueChangeEvent } from '../src/select-root';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsSelect],
    template: `
        <div
            rdxSelectRoot
            [(open)]="open"
            [(value)]="value"
            (onOpenChange)="handleOpenChange($event)"
            (onValueChange)="handleValueChange($event)"
        >
            <button rdxSelectTrigger>
                <span rdxSelectValue placeholder="Select…"></span>
            </button>

            <div *rdxSelectPortal rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        @for (fruit of fruits; track fruit) {
                            <div rdxSelectItem [value]="fruit">
                                <span rdxSelectItemText>{{ fruit }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class OpenChangeHost {
    readonly open = signal(false);
    readonly value = signal<string | undefined>(undefined);
    readonly cancelNextOpen = signal(false);
    readonly cancelNextValue = signal(false);
    readonly fruits = ['Apple', 'Banana'];
    readonly events: RdxSelectOpenChangeEvent[] = [];
    readonly valueEvents: RdxSelectValueChangeEvent[] = [];

    handleOpenChange(event: RdxSelectOpenChangeEvent): void {
        if (this.cancelNextOpen() && event.open) {
            event.eventDetails.cancel();
        }

        this.events.push(event);
    }

    handleValueChange(event: RdxSelectValueChangeEvent): void {
        if (this.cancelNextValue()) {
            event.eventDetails.cancel();
        }

        this.valueEvents.push(event);
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsSelect, RdxSelectItemAlignedPosition, RdxSelectItemAlignedPositionContent],
    template: `
        <div rdxSelectRoot [(open)]="open" (onOpenChange)="events.push($event)">
            <button rdxSelectTrigger>
                <span rdxSelectValue placeholder="Select…"></span>
            </button>

            <div *rdxSelectPortal rdxSelectItemAlignedPosition>
                <div rdxSelectPopup>
                    <div rdxSelectItemAlignedPositionContent>
                        <div rdxSelectList>
                            @for (fruit of fruits; track fruit) {
                                <div rdxSelectItem [value]="fruit">
                                    <span rdxSelectItemText>{{ fruit }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
class ItemAlignedOpenChangeHost {
    readonly open = signal(false);
    readonly fruits = ['Apple', 'Banana'];
    readonly events: RdxSelectOpenChangeEvent[] = [];
}

describe('Select onOpenChange', () => {
    let fixture: ComponentFixture<OpenChangeHost>;
    let host: OpenChangeHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    function trigger(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('[rdxSelectTrigger]');
    }

    function root(): RdxSelectRoot {
        return fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
    }

    function popup(): HTMLElement | null {
        return document.querySelector('[rdxSelectPopup]');
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [OpenChangeHost] });
        fixture = TestBed.createComponent(OpenChangeHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('allows canceling an opening request and reports trigger-press', async () => {
        host.cancelNextOpen.set(true);
        trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await settle();

        expect(host.open()).toBe(false);
        expect(popup()).toBe(null);
        expect(host.events).toHaveLength(1);
        expect(host.events[0].open).toBe(true);
        expect(host.events[0].eventDetails.reason).toBe('trigger-press');
        expect(host.events[0].eventDetails.trigger).toBe(trigger());
        expect(host.events[0].eventDetails.isPropagationAllowed).toBe(false);
        host.events[0].eventDetails.allowPropagation();
        expect(host.events[0].eventDetails.isPropagationAllowed).toBe(true);
        expect(host.events[0].eventDetails.isCanceled()).toBe(true);
    });

    it('reports list-navigation when ArrowDown opens the popup', async () => {
        trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await settle();

        expect(host.open()).toBe(true);
        expect(host.events.at(-1)?.open).toBe(true);
        expect(host.events.at(-1)?.eventDetails.reason).toBe('list-navigation');
        expect(root().openMethod()).toBe('keyboard');
        expect(root().openInteractionType()).toBe('keyboard');
    });

    it('reports item-press when selecting an item closes the popup', async () => {
        host.open.set(true);
        await settle();

        popup()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await settle();

        expect(host.open()).toBe(false);
        expect(host.events.at(-1)?.open).toBe(false);
        expect(host.events.at(-1)?.eventDetails.reason).toBe('item-press');
        expect(host.value()).toBe('Apple');
        expect(host.valueEvents.at(-1)?.value).toBe('Apple');
        expect(host.valueEvents.at(-1)?.eventDetails.reason).toBe('item-press');
    });

    it('allows canceling a value change while still closing after item-press', async () => {
        host.cancelNextValue.set(true);
        host.open.set(true);
        await settle();

        popup()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await settle();

        expect(host.value()).toBeUndefined();
        expect(host.open()).toBe(false);
        expect(host.valueEvents.at(-1)?.eventDetails.isCanceled()).toBe(true);
        expect(host.valueEvents.at(-1)?.eventDetails.reason).toBe('item-press');
        expect(host.events.at(-1)?.eventDetails.reason).toBe('item-press');
    });

    it('reports escape-key when Escape dismisses the popup', async () => {
        host.open.set(true);
        await settle();

        popup()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await settle();

        expect(host.open()).toBe(false);
        expect(host.events.at(-1)?.eventDetails.reason).toBe('escape-key');
        expect(root().closeInteractionType()).toBe('keyboard');
    });

    it('tracks touch opens in public interaction state', () => {
        const touchEvent =
            typeof PointerEvent !== 'undefined'
                ? new PointerEvent('pointerup', { pointerType: 'touch' })
                : Object.assign(new MouseEvent('pointerup'), { pointerType: 'touch' });
        root().setOpen(true, 'trigger-press', touchEvent);

        expect(root().openMethod()).toBe('touch');
        expect(root().openInteractionType()).toBe('touch');
        expect(root().openedByTouch()).toBe(true);
    });
});

describe('Select onOpenChange with item-aligned positioning', () => {
    let fixture: ComponentFixture<ItemAlignedOpenChangeHost>;
    let host: ItemAlignedOpenChangeHost;
    let originalResizeObserver: typeof globalThis.ResizeObserver;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        originalResizeObserver = globalThis.ResizeObserver;

        class MockResizeObserver {
            observe(): void {}
            disconnect(): void {}
            unobserve(): void {}
        }

        Object.defineProperty(globalThis, 'ResizeObserver', {
            configurable: true,
            value: MockResizeObserver
        });

        TestBed.configureTestingModule({ imports: [ItemAlignedOpenChangeHost] });
        fixture = TestBed.createComponent(ItemAlignedOpenChangeHost);
        host = fixture.componentInstance;
        await settle();
    });

    afterEach(() => {
        Object.defineProperty(globalThis, 'ResizeObserver', {
            configurable: true,
            value: originalResizeObserver
        });
    });

    it('reports window-resize when an item-aligned popup closes on resize', async () => {
        host.open.set(true);
        await settle();

        window.dispatchEvent(new UIEvent('resize'));
        await settle();

        expect(host.open()).toBe(false);
        expect(host.events.at(-1)?.eventDetails.reason).toBe('window-resize');
    });
});
