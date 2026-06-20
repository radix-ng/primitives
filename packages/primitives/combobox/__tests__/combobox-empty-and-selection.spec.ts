import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

/**
 * Regressions from the ADR 0014 Base-UI parity review:
 *  - Finding 2: `RdxComboboxEmpty` is a live region that must stay mounted/visible; only its content
 *    toggles. It must never be removed via `hidden` (which pulls it out of the a11y tree and suppresses
 *    the "no results" announcement).
 *  - Finding 3: an option carries `aria-selected` / `data-selected` only when selection is meaningful
 *    (`selectionMode !== 'none'`). In `none` mode the attributes are omitted entirely.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(value)]="value" [(open)]="open" [selectionMode]="selectionMode()" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxComboboxItem>{{ fruit }}</div>
                        }
                    </div>
                    <div rdxComboboxEmpty>No results</div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal<string | null>('Apple');
    readonly open = signal(true);
    readonly selectionMode = signal<'single' | 'multiple' | 'none'>('single');
    readonly fruits = ['Apple', 'Apricot', 'Banana'];
}

describe('Combobox empty live region + selection-mode attributes', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function el(sel: string): HTMLElement {
        return fixture.nativeElement.querySelector(sel) ?? document.querySelector(sel)!;
    }
    function items(): HTMLElement[] {
        return Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[];
    }
    function type(text: string): void {
        const input = el('input') as HTMLInputElement;
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
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

    it('keeps the Empty live region mounted and unhidden while items match, with no message text', () => {
        const empty = el('[rdxComboboxEmpty]');
        expect(empty).toBeTruthy();
        expect(empty.hasAttribute('hidden')).toBe(false);
        expect(empty.getAttribute('role')).toBe('status');
        // Content is projected only when empty, so while items match the region carries no message,
        // and `data-empty` is absent so consumers can collapse it without removing it from the a11y tree.
        expect(empty.textContent?.trim()).toBe('');
        expect(empty.hasAttribute('data-empty')).toBe(false);
    });

    it('projects the message into the still-mounted region when nothing matches', async () => {
        type('zzz');
        await settle();
        const empty = el('[rdxComboboxEmpty]');
        expect(empty.hasAttribute('hidden')).toBe(false);
        expect(empty.getAttribute('role')).toBe('status');
        expect(empty.textContent?.trim()).toBe('No results');
        expect(empty.getAttribute('data-empty')).toBe('');
    });

    it('in single mode renders aria-selected on options (true on the selected one)', () => {
        const [apple, apricot] = items();
        expect(apple.getAttribute('aria-selected')).toBe('true');
        expect(apple.hasAttribute('data-selected')).toBe(true);
        expect(apricot.getAttribute('aria-selected')).toBe('false');
        expect(apricot.hasAttribute('data-selected')).toBe(false);
    });

    it('in none mode omits aria-selected and data-selected entirely', async () => {
        host.selectionMode.set('none');
        await settle();
        for (const item of items()) {
            expect(item.hasAttribute('aria-selected')).toBe(false);
            expect(item.hasAttribute('data-selected')).toBe(false);
        }
    });
});
