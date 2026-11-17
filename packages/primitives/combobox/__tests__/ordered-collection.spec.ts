import { Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { _importsAutocomplete, RdxAutocompleteItem, RdxAutocompleteRoot } from '@radix-ng/primitives/autocomplete';
import { _importsCombobox, RdxComboboxItem, RdxComboboxRoot } from '../index';

@Component({
    selector: 'test-combobox-option',
    imports: [RdxComboboxItem],
    template: `
        <div [value]="value()" [textValue]="label()" [disabled]="disabled()" rdxComboboxItem>{{ label() }}</div>
    `
})
class ComboboxOption {
    readonly value = input.required<string>();
    readonly label = input.required<string>();
    readonly disabled = input(false);
}

@Component({
    selector: 'test-autocomplete-option',
    imports: [RdxAutocompleteItem],
    template: `
        <div [value]="value()" [textValue]="label()" [disabled]="disabled()" rdxAutocompleteItem>{{ label() }}</div>
    `
})
class AutocompleteOption {
    readonly value = input.required<string>();
    readonly label = input.required<string>();
    readonly disabled = input(false);
}

@Component({
    imports: [_importsCombobox, _importsAutocomplete, ComboboxOption, AutocompleteOption],
    template: `
        <div [open]="true" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList>
                        @for (item of items(); track item.value) {
                            <test-combobox-option
                                [value]="item.value"
                                [label]="item.label"
                                [disabled]="item.disabled"
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
        <div [open]="true" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Suggestion" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList>
                        @for (item of items(); track item.value) {
                            <test-autocomplete-option
                                [value]="item.value"
                                [label]="item.label"
                                [disabled]="item.disabled"
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class Host {
    readonly items = signal([
        { value: 'a', label: 'Apple', disabled: false },
        { value: 'b', label: 'Banana', disabled: false },
        { value: 'c', label: 'Grape', disabled: false }
    ]);
}

describe.each(['Combobox', 'Autocomplete'] as const)('%s ordered collection across component boundaries', (kind) => {
    it('retains registrations across tracked wrapper moves and reads new disabled/text metadata', async () => {
        const fixture = TestBed.createComponent(Host);
        const settle = async () => {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        };
        await settle();
        const root =
            kind === 'Combobox'
                ? fixture.debugElement.query(By.directive(RdxComboboxRoot)).injector.get(RdxComboboxRoot)
                : fixture.debugElement.query(By.directive(RdxAutocompleteRoot)).injector.get(RdxAutocompleteRoot);
        const input = fixture.nativeElement.querySelector(`[rdx${kind}Input]`) as HTMLInputElement;
        const options = () => [...document.querySelectorAll<HTMLElement>(`[rdx${kind}Item]`)];
        const key = async () => {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await settle();
        };
        const original = options();
        await key();
        const first = root.highlightedItem();
        expect(first?.value()).toBe('a');

        fixture.componentInstance.items.update((items) => [...items].reverse());
        await settle();
        expect(options()).toEqual([...original].reverse());
        expect(root.highlightedItem()).toBe(first);
        await key();
        if (kind === 'Autocomplete') {
            expect(root.highlightedItem()).toBeNull();
            expect(input.hasAttribute('aria-activedescendant')).toBe(false);
            await key();
        }
        expect(root.highlightedItem()?.value()).toBe('c');
        expect(input.getAttribute('aria-activedescendant')).toBe(original[2].id);

        fixture.componentInstance.items.update((items) =>
            items.map((item) => (item.value === 'c' ? { ...item, label: 'Cherry', disabled: true } : item))
        );
        await settle();
        expect(options()[0]).toBe(original[2]);
        expect(options()[0].hasAttribute('data-disabled')).toBe(true);
        await key();
        expect(root.highlightedItem()?.value()).toBe('b');

        input.value = 'Cherry';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await settle();
        expect(options().filter((element) => !element.hidden)).toEqual([original[2]]);
        fixture.destroy();
    });
});
