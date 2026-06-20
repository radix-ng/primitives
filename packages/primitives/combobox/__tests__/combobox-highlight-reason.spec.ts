import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';
import { ComboboxItemHighlightedDetails, RdxComboboxRoot } from '../src/combobox-root';

// --- #1: non-virtualized programmatic highlight reports reason 'none', not a stale 'keyboard' ---
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" (onItemHighlighted)="events.push($event)" autoHighlight="input-change" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxComboboxItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class ReasonHost {
    readonly open = signal(false);
    readonly fruits = ['Apple', 'Apricot', 'Banana'];
    readonly events: ComboboxItemHighlightedDetails[] = [];
}

// --- #2: virtualized autoHighlight='always' re-seeds when a filter shrinks the list past the index ---
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div
            #cmb="rdxComboboxRoot"
            [(open)]="open"
            [items]="items"
            [limit]="limit()"
            virtualized
            autoHighlight="always"
            rdxComboboxRoot
        >
            <input rdxComboboxInput aria-label="Item" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Items">
                        @for (i of windowIndexes; track i) {
                            <div [value]="cmb.filteredItems()[i]" [index]="i" rdxComboboxItem></div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class VirtualAlwaysHost {
    readonly open = signal(false);
    readonly limit = signal(-1);
    readonly items = Array.from({ length: 100 }, (_, index) => `Item ${index}`);
    readonly windowIndexes = [0, 1, 2, 3, 4];
}

// --- #3 (ADR 0014 review): DOM-mode self-heal clears the highlight with reason 'none'. With no
// autoHighlight, filtering the highlighted item out leaves nothing re-seeded — `useListHighlight`
// clears `highlighted` without touching `highlightReason`, so the cleared emit must still be 'none'.
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" (onItemHighlighted)="events.push($event)" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxComboboxItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class NoAutoHighlightHost {
    readonly open = signal(false);
    readonly fruits = ['Apple', 'Apricot', 'Banana'];
    readonly events: ComboboxItemHighlightedDetails[] = [];
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

describe('Combobox highlight reason / re-seed', () => {
    it('non-virtualized programmatic re-seed emits reason "none", not a stale "keyboard"', async () => {
        const fixture = TestBed.createComponent(ReasonHost);
        const host = fixture.componentInstance;
        host.open.set(true);
        await settle(fixture);

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await settle(fixture);
        expect(host.events.at(-1)).toEqual({ value: 'Apple', index: 0, reason: 'keyboard' });

        // Typing filters out the highlighted item and programmatically re-seeds the first match
        // (Banana) via autoHighlight 'input-change' — the emitted reason must reset to 'none'.
        input.value = 'Ban';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await settle(fixture);

        expect(host.events.at(-1)).toEqual({ value: 'Banana', index: 0, reason: 'none' });
    });

    it('virtualized autoHighlight="always" re-seeds to 0 when a filter shrinks the list past the index', async () => {
        const fixture = TestBed.createComponent(VirtualAlwaysHost);
        const host = fixture.componentInstance;
        const root = fixture.debugElement.query(By.directive(RdxComboboxRoot)).injector.get(RdxComboboxRoot);
        host.open.set(true);
        await settle(fixture);

        // Navigate well past the eventual list length.
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        for (let i = 0; i < 50; i++) {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        }
        await settle(fixture);
        expect(root.highlightedIndex()).toBe(50);

        // Shrink filteredItems below the highlight via a non-typing path (the `limit` input).
        host.limit.set(3);
        await settle(fixture);

        // 'always' must keep the first item highlighted, not leave it cleared at -1.
        expect(root.highlightedIndex()).toBe(0);
    });

    it('DOM-mode self-heal clears the highlight with reason "none", not a stale "keyboard"', async () => {
        const fixture = TestBed.createComponent(NoAutoHighlightHost);
        const host = fixture.componentInstance;
        host.open.set(true);
        await settle(fixture);

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await settle(fixture);
        expect(host.events.at(-1)).toEqual({ value: 'Apple', index: 0, reason: 'keyboard' });

        // Typing 'Ban' filters the highlighted 'Apple' out; with no autoHighlight nothing re-seeds, so
        // the highlight is cleared. The cleared emit must report 'none', not the stale 'keyboard'.
        input.value = 'Ban';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await settle(fixture);

        expect(host.events.at(-1)).toEqual({ value: null, index: -1, reason: 'none' });
    });
});
