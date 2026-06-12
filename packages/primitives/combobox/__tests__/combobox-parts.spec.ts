import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';
import { RdxComboboxRoot } from '../src/combobox-root';

@Component({
    imports: [_importsCombobox],
    template: `
        <div [(value)]="value" [(open)]="open" (onItemHighlighted)="highlighted.set($event)" rdxComboboxRoot>
            <span rdxComboboxLabel>Fruit</span>
            <button rdxComboboxTrigger>
                <span #v="rdxComboboxValue" rdxComboboxValue placeholder="Pick one">{{ v.slotText() }}</span>
            </button>
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
class PartsHost {
    readonly value = signal<string | null>(null);
    readonly open = signal(false);
    readonly highlighted = signal<unknown>('__init__');
    readonly fruits = ['Apple', 'Banana', 'Grape'];
}

describe('Combobox Value / Label / onItemHighlighted', () => {
    let fixture: ComponentFixture<PartsHost>;
    let host: PartsHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function valueEl(): HTMLElement {
        return fixture.nativeElement.querySelector('[rdxComboboxValue]');
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function labelEl(): HTMLElement {
        return fixture.nativeElement.querySelector('[rdxComboboxLabel]');
    }
    function key(k: string): void {
        inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [PartsHost] });
        fixture = TestBed.createComponent(PartsHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('Value shows the placeholder when empty and the label when selected', async () => {
        expect(valueEl().textContent?.trim()).toBe('Pick one');
        expect(valueEl().hasAttribute('data-placeholder')).toBe(true);

        host.value.set('Banana');
        await settle();
        expect(valueEl().textContent?.trim()).toBe('Banana');
        expect(valueEl().hasAttribute('data-placeholder')).toBe(false);
    });

    it('Label is referenced by the input and trigger via aria-labelledby', () => {
        const labelId = labelEl().getAttribute('id');
        expect(labelId).toBeTruthy();
        expect(inputEl().getAttribute('aria-labelledby')).toBe(labelId);
        const trigger = fixture.nativeElement.querySelector('[rdxComboboxTrigger]') as HTMLElement;
        expect(trigger.getAttribute('aria-labelledby')).toBe(labelId);
    });

    it('onItemHighlighted emits the highlighted value, index, and reason', async () => {
        host.open.set(true);
        await settle();
        key('ArrowDown'); // highlight first
        await settle();
        expect(host.highlighted()).toEqual({ value: 'Apple', index: 0, reason: 'keyboard' });
        key('ArrowDown'); // highlight second
        await settle();
        expect(host.highlighted()).toEqual({ value: 'Banana', index: 1, reason: 'keyboard' });
    });

    it('exposes the root onItemHighlighted output', () => {
        const root = fixture.debugElement.query(By.directive(RdxComboboxRoot)).injector.get(RdxComboboxRoot);
        expect(root.onItemHighlighted).toBeDefined();
    });
});
