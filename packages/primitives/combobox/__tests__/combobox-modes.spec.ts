import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';
import { RdxComboboxRoot } from '../src/combobox-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div
            [(value)]="value"
            [(open)]="open"
            [selectionMode]="selectionMode()"
            [fillInputOnItemPress]="fillInput()"
            [autoHighlight]="autoHighlight()"
            rdxComboboxRoot
        >
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
class ModesHost {
    readonly value = signal<any>(null);
    readonly open = signal(false);
    readonly selectionMode = signal<'single' | 'multiple' | 'none'>('single');
    readonly fillInput = signal(true);
    readonly autoHighlight = signal<boolean | 'always' | 'input-change'>(false);
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}

describe('Combobox selectionMode / autoHighlight', () => {
    let fixture: ComponentFixture<ModesHost>;
    let host: ModesHost;

    function root(): RdxComboboxRoot {
        return fixture.debugElement.query(By.directive(RdxComboboxRoot)).injector.get(RdxComboboxRoot);
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxComboboxItem]'));
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function type(text: string): void {
        inputEl().value = text;
        inputEl().dispatchEvent(new Event('input', { bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [ModesHost] });
        fixture = TestBed.createComponent(ModesHost);
        host = fixture.componentInstance;
    });

    describe("selectionMode 'none'", () => {
        beforeEach(async () => {
            host.selectionMode.set('none');
            await settle();
        });

        it('does not commit a value, fills the input, closes, and emits an activation', async () => {
            const activations: unknown[] = [];
            root().onValueChange.subscribe((v) => activations.push(v.value));
            host.open.set(true);
            await settle();
            items()[1].click();
            await settle();
            expect(host.value()).toBeNull();
            expect(inputEl().value).toBe('Banana');
            expect(host.open()).toBe(false);
            expect(activations).toEqual(['Banana']);
        });

        it('does not fill the input when fillInputOnItemPress is false', async () => {
            host.fillInput.set(false);
            host.open.set(true);
            await settle();
            items()[1].click();
            await settle();
            expect(inputEl().value).toBe('');
        });

        it('never marks items selected', async () => {
            host.open.set(true);
            await settle();
            items()[0].click();
            host.open.set(true);
            await settle();
            expect(items().some((el) => el.hasAttribute('data-selected'))).toBe(false);
        });
    });

    describe("autoHighlight 'always'", () => {
        it('highlights the first item on open without typing', async () => {
            host.autoHighlight.set('always');
            await settle();
            host.open.set(true);
            await settle();
            expect(root().highlightedItem()?.value()).toBe('Apple');
        });

        it('re-highlights the first item after filtering removes the highlighted one', async () => {
            host.autoHighlight.set('always');
            host.open.set(true);
            await settle();
            expect(root().highlightedItem()?.value()).toBe('Apple');
            type('grape'); // Apple/Banana filtered out
            await settle();
            expect(root().highlightedItem()?.value()).toBe('Grape');
        });
    });

    describe("autoHighlight 'input-change'", () => {
        it('does not highlight on open, only while typing', async () => {
            host.autoHighlight.set('input-change');
            await settle();
            host.open.set(true);
            await settle();
            expect(root().highlightedItem()).toBeNull();
            type('gr');
            await settle();
            expect(root().highlightedItem()?.value()).toBe('Grape');
        });
    });
});
