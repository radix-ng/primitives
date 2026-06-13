import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

@Component({
    imports: [_importsAutocomplete],
    template: `
        <div [(open)]="open" [highlightItemOnHover]="hover()" [keepHighlight]="keep()" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Fruit" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits(); track fruit) {
                            <div rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly open = signal(true);
    readonly hover = signal(true);
    readonly keep = signal(false);
    readonly fruits = signal(['Apple', 'Banana', 'Grape']);
}

describe('Autocomplete hover highlight', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxAutocompleteItem]'));
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function highlighted(): HTMLElement | undefined {
        return items().find((el) => el.hasAttribute('data-highlighted'));
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function pointerMove(el: HTMLElement): void {
        el.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }));
    }
    function pointerLeave(el: HTMLElement, relatedTarget: EventTarget | null): void {
        el.dispatchEvent(new MouseEvent('pointerleave', { bubbles: true, relatedTarget }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
    });

    describe('highlightItemOnHover', () => {
        it('highlights an item on pointer move by default', async () => {
            pointerMove(items()[1]);
            await settle();
            expect(highlighted()).toBe(items()[1]);
        });

        it('does not highlight on pointer move when disabled', async () => {
            host.hover.set(false);
            await settle();
            pointerMove(items()[1]);
            await settle();
            expect(highlighted()).toBeUndefined();
        });

        it('still allows the item to be selected by click when hover highlight is off', async () => {
            host.hover.set(false);
            await settle();
            items()[1].click();
            await settle();
            expect(inputEl().value).toBe('Banana');
        });
    });

    describe('keepHighlight', () => {
        it('clears the highlight when the pointer leaves the list (default)', async () => {
            pointerMove(items()[0]);
            await settle();
            expect(highlighted()).toBe(items()[0]);

            pointerLeave(items()[0], inputEl());
            await settle();
            expect(highlighted()).toBeUndefined();
        });

        it('keeps the highlight when moving to another item inside the list', async () => {
            pointerMove(items()[0]);
            await settle();
            pointerLeave(items()[0], items()[1]);
            await settle();
            // The intra-list move must not clear; the destination item re-highlights on its own move.
            expect(highlighted()).toBe(items()[0]);
        });

        it('retains the highlight on pointer leave when keepHighlight is set', async () => {
            host.keep.set(true);
            await settle();
            pointerMove(items()[0]);
            await settle();
            pointerLeave(items()[0], inputEl());
            await settle();
            expect(highlighted()).toBe(items()[0]);
        });
    });
});
