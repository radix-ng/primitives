import { _importsSelect } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

interface Fruit {
    label: string;
    value: string;
    disabled: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsSelect],
    template: `
        <div rdxSelectRoot [(value)]="value" [(open)]="open">
            <button rdxSelectTrigger>
                <span rdxSelectValue placeholder="Select…"></span>
            </button>
            <div *rdxSelectPortal rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div rdxSelectList>
                        @for (fruit of fruits; track fruit.value) {
                            <div rdxSelectItem [value]="fruit.value" [disabled]="fruit.disabled">
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
    readonly fruits: Fruit[] = [
        { label: 'Apple', value: 'apple', disabled: false },
        { label: 'Banana', value: 'banana', disabled: true },
        { label: 'Grape', value: 'grape', disabled: false }
    ];
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

    it('opens with the first enabled item highlighted and ArrowDown skips disabled items', async () => {
        // opening highlights the first enabled item (Apple)
        expect(items()[0].hasAttribute('data-highlighted')).toBe(true);
        expect(content().getAttribute('aria-activedescendant')).toBe(items()[0].id);

        key('ArrowDown'); // skips disabled Banana → Grape
        await settle();
        expect(items()[2].hasAttribute('data-highlighted')).toBe(true);
        expect(items()[1].hasAttribute('data-highlighted')).toBe(false);
        expect(items()[0].hasAttribute('data-highlighted')).toBe(false);
        expect(content().getAttribute('aria-activedescendant')).toBe(items()[2].id);
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
