import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';
import { RdxComboboxRoot } from '../src/combobox-root';

@Component({
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" [limit]="limit()" rdxComboboxRoot>
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
    readonly open = signal(false);
    readonly limit = signal(-1);
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}

describe('Combobox limit', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    function root(): RdxComboboxRoot {
        return fixture.debugElement.query(By.directive(RdxComboboxRoot)).injector.get(RdxComboboxRoot);
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxComboboxItem]'));
    }
    function visible(): HTMLElement[] {
        return items().filter((el) => !el.hasAttribute('hidden'));
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function key(k: string): void {
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [Host] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        host.open.set(true);
        await settle();
    });

    it('caps the number of visible items', async () => {
        expect(visible().length).toBe(3);
        host.limit.set(2);
        await settle();
        expect(visible().length).toBe(2);
        expect(root().visibleCount()).toBe(2);
    });

    it('only navigates within the limited items', async () => {
        host.limit.set(2);
        await settle();
        key('ArrowDown'); // first
        await settle();
        key('ArrowUp'); // wraps within the 2 visible → last visible (Banana), not Grape
        await settle();
        expect(root().highlightedItem()?.value()).toBe('Banana');
    });

    describe('keyboardActive (hover does not fight arrow keys)', () => {
        it('ignores the first pointer move after keyboard navigation', async () => {
            key('ArrowDown'); // highlight Apple via keyboard
            await settle();
            expect(root().highlightedItem()?.value()).toBe('Apple');

            // scroll-induced / first move after keyboard nav is swallowed
            items()[2].dispatchEvent(new Event('pointermove', { bubbles: true }));
            await settle();
            expect(root().highlightedItem()?.value()).toBe('Apple');

            // a genuine subsequent move highlights under the cursor
            items()[2].dispatchEvent(new Event('pointermove', { bubbles: true }));
            await settle();
            expect(root().highlightedItem()?.value()).toBe('Grape');
        });
    });
});
