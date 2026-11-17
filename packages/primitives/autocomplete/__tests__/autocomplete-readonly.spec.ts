import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';
import { AutocompleteMode, AutocompleteValueChangeDetails, RdxAutocompleteRoot } from '../src/autocomplete-root';

/**
 * Regression (ADR 0014 review, Finding 1): autocomplete's value IS the input string, so its single
 * `commitValue` must carry the same disabled / read-only guard combobox has. A read-only or disabled
 * autocomplete must not be mutable through the Clear button (the path that regressed) — the button is
 * also rendered disabled so it doesn't merely look actionable.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div
            [(value)]="value"
            [(open)]="open"
            [mode]="mode()"
            [grid]="grid()"
            [readOnly]="readOnly()"
            [disabled]="disabled()"
            (onValueChange)="changes.push($event)"
            rdxAutocompleteRoot
        >
            <input rdxAutocompleteInput aria-label="Fruit" />
            <button rdxAutocompleteTrigger>Toggle</button>
            <button rdxAutocompleteClear>clear</button>
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxAutocompleteItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal('Apple');
    readonly open = signal(false);
    readonly mode = signal<AutocompleteMode>('list');
    readonly grid = signal(false);
    readonly readOnly = signal(true);
    readonly disabled = signal(false);
    readonly fruits = ['Apple', 'Apricot', 'Banana'];
    readonly changes: AutocompleteValueChangeDetails[] = [];
}

describe('Autocomplete read-only value guard', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function clearButton(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('[rdxAutocompleteClear]');
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
    });

    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function root(): RdxAutocompleteRoot {
        return fixture.debugElement.query(By.directive(RdxAutocompleteRoot)).injector.get(RdxAutocompleteRoot);
    }
    async function key(key: string): Promise<KeyboardEvent> {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        inputEl().dispatchEvent(event);
        await settle();
        return event;
    }

    it('opens and browses while read-only without completing or committing', async () => {
        host.mode.set('both');
        await settle();
        await key('ArrowDown');
        expect(host.open()).toBe(true);
        await key('ArrowDown');
        expect(root().highlightedItem()?.value()).toBe('Apple');
        expect(inputEl().value).toBe('Apple');
        const enter = await key('Enter');
        expect(enter.defaultPrevented).toBe(true);
        expect(host.open()).toBe(true);
        expect(host.changes).toEqual([]);
    });

    it('[WCAG 4.1.2] exposes read-only semantics and restores configured completion on editability', async () => {
        host.mode.set('both');
        host.open.set(true);
        await settle();
        expect(inputEl().getAttribute('aria-readonly')).toBe('true');
        expect(inputEl().getAttribute('aria-autocomplete')).toBe('none');
        expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        expect(await axe(document.querySelector('[rdxAutocompletePositioner]')!)).toHaveNoViolations();
        expect(document.querySelector('[rdxAutocompleteList]')?.getAttribute('aria-readonly')).toBe('true');
        host.readOnly.set(false);
        await settle();
        expect(inputEl().hasAttribute('aria-readonly')).toBe(false);
        expect(inputEl().getAttribute('aria-autocomplete')).toBe('both');
        expect(document.querySelector('[rdxAutocompleteList]')?.hasAttribute('aria-readonly')).toBe(false);
    });

    it('keeps read-only grid semantics on the input instead of the grid', async () => {
        host.grid.set(true);
        host.open.set(true);
        await settle();
        expect(inputEl().getAttribute('aria-readonly')).toBe('true');
        expect(document.querySelector('[rdxAutocompleteList]')?.hasAttribute('aria-readonly')).toBe(false);
    });

    it.each(['both', 'inline'] as const)(
        'discards %s completion until a fresh interaction after read-only',
        async (mode) => {
            host.readOnly.set(false);
            host.mode.set(mode);
            host.value.set('');
            await settle();
            await key('ArrowDown');
            await key('ArrowDown');
            expect(inputEl().value).toBe('Apple');
            expect(host.value()).toBe('');
            host.readOnly.set(true);
            await settle();
            expect(inputEl().value).toBe('');
            await key('ArrowDown');
            expect(inputEl().value).toBe('');
            host.readOnly.set(false);
            await settle();
            expect(inputEl().value).toBe('');
            await key('ArrowUp');
            expect(inputEl().value).toBe('Apple');
            expect(host.value()).toBe('');
        }
    );

    it('ignores an input event while read-only without changing the query or opening', async () => {
        inputEl().value = 'Injected';
        inputEl().dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
        await settle();
        expect(root().query()).toBe('Apple');
        expect(host.value()).toBe('Apple');
        expect(host.open()).toBe(false);
        expect(host.changes).toEqual([]);
    });

    it('allows Enter without a highlight to keep native form behavior and the popup open', async () => {
        host.open.set(true);
        await settle();
        const event = await key('Enter');
        expect(event.defaultPrevented).toBe(false);
        expect(host.open()).toBe(true);
        expect(host.changes).toEqual([]);
    });

    it('allows the shared Trigger to open a read-only autocomplete with the keyboard', async () => {
        fixture.nativeElement
            .querySelector('[rdxAutocompleteTrigger]')
            .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
        await settle();
        expect(host.open()).toBe(true);
        expect(host.value()).toBe('Apple');
        expect(host.changes).toEqual([]);
    });

    it('keeps disabled opening blocked', async () => {
        host.disabled.set(true);
        await settle();
        await key('ArrowDown');
        expect(host.open()).toBe(false);
        expect(host.changes).toEqual([]);
    });

    it('does not clear the value via the Clear button when read-only', async () => {
        clearButton().click();
        await settle();
        expect(host.value()).toBe('Apple');
        expect(host.changes).toEqual([]);
    });

    it('renders the Clear button disabled when read-only', () => {
        expect(clearButton().hasAttribute('disabled')).toBe(true);
    });

    it('also blocks the Clear mutation when disabled', async () => {
        host.readOnly.set(false);
        host.disabled.set(true);
        await settle();
        clearButton().click();
        await settle();
        expect(host.value()).toBe('Apple');
        expect(host.changes).toEqual([]);
        expect(clearButton().hasAttribute('disabled')).toBe(true);
    });

    it('clears normally once read-only is lifted', async () => {
        host.readOnly.set(false);
        await settle();
        expect(clearButton().hasAttribute('disabled')).toBe(false);
        clearButton().click();
        await settle();
        expect(host.value()).toBe('');
        expect(host.changes.at(-1)).toMatchObject({ value: '', reason: 'input-clear' });
    });
});
