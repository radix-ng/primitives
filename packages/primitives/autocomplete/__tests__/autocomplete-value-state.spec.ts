import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete, AutocompleteMode, AutocompleteValueChangeDetails, RdxAutocompleteRoot } from '../index';

@Component({
    imports: [_importsAutocomplete],
    template: `
        @if (controlled()) {
            <div
                #root="rdxAutocompleteRoot"
                [(value)]="value"
                [open]="true"
                [mode]="mode()"
                [autoHighlight]="autoHighlight()"
                [items]="items"
                (onValueChange)="change($event)"
                rdxAutocompleteRoot
            >
                <input rdxAutocompleteInput aria-label="Query" />
                <span #display="rdxAutocompleteValue" [textContent]="display.slotText()" rdxAutocompleteValue></span>
                <div *rdxAutocompletePortal rdxAutocompletePositioner>
                    <div rdxAutocompletePopup>
                        <div rdxAutocompleteList aria-label="Suggestions">
                            @for (item of root.filteredItems(); track item) {
                                <div [value]="item" [textContent]="item" rdxAutocompleteItem></div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        } @else {
            <div
                #root="rdxAutocompleteRoot"
                [defaultValue]="value()"
                [open]="true"
                [mode]="mode()"
                [autoHighlight]="autoHighlight()"
                [items]="items"
                (onValueChange)="change($event)"
                rdxAutocompleteRoot
            >
                <input rdxAutocompleteInput aria-label="Query" />
                <span #display="rdxAutocompleteValue" [textContent]="display.slotText()" rdxAutocompleteValue></span>
                <div *rdxAutocompletePortal rdxAutocompletePositioner>
                    <div rdxAutocompletePopup>
                        <div rdxAutocompleteList aria-label="Suggestions">
                            @for (item of root.filteredItems(); track item) {
                                <div [value]="item" [textContent]="item" rdxAutocompleteItem></div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
    `
})
class Host {
    readonly controlled = signal(true);
    readonly value = signal('');
    readonly mode = signal<AutocompleteMode>('both');
    readonly autoHighlight = signal(false);
    readonly cancel = signal(false);
    readonly items = ['Alpha', 'Alpine', 'Beta', 'Gamma'];
    readonly changes: string[] = [];
    change(details: AutocompleteValueChangeDetails): void {
        this.changes.push(details.value);
        if (this.cancel()) details.eventDetails.cancel();
    }
}

function setup(controlled = true, value = '') {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    host.controlled.set(controlled);
    host.value.set(value);
    const settle = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const root = () => fixture.debugElement.query(By.directive(RdxAutocompleteRoot)).injector.get(RdxAutocompleteRoot);
    const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const key = async (key: string) => {
        input().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
        await settle();
    };
    const edit = async (value: string) => {
        input().value = value;
        input().dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
        await settle();
    };
    return { fixture, host, settle, root, input, key, edit };
}

describe('Autocomplete committed query and temporary display', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [Host] }));

    it('filters an initial padded value and accepted external replacements', async () => {
        const h = setup(true, ' Beta ');
        await h.settle();
        expect(h.root().query()).toBe('Beta');
        expect(h.root().filteredItems()).toEqual(['Beta']);
        h.host.value.set(' Al ');
        await h.settle();
        expect(h.root().query()).toBe('Al');
        expect(h.root().filteredItems()).toEqual(['Alpha', 'Alpine']);
        expect(h.input().value).toBe(' Al ');
        expect(h.host.changes).toEqual([]);
    });

    it('keeps whitespace in the value while an empty trimmed query shows all items', async () => {
        const h = setup(true, '   ');
        await h.settle();
        expect(h.root().query()).toBe('');
        expect(h.root().filteredItems()).toEqual(h.host.items);
        expect(h.input().value).toBe('   ');
    });

    it('does not implicitly enable auto-highlight for completion modes', async () => {
        const h = setup();
        await h.settle();
        await h.edit('al');
        expect(h.root().highlightedItem()).toBeNull();
        expect(h.root().inlinePreview()).toBeNull();
        expect(h.input().value).toBe('al');
        await h.key('ArrowDown');
        expect(h.input().value).toBe('Alpha');
        expect(h.root().query()).toBe('al');
        expect(h.root().filteredItems()).toEqual(['Alpha', 'Alpine']);
    });

    it('keeps accepted controlled input authoritative over its automatic highlight', async () => {
        const h = setup();
        h.host.autoHighlight.set(true);
        await h.settle();
        await h.edit('al');
        expect(h.root().highlightedItem()?.value()).toBe('Alpha');
        expect(h.root().inlinePreview()).toBeNull();
        expect(h.input().value).toBe('al');
        await h.key('ArrowDown');
        expect(h.input().value).toBe('Alpine');
        expect(h.host.value()).toBe('al');
    });

    it('completes an uncontrolled edit with the actual label and exposes it through Value', async () => {
        const h = setup(false);
        h.host.autoHighlight.set(true);
        await h.settle();
        await h.edit('al');
        expect(h.root().value()).toBe('al');
        expect(h.root().inlinePreview()).toBe('Alpha');
        expect(h.input().value).toBe('Alpha');
        expect(h.fixture.nativeElement.querySelector('[rdxAutocompleteValue]').textContent).toBe('Alpha');
    });

    it('retains the preview during pointer hover and pointer-driven clear', async () => {
        const h = setup();
        await h.settle();
        await h.key('ArrowDown');
        const item = document.querySelectorAll('[rdxAutocompleteItem]')[1];
        item.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }));
        await h.settle();
        expect(h.root().highlightedItem()?.value()).toBe('Alpine');
        expect(h.input().value).toBe('Alpha');
        item.dispatchEvent(new MouseEvent('pointerleave', { bubbles: true, relatedTarget: h.input() }));
        await h.settle();
        expect(h.root().highlightedItem()).toBeNull();
        expect(h.input().value).toBe('Alpha');
    });

    it('invalidates preview on external value and completion-capability changes', async () => {
        const h = setup();
        await h.settle();
        await h.key('ArrowDown');
        h.host.mode.set('list');
        await h.settle();
        h.host.mode.set('both');
        await h.settle();
        expect(h.input().value).toBe('');
        await h.key('ArrowDown');
        expect(h.input().value).toBe('Alpine');
        h.host.value.set('Beta');
        await h.settle();
        expect(h.root().inlinePreview()).toBeNull();
        expect(h.input().value).toBe('Beta');
        expect(h.root().filteredItems()).toEqual(['Beta']);
    });

    it('retains a valid cursor position when an external query replaces its filtered item', async () => {
        const h = setup();
        await h.settle();
        await h.key('ArrowDown');
        h.host.value.set('Gamma');
        await h.settle();
        expect(h.input().value).toBe('Gamma');
        expect(h.root().highlightedItem()?.value()).toBe('Gamma');
        expect(h.root().inlinePreview()).toBeNull();
    });

    it('preserves the committed query and drops completion when an edit is canceled', async () => {
        const h = setup(true, 'al');
        await h.settle();
        await h.key('ArrowDown');
        expect(h.input().value).toBe('Alpha');
        h.host.cancel.set(true);
        await h.edit('b');
        expect(h.host.value()).toBe('al');
        expect(h.root().query()).toBe('al');
        expect(h.root().inlinePreview()).toBeNull();
        expect(h.input().value).toBe('al');
    });
});
