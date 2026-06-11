import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

interface Fruit {
    label: string;
    value: string;
}

const FRUITS: Fruit[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' }
];

@Component({
    imports: [_importsCombobox, ReactiveFormsModule],
    template: `
        <div [(open)]="open" [formControl]="control" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div rdxComboboxPositioner>
                        <div rdxComboboxPopup>
                            <div rdxComboboxList aria-label="Fruits">
                                @for (fruit of fruits; track fruit.value) {
                                    <div [value]="fruit.value" rdxComboboxItem>{{ fruit.label }}</div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
class ReactiveHost {
    readonly control = new FormControl<string | null>(null);
    readonly open = signal(false);
    readonly fruits = FRUITS;
}

@Component({
    imports: [_importsCombobox, RdxFieldRoot, RdxLabelDirective],
    template: `
        <div [invalid]="invalid()" [required]="required()" rdxFieldRoot>
            <label rdxLabel>Fruit</label>
            <div rdxComboboxRoot>
                <input rdxComboboxInput />
            </div>
        </div>
    `
})
class FieldHost {
    readonly invalid = signal(false);
    readonly required = signal(false);
}

describe('Combobox forms integration', () => {
    describe('reactive forms', () => {
        let fixture: ComponentFixture<ReactiveHost>;
        let host: ReactiveHost;

        async function settle(): Promise<void> {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        }

        beforeEach(async () => {
            TestBed.configureTestingModule({ imports: [ReactiveHost] });
            fixture = TestBed.createComponent(ReactiveHost);
            host = fixture.componentInstance;
            await settle();
        });

        it('updates the control when an item is selected', async () => {
            host.open.set(true);
            await settle();
            const items = Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[];
            items[0].dispatchEvent(new Event('pointerup', { bubbles: true }));
            await settle();
            expect(host.control.value).toBe('apple');
        });

        it('reflects a programmatic control value into the selection', async () => {
            host.control.setValue('banana');
            await settle();
            const root = fixture.nativeElement.querySelector('[rdxComboboxRoot]');
            expect(root).toBeTruthy();
            // open and confirm banana is marked selected
            host.open.set(true);
            await settle();
            const banana = (Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[]).find((el) =>
                el.textContent?.includes('Banana')
            )!;
            expect(banana.getAttribute('aria-selected')).toBe('true');
        });

        it('disables the input via setDisabledState', async () => {
            host.control.disable();
            await settle();
            const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
            expect(input.hasAttribute('disabled')).toBe(true);
        });
    });

    describe('field integration', () => {
        let fixture: ComponentFixture<FieldHost>;
        let host: FieldHost;

        async function settle(): Promise<void> {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        }

        beforeEach(async () => {
            TestBed.configureTestingModule({ imports: [FieldHost] });
            fixture = TestBed.createComponent(FieldHost);
            host = fixture.componentInstance;
            await settle();
        });

        it('propagates field invalid state to the input', async () => {
            host.invalid.set(true);
            await settle();
            const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
            expect(input.getAttribute('data-invalid')).toBe('');
            expect(input.getAttribute('aria-invalid')).toBe('true');
        });

        it('propagates field required state to the input', async () => {
            host.required.set(true);
            await settle();
            const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
            expect(input.getAttribute('data-required')).toBe('');
            expect(input.getAttribute('aria-required')).toBe('true');
        });
    });
});
