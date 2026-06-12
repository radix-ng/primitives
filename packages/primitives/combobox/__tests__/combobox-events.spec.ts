import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { _importsCombobox } from '../index';

@Component({
    imports: [_importsCombobox],
    template: `
        <form>
            <div [(open)]="open" submitOnItemClick rdxComboboxRoot>
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
        </form>
    `
})
class SubmitHost {
    readonly open = signal(false);
    readonly fruits = ['Apple', 'Banana'];
}

@Component({
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" (onOpenChangeComplete)="completed.set($event)" rdxComboboxRoot>
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
class CompleteHost {
    readonly open = signal(false);
    readonly completed = signal<boolean | '__init__'>('__init__');
    readonly fruits = ['Apple', 'Banana'];
}

async function frame(): Promise<void> {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(r));
}

describe('Combobox submitOnItemClick', () => {
    let fixture: ComponentFixture<SubmitHost>;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SubmitHost] });
        fixture = TestBed.createComponent(SubmitHost);
        await settle();
    });

    it('requests submit of the closest form when an item is selected', async () => {
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        const submitSpy = vi.spyOn(input.form as HTMLFormElement, 'requestSubmit').mockImplementation(() => {});

        fixture.componentInstance.open.set(true);
        await settle();
        const items = Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[];
        items[0].dispatchEvent(new Event('pointerup', { bubbles: true }));
        await settle();

        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
});

describe('Combobox onOpenChangeComplete', () => {
    let fixture: ComponentFixture<CompleteHost>;
    let host: CompleteHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [CompleteHost] });
        fixture = TestBed.createComponent(CompleteHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('fires true after opening and false after closing', async () => {
        expect(host.completed()).toBe('__init__');

        host.open.set(true);
        await settle();
        await frame();
        await settle();
        expect(host.completed()).toBe(true);

        host.open.set(false);
        await settle();
        await frame();
        await settle();
        expect(host.completed()).toBe(false);
    });
});
