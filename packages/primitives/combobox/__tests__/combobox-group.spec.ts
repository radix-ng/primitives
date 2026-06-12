import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

@Component({
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Produce" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Produce">
                        <div data-group="fruits" rdxComboboxGroup>
                            <div rdxComboboxGroupLabel>Fruits</div>
                            <div [value]="'apple'" rdxComboboxItem>Apple</div>
                            <div [value]="'grape'" rdxComboboxItem>Grape</div>
                        </div>
                        <div data-group="veg" rdxComboboxGroup>
                            <div rdxComboboxGroupLabel>Vegetables</div>
                            <div [value]="'carrot'" rdxComboboxItem>Carrot</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
class GroupHost {
    readonly open = signal(true);
}

describe('Combobox groups', () => {
    let fixture: ComponentFixture<GroupHost>;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function group(name: string): HTMLElement {
        return document.querySelector(`[data-group="${name}"]`) as HTMLElement;
    }
    function type(text: string): void {
        const el = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [GroupHost] });
        fixture = TestBed.createComponent(GroupHost);
        await settle();
    });

    it('shows both groups when nothing is typed', () => {
        expect(group('fruits').hasAttribute('hidden')).toBe(false);
        expect(group('veg').hasAttribute('hidden')).toBe(false);
    });

    it('hides a group when all of its items are filtered out', async () => {
        type('ap'); // matches Apple/Grape (fruits), not Carrot
        await settle();
        expect(group('fruits').hasAttribute('hidden')).toBe(false);
        expect(group('veg').hasAttribute('hidden')).toBe(true);
    });

    it('hides the other group symmetrically', async () => {
        type('carr');
        await settle();
        expect(group('fruits').hasAttribute('hidden')).toBe(true);
        expect(group('veg').hasAttribute('hidden')).toBe(false);
    });
});
