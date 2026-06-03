import { _importsCombobox } from '../index';
import { ComboboxFilter, RdxComboboxRoot } from '../src/combobox-root';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div rdxComboboxRoot [filter]="filter()" [(value)]="value" [(open)]="open">
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits(); track fruit) {
                            <div rdxComboboxItem [value]="fruit">{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal<string | null>(null);
    readonly open = signal(false);
    readonly filter = signal<ComboboxFilter | null | undefined>(undefined);
    readonly fruits = signal<string[]>(['apple', 'banana', 'grape']);
}

describe('Combobox engine contract (ADR 0014)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function root(): RdxComboboxRoot {
        return fixture.debugElement.query(By.directive(RdxComboboxRoot)).injector.get(RdxComboboxRoot);
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function visibleItems(): HTMLElement[] {
        return Array.from(document.querySelectorAll<HTMLElement>('[rdxComboboxItem]')).filter(
            (el) => !el.hasAttribute('hidden')
        );
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
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

    // The shared filter contract is Base UI's `(itemValue, query, itemToString?)`: value first, with a
    // resolver for the text. Here the filter matches on the raw value and uses the resolver for text.
    it('calls the filter with the item value first and an itemToString resolver', async () => {
        const seen: unknown[] = [];
        host.filter.set((itemValue, _query, itemToString) => {
            seen.push([itemValue, itemToString?.(itemValue)]);
            return itemValue === 'banana';
        });
        host.open.set(true);
        await settle();
        expect(visibleItems().map((el) => el.textContent?.trim())).toEqual(['banana']);
        expect(seen).toEqual([
            ['apple', 'apple'],
            ['banana', 'banana'],
            ['grape', 'grape']
        ]);
    });

    // Replaces the review's #2: a deferred open-edge highlight must not survive a popup close.
    it('drops a pending open-edge highlight when the popup closes (no stray highlight on reopen)', async () => {
        host.fruits.set([]);
        await settle();

        // ArrowDown opens and queues a 'first' highlight, but the empty list can't apply it yet.
        key('ArrowDown');
        await settle();
        expect(host.open()).toBe(true);
        expect(root().highlightedItem()).toBeNull();

        // Close, then items arrive while closed.
        key('Escape');
        await settle();
        host.fruits.set(['apple', 'banana']);
        await settle();

        // A plain reopen (no autoHighlight) must NOT highlight — the stale 'first' was cleared on close.
        inputEl().dispatchEvent(new Event('click', { bubbles: true }));
        await settle();
        expect(host.open()).toBe(true);
        expect(root().highlightedItem()).toBeNull();
    });
});
