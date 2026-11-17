import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';
import { AutocompleteMode, RdxAutocompleteRoot } from '../src/autocomplete-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div
            [(value)]="value"
            [(open)]="open"
            [mode]="mode()"
            [autoHighlight]="autoHighlight()"
            [items]="fruits()"
            rdxAutocompleteRoot
        >
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
    function edit(text: string, inputType: string, isComposing = false): void {
        const el = inputEl();
        el.value = text;
        el.dispatchEvent(
            new InputEvent('input', {
                bubbles: true,
                inputType,
                isComposing,
                data: inputType.startsWith('insert') ? text.at(-1) : null
            })
        );
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
        it('filters controlled text and creates completion on keyboard navigation', async () => {
            host.mode.set('both');
            host.autoHighlight.set(true);
            await settle();
            type('ap');
            await settle();
            expect(root().value()).toBe('ap');
            expect(root().inlinePreview()).toBeNull();
            expect(root().displayValue()).toBe('ap');
            inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await settle();
            expect(root().displayValue()).toBe('Apricot');
        });

        // ADR 0014 review: switching out of an inline mode must clear an active preview.
        it('clears an active inline preview when mode switches to a non-inline mode', async () => {
            host.mode.set('both');
            await settle();
            type('ap');
            await settle();
            inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await settle();
            expect(root().inlinePreview()).toBe('Apple');
            host.mode.set('list');
            await settle();
            expect(root().inlinePreview()).toBeNull();
            expect(root().displayValue()).toBe('ap');
        });
    });

    describe('inline', () => {
        it('keeps inline items static and controlled typing authoritative', async () => {
            host.mode.set('inline');
            host.autoHighlight.set(true);
            await settle();
            type('ban');
            await settle();
            expect(visibleItems()).toHaveLength(4);
            expect(root().highlightedItem()?.textValue()).toBe('Apple');
            expect(root().inlinePreview()).toBeNull();
            expect(root().displayValue()).toBe('ban');
        });

        it('requires navigation when autoHighlight is omitted', async () => {
            host.mode.set('both');
            await settle();
            type('ap');
            await settle();
            expect(root().highlightedItem()).toBeNull();
            expect(root().displayValue()).toBe('ap');
            inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await settle();
            expect(root().displayValue()).toBe('Apple');
        });

        it('accepts synthetic edits without inputType and drops the prior completion', async () => {
            host.mode.set('inline');
            host.autoHighlight.set(true);
            await settle();
            type('ban');
            await settle();
            inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await settle();
            expect(root().displayValue()).toBe('Apricot');
            type('ba');
            await settle();
            expect(root().value()).toBe('ba');
            expect(root().inlinePreview()).toBeNull();
        });

        it('commits a mobile delete without keydown and resumes completion on navigation', async () => {
            host.mode.set('inline');
            host.autoHighlight.set(true);
            await settle();
            edit('ban', 'insertText');
            await settle();
            edit('ba', 'deleteContentBackward');
            await settle();
            expect(root().value()).toBe('ba');
            expect(root().displayValue()).toBe('ba');
            inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await settle();
            expect(root().displayValue()).toBe('Apricot');
        });

        it('commits a cut as controlled text without retaining completion', async () => {
            host.mode.set('inline');
            host.autoHighlight.set(true);
            await settle();
            edit('ban', 'insertText');
            await settle();
            edit('ba', 'deleteByCut');
            await settle();
            expect(root().value()).toBe('ba');
            expect(root().inlinePreview()).toBeNull();
        });

        it('accepts a paste after deletion and offers completion on the next navigation', async () => {
            host.mode.set('inline');
            host.autoHighlight.set(true);
            await settle();
            edit('ban', 'insertText');
            await settle();
            edit('ba', 'deleteContentBackward');
            await settle();
            edit('ban', 'insertFromPaste');
            await settle();
            expect(root().value()).toBe('ban');
            expect(root().displayValue()).toBe('ban');
            inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await settle();
            expect(root().displayValue()).toBe('Apricot');
        });

        it('defers composition edits until commit and preserves controlled text', async () => {
            host.mode.set('inline');
            host.autoHighlight.set(true);
            await settle();
            edit('ba', 'deleteContentBackward');
            await settle();
            inputEl().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
            edit('ban', 'insertCompositionText', true);
            await settle();
            expect(root().value()).toBe('ba');
            inputEl().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'n' }));
            await settle();
            expect(root().value()).toBe('ban');
            expect(root().displayValue()).toBe('ban');
        });

        it('reflects the actual highlighted label while the committed query stays fixed', async () => {
            host.mode.set('both');
            await settle();
            type('a');
            await settle();
            expect(root().displayValue()).toBe('a');
            for (const label of ['Apple', 'Apricot', 'Banana']) {
                inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                await settle();
                expect(root().displayValue()).toBe(label);
                expect(root().value()).toBe('a');
            }
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
            await settle();
            type('ap');
            await settle();
            inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await settle();
            expect(root().inlinePreview()).toBe('Apple');
            expect(inputEl().getAttribute('aria-autocomplete')).toBe('both');
        });
    });
});
