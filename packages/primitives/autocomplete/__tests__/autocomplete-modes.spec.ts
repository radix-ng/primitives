import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';
import { AutocompleteMode, RdxAutocompleteRoot } from '../src/autocomplete-root';

@Component({
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" [(open)]="open" [mode]="mode()" [autoHighlight]="autoHighlight()" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Fruit" />
            <div rdxAutocompletePortal>
                <ng-template rdxAutocompletePortalPresence>
                    <div rdxAutocompletePositioner>
                        <div rdxAutocompletePopup>
                            <div rdxAutocompleteList aria-label="Fruits">
                                @for (fruit of fruits(); track fruit) {
                                    <div rdxAutocompleteItem>{{ fruit }}</div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal('');
    readonly open = signal(false);
    readonly mode = signal<AutocompleteMode>('list');
    readonly autoHighlight = signal(false);
    readonly fruits = signal(['Apple', 'Apricot', 'Banana', 'Grape']);
}

describe('Autocomplete modes', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function root(): RdxAutocompleteRoot {
        return fixture.debugElement.query(By.directive(RdxAutocompleteRoot)).injector.get(RdxAutocompleteRoot);
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function visibleItems(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxAutocompleteItem]')).filter(
            (el) => !el.hasAttribute('hidden')
        ) as HTMLElement[];
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

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
    });

    describe('list (default)', () => {
        it('filters the list and never inline-completes', async () => {
            host.mode.set('list');
            host.autoHighlight.set(true);
            await settle();
            type('ap');
            await settle();
            expect(visibleItems().map((el) => el.textContent?.trim())).toEqual(['Apple', 'Apricot', 'Grape']);
            expect(root().inlinePreview()).toBeNull();
            expect(root().displayValue()).toBe('ap');
        });
    });

    describe('none', () => {
        it('keeps the list static and never inline-completes', async () => {
            host.mode.set('none');
            host.autoHighlight.set(true);
            host.open.set(true);
            await settle();
            type('zzz');
            await settle();
            expect(visibleItems()).toHaveLength(4);
            expect(root().inlinePreview()).toBeNull();
        });
    });

    describe('both', () => {
        it('filters and inline-completes from the first prefix match', async () => {
            host.mode.set('both');
            host.autoHighlight.set(true);
            await settle();
            type('ap');
            await settle();
            // Only prefix/substring matches remain; the highlight + inline preview use the first prefix match.
            expect(root().value()).toBe('ap');
            expect(root().inlinePreview()).toBe('apple');
            expect(root().displayValue()).toBe('apple');
        });
    });

    describe('inline', () => {
        it('does not filter but inline-completes from the first prefix match', async () => {
            host.mode.set('inline');
            host.autoHighlight.set(true);
            await settle();
            type('ban');
            await settle();
            expect(visibleItems()).toHaveLength(4); // unfiltered
            expect(root().inlinePreview()).toBe('banana');
            expect(root().displayValue()).toBe('banana');
        });

        it('inline-completes without an explicit autoHighlight (mode implies it)', async () => {
            host.mode.set('both');
            // no autoHighlight set
            await settle();
            type('ap');
            await settle();
            expect(root().inlinePreview()).toBe('apple');
            expect(root().displayValue()).toBe('apple');
        });

        it('clears the inline preview on a deleting keystroke', async () => {
            host.mode.set('inline');
            host.autoHighlight.set(true);
            await settle();
            type('ban');
            await settle();
            expect(root().inlinePreview()).toBe('banana');

            inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
            type('ba');
            await settle();
            expect(root().inlinePreview()).toBeNull();
        });

        it('reflects the highlighted item in the input while navigating, even without a prefix match', async () => {
            host.mode.set('both');
            await settle();
            type('a');
            await settle();
            // First prefix match (Apple) completes the typed "a".
            expect(root().displayValue()).toBe('apple');

            const arrowDown = () =>
                inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            arrowDown(); // → Apricot (prefix match)
            await settle();
            expect(root().displayValue()).toBe('apricot');

            arrowDown(); // → Banana (contains "a" but does not start with it)
            await settle();
            expect(root().highlightedItem()?.textValue()).toBe('Banana');
            expect(root().displayValue()).toBe('Banana');
        });

        it('does not jump to a non-prefix label while typing (only on keyboard navigation)', async () => {
            host.mode.set('both');
            await settle();
            // "rap" matches only Grape (non-prefix); typing must not auto-fill it.
            type('rap');
            await settle();
            expect(root().displayValue()).toBe('rap');
            expect(root().inlinePreview()).toBeNull();
        });
    });

    describe('aria-autocomplete', () => {
        it('mirrors the configured mode (matches Base UI), independent of inline preview', async () => {
            for (const mode of ['list', 'both', 'inline', 'none'] as const) {
                host.mode.set(mode);
                await settle();
                expect(inputEl().getAttribute('aria-autocomplete')).toBe(mode);
            }
        });

        it('stays fixed to the mode while an inline completion becomes active', async () => {
            host.mode.set('both');
            host.autoHighlight.set(true);
            await settle();
            expect(inputEl().getAttribute('aria-autocomplete')).toBe('both');
            type('ap');
            await settle();
            expect(root().inlinePreview()).toBe('apple');
            expect(inputEl().getAttribute('aria-autocomplete')).toBe('both');
        });
    });
});
