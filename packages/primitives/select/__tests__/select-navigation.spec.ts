import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { _importsSelect } from '../index';

interface Fruit {
    label: string;
    value: string;
    disabled: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsSelect],
    template: `
        <div [(value)]="value" [(open)]="open" (onValueChange)="onValueChange($event)" rdxSelectRoot>
            <button rdxSelectTrigger>
                <span rdxSelectValue placeholder="Select…"></span>
            </button>
            <div *rdxSelectPortal rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        @for (fruit of fruits(); track fruit.value) {
                            <div [value]="fruit.value" [disabled]="fruit.disabled" rdxSelectItem>
                                <span rdxSelectItemText>{{ fruit.label }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class Host {
    readonly value = signal<string | undefined>(undefined);
    readonly open = signal(false);
    readonly onValueChange = vi.fn();
    readonly fruits = signal<Fruit[]>([
        { label: 'Apple', value: 'apple', disabled: false },
        { label: 'Banana', value: 'banana', disabled: true },
        { label: 'Grape', value: 'grape', disabled: false }
    ]);
}

describe('Select highlight navigation', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function content(): HTMLElement {
        return document.querySelector('[rdxSelectPopup]') as HTMLElement;
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxSelectItem]'));
    }
    function key(k: string): void {
        content().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [Host] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        host.open.set(true);
        await settle();
    });

    it('the popup is a listbox with items as options (no item tabindex)', () => {
        expect(content().getAttribute('role')).toBe('listbox');
        expect(items()[0].getAttribute('role')).toBe('option');
        expect(items()[0].hasAttribute('tabindex')).toBe(false);
    });

    it('highlights disabled options with arrows and exposes their ids without selecting them', async () => {
        expect(items()[0].hasAttribute('data-highlighted')).toBe(true);
        expect(content().getAttribute('aria-activedescendant')).toBe(items()[0].id);

        key('ArrowDown');
        await settle();
        expect(items()[1].getAttribute('aria-disabled')).toBe('true');
        expect(items()[1].hasAttribute('data-highlighted')).toBe(true);
        expect(items()[0].hasAttribute('data-highlighted')).toBe(false);
        expect(content().getAttribute('aria-activedescendant')).toBe(items()[1].id);

        key('ArrowDown');
        await settle();
        expect(items()[2].hasAttribute('data-highlighted')).toBe(true);
        key('ArrowUp');
        await settle();
        expect(items()[1].hasAttribute('data-highlighted')).toBe(true);
        expect(host.onValueChange).not.toHaveBeenCalled();
    });

    it.each(['Enter', ' '])('does not select or close on %j over a disabled option', async (activation) => {
        const initialValue = host.value();
        key('ArrowDown');
        await settle();
        key(activation);
        await settle();
        expect(host.value()).toBe(initialValue);
        expect(host.open()).toBe(true);
        expect(items()[1].hasAttribute('data-highlighted')).toBe(true);
        expect(host.onValueChange).not.toHaveBeenCalled();
    });

    it('ignores pointer activation of a disabled option', async () => {
        const initialValue = host.value();
        items()[1].dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
        await settle();
        expect(host.value()).toBe(initialValue);
        expect(host.open()).toBe(true);
        expect(host.onValueChange).not.toHaveBeenCalled();
    });

    it('navigates disabled boundaries with Home/End without wrapping, even when every option is disabled', async () => {
        host.fruits.update((fruits) => fruits.map((fruit) => ({ ...fruit, disabled: true })));
        await settle();
        key('End');
        await settle();
        expect(content().getAttribute('aria-activedescendant')).toBe(items()[2].id);
        key('ArrowDown');
        await settle();
        expect(items()[2].hasAttribute('data-highlighted')).toBe(true);
        key('Home');
        await settle();
        expect(content().getAttribute('aria-activedescendant')).toBe(items()[0].id);
        key('ArrowUp');
        await settle();
        expect(items()[0].hasAttribute('data-highlighted')).toBe(true);
        expect(host.onValueChange).not.toHaveBeenCalled();
    });

    it('highlights an already selected disabled option when reopening', async () => {
        host.open.set(false);
        host.value.set('banana');
        await settle();
        host.open.set(true);
        await settle();
        expect(items()[1].getAttribute('aria-selected')).toBe('true');
        expect(items()[1].hasAttribute('data-highlighted')).toBe(true);
        expect(content().getAttribute('aria-activedescendant')).toBe(items()[1].id);
        key('Enter');
        await settle();
        expect(host.value()).toBe('banana');
        expect(host.open()).toBe(true);
        expect(host.onValueChange).not.toHaveBeenCalled();
    });

    it('keeps a newly disabled highlight but releases a removed option', async () => {
        host.fruits.update((fruits) => fruits.map((fruit) => ({ ...fruit, disabled: true })));
        await settle();
        const removedId = items()[0].id;
        expect(content().getAttribute('aria-activedescendant')).toBe(removedId);
        key('Enter');
        await settle();
        expect(host.open()).toBe(true);
        expect(host.onValueChange).not.toHaveBeenCalled();
        host.fruits.update((fruits) => fruits.filter((fruit) => fruit.value !== 'apple'));
        await settle();
        expect(content().getAttribute('aria-activedescendant')).not.toBe(removedId);
    });

    it('does not match a disabled option through typeahead', async () => {
        key('b');
        await settle();
        expect(items()[0].hasAttribute('data-highlighted')).toBe(true);
        expect(host.onValueChange).not.toHaveBeenCalled();
    });

    it('Enter selects the highlighted item and marks it data-selected', async () => {
        // Apple is highlighted on open
        key('Enter');
        await settle();
        expect(host.value()).toBe('apple');
        expect(host.open()).toBe(false);

        host.open.set(true);
        await settle();
        const apple = items()[0];
        expect(apple.getAttribute('data-selected')).toBe('');
        expect(apple.getAttribute('aria-selected')).toBe('true');
    });

    it('typeahead highlights the next enabled item whose text matches the typed character', async () => {
        // Apple is highlighted on open; typing "g" jumps to Grape (skipping the disabled Banana).
        key('g');
        await settle();
        expect(items()[2].hasAttribute('data-highlighted')).toBe(true);
        expect(content().getAttribute('aria-activedescendant')).toBe(items()[2].id);
        expect(items()[0].hasAttribute('data-highlighted')).toBe(false);
    });
});
