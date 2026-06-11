import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';
import { ComboboxFilter, RdxComboboxRoot } from '../src/combobox-root';

interface Fruit {
    label: string;
    value: string;
}

@Component({
    imports: [_importsCombobox],
    template: `
        <div
            [(value)]="value"
            [(open)]="open"
            [multiple]="multiple()"
            [filter]="filter()"
            [autoHighlight]="autoHighlight()"
            rdxComboboxRoot
        >
            <label [attr.for]="'cb'">Fruit</label>
            <input id="cb" rdxComboboxInput />
            <button rdxComboboxTrigger>open</button>
            <button rdxComboboxClear>clear</button>

            <div rdxComboboxPortal>
                <ng-template rdxComboboxPortalPresence>
                    <div rdxComboboxPositioner>
                        <div rdxComboboxPopup>
                            <div rdxComboboxList aria-label="Fruits">
                                @for (fruit of fruits(); track fruit.value) {
                                    <div [value]="fruit.value" rdxComboboxItem>
                                        {{ fruit.label }}
                                        <span rdxComboboxItemIndicator>✓</span>
                                    </div>
                                }
                            </div>
                            <div rdxComboboxEmpty>No results</div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal<any>(null);
    readonly open = signal(false);
    readonly multiple = signal(false);
    readonly autoHighlight = signal(false);
    readonly filter = signal<ComboboxFilter | null | undefined>(undefined);
    readonly fruits = signal<Fruit[]>([
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Grape', value: 'grape' }
    ]);
}

describe('Combobox', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function root(): RdxComboboxRoot {
        return fixture.debugElement.query(By.directive(RdxComboboxRoot)).injector.get(RdxComboboxRoot);
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxComboboxItem]'));
    }
    function visibleItems(): HTMLElement[] {
        return items().filter((el) => !el.hasAttribute('hidden'));
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function type(text: string): void {
        const el = inputEl();
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function key(k: string): void {
        inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
    });

    describe('open / close', () => {
        it('opens on typing', async () => {
            type('a');
            await settle();
            expect(host.open()).toBe(true);
        });

        it('opens on input click', async () => {
            inputEl().dispatchEvent(new Event('click', { bubbles: true }));
            await settle();
            expect(host.open()).toBe(true);
        });

        it('toggles via the trigger', async () => {
            fixture.nativeElement.querySelector('[rdxComboboxTrigger]').click();
            await settle();
            expect(host.open()).toBe(true);
            fixture.nativeElement.querySelector('[rdxComboboxTrigger]').click();
            await settle();
            expect(host.open()).toBe(false);
        });

        it('closes on Escape', async () => {
            host.open.set(true);
            await settle();
            key('Escape');
            await settle();
            expect(host.open()).toBe(false);
        });

        it('keeps focus in the input without self-dismissing', async () => {
            host.open.set(true);
            await settle();
            inputEl().focus();
            // let the dismissable-layer async focus-outside check run
            await new Promise((r) => setTimeout(r));
            await settle();
            expect(host.open()).toBe(true);
        });
    });

    describe('filtering', () => {
        it('filters by default substring (case-insensitive)', async () => {
            host.open.set(true);
            await settle();
            type('ap');
            await settle();
            const labels = visibleItems().map((el) => el.textContent?.trim().replace('✓', '').trim());
            expect(labels).toEqual(['Apple', 'Grape']);
        });

        it('supports a custom filter', async () => {
            host.filter.set((text, query) => text.toLowerCase().startsWith(query.toLowerCase()));
            host.open.set(true);
            await settle();
            type('ap');
            await settle();
            expect(visibleItems().map((el) => el.textContent?.includes('Apple'))).toContain(true);
            expect(visibleItems().length).toBe(1);
        });

        it('disables built-in filtering when filter is null', async () => {
            host.filter.set(null);
            host.open.set(true);
            await settle();
            type('zzz');
            await settle();
            expect(visibleItems().length).toBe(3);
        });

        it('marks the input data-list-empty and shows Empty when nothing matches', async () => {
            host.open.set(true);
            await settle();
            type('zzz');
            await settle();
            expect(inputEl().hasAttribute('data-list-empty')).toBe(true);
            const empty = document.querySelector('[rdxComboboxEmpty]') as HTMLElement;
            expect(empty.hasAttribute('hidden')).toBe(false);
        });

        it('self-heals the highlight when the highlighted item is filtered away', async () => {
            host.open.set(true);
            await settle();
            key('ArrowDown'); // highlight Apple
            await settle();
            expect(root().highlightedItem()?.value()).toBe('apple');
            type('grape'); // Apple filtered out
            await settle();
            expect(root().highlightedItem()?.value()).not.toBe('apple');
            expect(inputEl().getAttribute('aria-activedescendant') ?? '').not.toContain('apple');
        });
    });

    describe('keyboard / aria', () => {
        it('exposes the combobox ARIA contract', () => {
            expect(inputEl().getAttribute('role')).toBe('combobox');
            expect(inputEl().getAttribute('aria-autocomplete')).toBe('list');
            expect(inputEl().getAttribute('aria-expanded')).toBe('false');
        });

        it('ArrowDown opens and highlights the first item', async () => {
            key('ArrowDown');
            await settle();
            expect(host.open()).toBe(true);
            expect(root().highlightedItem()?.value()).toBe('apple');
            const activeId = inputEl().getAttribute('aria-activedescendant');
            expect(activeId).toBe(root().highlightedItem()?.id);
        });

        it('navigates and wraps with loop', async () => {
            host.open.set(true);
            await settle();
            key('ArrowUp'); // wraps to last
            await settle();
            expect(root().highlightedItem()?.value()).toBe('grape');
            key('ArrowDown'); // wraps to first
            await settle();
            expect(root().highlightedItem()?.value()).toBe('apple');
        });

        it('autoHighlight highlights the first match while typing', async () => {
            host.autoHighlight.set(true);
            host.open.set(true);
            await settle();
            type('gr');
            await settle();
            expect(root().highlightedItem()?.value()).toBe('grape');
        });

        it('has no axe violations when open', async () => {
            host.open.set(true);
            await settle();
            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });

    describe('keyboard refinements (Base UI parity)', () => {
        function keyWith(k: string, init: KeyboardEventInit): void {
            inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...init }));
        }

        it('ignores navigation keys held with a modifier (text editing stays intact)', async () => {
            keyWith('ArrowDown', { shiftKey: true });
            await settle();
            expect(host.open()).toBe(false);
        });

        it('Enter with no highlighted item just closes the popup', async () => {
            host.open.set(true);
            await settle();
            expect(root().highlightedItem()).toBeNull();
            key('Enter');
            await settle();
            expect(host.open()).toBe(false);
            expect(host.value()).toBeNull();
        });

        it('a second Escape (popup closed) clears the selection and input', async () => {
            key('ArrowDown');
            await settle();
            key('Enter');
            await settle();
            expect(host.value()).toBe('apple');
            expect(host.open()).toBe(false);
            key('Escape'); // closed → clear
            await settle();
            expect(host.value()).toBeNull();
            expect(inputEl().value).toBe('');
        });

        it('does not filter or select during IME composition', async () => {
            host.open.set(true);
            await settle();
            inputEl().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
            // typing mid-composition must not filter
            inputEl().value = 'ap';
            inputEl().dispatchEvent(new Event('input', { bubbles: true }));
            await settle();
            expect(visibleItems().length).toBe(3);
            // committing the composition applies the value and filters
            inputEl().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'ap' }));
            await settle();
            expect(visibleItems().length).toBe(2);
        });
    });

    describe('single selection', () => {
        it('selects via Enter, writes the label, and closes', async () => {
            key('ArrowDown');
            await settle();
            key('Enter');
            await settle();
            expect(host.value()).toBe('apple');
            expect(inputEl().value).toBe('Apple');
            expect(host.open()).toBe(false);
        });

        it('keeps focus on the input after selecting, so the keyboard can reopen it', async () => {
            host.open.set(true);
            await settle();
            items()[0].dispatchEvent(new Event('pointerup', { bubbles: true }));
            await settle();
            expect(host.open()).toBe(false);
            expect(document.activeElement).toBe(inputEl());
            // keyboard can reopen
            key('ArrowDown');
            await settle();
            expect(host.open()).toBe(true);
        });

        it('shows the whole list again when reopened after a selection (label does not filter)', async () => {
            // select Banana
            host.open.set(true);
            await settle();
            items()[1].dispatchEvent(new Event('pointerup', { bubbles: true }));
            await settle();
            expect(inputEl().value).toBe('Banana');
            // reopen via the trigger — all items must be visible, not just "Banana"
            fixture.nativeElement.querySelector('[rdxComboboxTrigger]').click();
            await settle();
            expect(visibleItems().length).toBe(3);
            // typing a fresh query then filters
            type('ap');
            await settle();
            expect(visibleItems().length).toBe(2);
        });

        it('selects via pointerup', async () => {
            host.open.set(true);
            await settle();
            items()[1].dispatchEvent(new Event('pointerup', { bubbles: true }));
            await settle();
            expect(host.value()).toBe('banana');
            expect(host.open()).toBe(false);
        });

        it('reverts the input text on outside close', async () => {
            // select Apple first
            key('ArrowDown');
            await settle();
            key('Enter');
            await settle();
            // reopen and edit text
            host.open.set(true);
            await settle();
            type('Appl');
            await settle();
            root().closePopup(true);
            await settle();
            expect(inputEl().value).toBe('Apple');
        });

        it('clears the selection via the Clear button', async () => {
            key('ArrowDown');
            await settle();
            key('Enter');
            await settle();
            fixture.nativeElement.querySelector('[rdxComboboxClear]').click();
            await settle();
            expect(host.value()).toBeNull();
            expect(inputEl().value).toBe('');
            expect(inputEl().hasAttribute('data-placeholder')).toBe(true);
        });

        it('marks the selected item with data-selected and shows its indicator', async () => {
            key('ArrowDown');
            await settle();
            key('Enter');
            await settle();
            host.open.set(true);
            await settle();
            const apple = items().find((el) => el.textContent?.includes('Apple'))!;
            expect(apple.hasAttribute('data-selected')).toBe(true);
            const indicator = apple.querySelector('[rdxComboboxItemIndicator]') as HTMLElement;
            expect(indicator.hasAttribute('hidden')).toBe(false);
        });
    });

    describe('multiple selection', () => {
        beforeEach(async () => {
            host.multiple.set(true);
            host.value.set([]);
            await settle();
        });

        it('toggles values, keeps the popup open, and clears the input', async () => {
            host.open.set(true);
            await settle();
            items()[0].dispatchEvent(new Event('pointerup', { bubbles: true }));
            await settle();
            items()[2].dispatchEvent(new Event('pointerup', { bubbles: true }));
            await settle();
            expect(host.value()).toEqual(['apple', 'grape']);
            expect(host.open()).toBe(true);
            expect(inputEl().value).toBe('');
        });

        it('removes the last value on Backspace in an empty input', async () => {
            host.value.set(['apple', 'grape']);
            await settle();
            key('Backspace');
            await settle();
            expect(host.value()).toEqual(['apple']);
        });
    });
});
