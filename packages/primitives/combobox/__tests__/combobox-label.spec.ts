import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { _importsAutocomplete } from '@radix-ng/primitives/autocomplete';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

@Component({
    imports: [_importsCombobox, _importsAutocomplete],
    template: `
        <div [(open)]="comboOpen" rdxComboboxRoot>
            @if (first()) {
                <div data-testid="first" rdxComboboxLabel>First label</div>
            }
            @if (second()) {
                <div data-testid="second" rdxComboboxLabel>Replacement label</div>
            }
            <input rdxComboboxInput />
        </div>
        <div [(open)]="autoOpen" rdxAutocompleteRoot>
            <div rdxAutocompleteLabel>Autocomplete label</div>
            <input rdxAutocompleteInput />
        </div>
        <div [(open)]="insideOpen" rdxComboboxRoot>
            <div data-testid="trigger-label" rdxComboboxLabel>Trigger label</div>
            <button rdxComboboxTrigger>Choose</button>
        </div>
    `
})
class Host {
    readonly first = signal(true);
    readonly second = signal(false);
    readonly comboOpen = signal(false);
    readonly autoOpen = signal(false);
    readonly insideOpen = signal(false);
}

describe('shared labels in Combobox and Autocomplete', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [Host] }));

    it('preserves a replacement registration and restores a previous live label', async () => {
        const fixture = TestBed.createComponent(Host);
        const settle = async () => {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        };
        await settle();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('[rdxComboboxInput]');
        const first: HTMLElement = fixture.nativeElement.querySelector('[data-testid="first"]');
        fixture.componentInstance.second.set(true);
        await settle();
        const second: HTMLElement = fixture.nativeElement.querySelector('[data-testid="second"]');
        expect(input.getAttribute('aria-labelledby')).toBe(second.id);
        fixture.componentInstance.second.set(false);
        await settle();
        expect(input.getAttribute('aria-labelledby')).toBe(first.id);
        fixture.componentInstance.second.set(true);
        await settle();
        const replacement: HTMLElement = fixture.nativeElement.querySelector('[data-testid="second"]');
        fixture.componentInstance.first.set(false);
        await settle();
        expect(input.getAttribute('aria-labelledby')).toBe(replacement.id);
    });

    it('focuses each existing control without opening a popup', async () => {
        const fixture = TestBed.createComponent(Host);
        fixture.detectChanges();
        await fixture.whenStable();
        for (const [labelSelector, controlSelector] of [
            ['[data-testid="first"]', '[rdxComboboxInput]'],
            ['[rdxAutocompleteLabel]', '[rdxAutocompleteInput]'],
            ['[data-testid="trigger-label"]', '[rdxComboboxTrigger]']
        ]) {
            const label: HTMLElement = fixture.nativeElement.querySelector(labelSelector);
            const control: HTMLElement = fixture.nativeElement.querySelector(controlSelector);
            label.click();
            expect(document.activeElement).toBe(control);
        }
        expect(fixture.componentInstance.comboOpen()).toBe(false);
        expect(fixture.componentInstance.autoOpen()).toBe(false);
        expect(fixture.componentInstance.insideOpen()).toBe(false);
    });
});
