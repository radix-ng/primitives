import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

@Component({
    imports: [_importsAutocomplete, ReactiveFormsModule],
    template: `
        <div [(open)]="open" [formControl]="control" rdxAutocompleteRoot>
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
class ReactiveHost {
    readonly control = new FormControl('');
    readonly open = signal(false);
    readonly fruits = signal(['Apple', 'Banana', 'Grape']);
}

@Component({
    imports: [_importsAutocomplete, FormsModule],
    template: `
        <div [(ngModel)]="value" [(open)]="open" rdxAutocompleteRoot>
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
class TemplateHost {
    value = '';
    readonly open = signal(false);
    readonly fruits = signal(['Apple', 'Banana', 'Grape']);
}

function inputOf(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
}
function visibleItems(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[rdxAutocompleteItem]')).filter(
        (el) => !el.hasAttribute('hidden')
    ) as HTMLElement[];
}
function type(el: HTMLInputElement, text: string): void {
    el.value = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('Autocomplete forms', () => {
    describe('reactive forms (value = input string)', () => {
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

        it('writes the typed text into the control', async () => {
            type(inputOf(fixture), 'app');
            await settle();
            expect(host.control.value).toBe('app');
        });

        it('writes the selected item label into the control', async () => {
            host.open.set(true);
            await settle();
            visibleItems()[2].click();
            await settle();
            expect(host.control.value).toBe('Grape');
        });

        it('reflects a programmatic setValue in the input', async () => {
            host.control.setValue('Banana');
            await settle();
            expect(inputOf(fixture).value).toBe('Banana');
        });

        it('propagates disabled state', async () => {
            host.control.disable();
            await settle();
            expect(inputOf(fixture).hasAttribute('disabled')).toBe(true);
        });
    });

    describe('template-driven forms', () => {
        let fixture: ComponentFixture<TemplateHost>;
        let host: TemplateHost;

        async function settle(): Promise<void> {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        }

        beforeEach(async () => {
            TestBed.configureTestingModule({ imports: [TemplateHost] });
            fixture = TestBed.createComponent(TemplateHost);
            host = fixture.componentInstance;
            await settle();
        });

        it('binds the typed text to ngModel', async () => {
            type(inputOf(fixture), 'gra');
            await settle();
            expect(host.value).toBe('gra');
        });
    });
});
