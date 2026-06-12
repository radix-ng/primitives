import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';
import { RdxComboboxRoot } from '../src/combobox-root';

@Component({
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" [highlightItemOnHover]="hover()" [keepHighlight]="keep()" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxComboboxItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class Host {
    readonly open = signal(true);
    readonly hover = signal(true);
    readonly keep = signal(false);
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}

describe('Combobox hover highlight', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    function root(): RdxComboboxRoot {
        return fixture.debugElement.query(By.directive(RdxComboboxRoot)).injector.get(RdxComboboxRoot);
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxComboboxItem]'));
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
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
        TestBed.configureTestingModule({ imports: [Host] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    });

    it('highlights on hover by default', async () => {
        pointerMove(items()[1]);
        await settle();
        expect(root().highlightedItem()?.value()).toBe('Banana');
    });

    it('does not highlight on hover when highlightItemOnHover is false', async () => {
        host.hover.set(false);
        await settle();
        pointerMove(items()[1]);
        await settle();
        expect(root().highlightedItem()).toBeNull();
    });

    it('clears the highlight when the pointer leaves the list (default)', async () => {
        pointerMove(items()[0]);
        await settle();
        expect(root().highlightedItem()?.value()).toBe('Apple');

        pointerLeave(items()[0], inputEl());
        await settle();
        expect(root().highlightedItem()).toBeNull();
    });

    it('retains the highlight on pointer leave when keepHighlight is set', async () => {
        host.keep.set(true);
        await settle();
        pointerMove(items()[0]);
        await settle();
        pointerLeave(items()[0], inputEl());
        await settle();
        expect(root().highlightedItem()?.value()).toBe('Apple');
    });
});
