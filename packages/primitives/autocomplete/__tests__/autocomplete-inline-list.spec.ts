import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

/**
 * Command-palette / "inline list" composition: the `List` is rendered directly under the root with no
 * `Portal` / `Positioner` / `Popup`, the popup is always open, and `autoHighlight="always"` keeps the
 * first item highlighted.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div [(open)]="open" autoHighlight="always" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Command" />
            <div rdxAutocompleteList aria-label="Commands">
                @for (item of items(); track item) {
                    <div rdxAutocompleteItem>{{ item }}</div>
                }
            </div>
            <div rdxAutocompleteEmpty>No results</div>
        </div>
    `
})
class HostComponent {
    readonly open = signal(true);
    readonly items = signal(['New Window', 'New Tab', 'Toggle Sidebar', 'Run Script']);
}

describe('Autocomplete inline list (command palette)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function visibleItems(): HTMLElement[] {
        return Array.from(fixture.nativeElement.querySelectorAll('[rdxAutocompleteItem]')).filter(
            (el) => !(el as HTMLElement).hasAttribute('hidden')
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
    function key(k: string): void {
        inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
    });

    it('renders the list inline and filters without a popup', async () => {
        type('new');
        await settle();
        expect(visibleItems().map((el) => el.textContent?.trim())).toEqual(['New Window', 'New Tab']);
    });

    it('keeps the first item highlighted (autoHighlight=always)', async () => {
        expect(visibleItems()[0].hasAttribute('data-highlighted')).toBe(true);
        type('toggle');
        await settle();
        expect(visibleItems()[0].textContent?.trim()).toBe('Toggle Sidebar');
        expect(visibleItems()[0].hasAttribute('data-highlighted')).toBe(true);
    });

    it('Enter selects the highlighted command and closes', async () => {
        type('run');
        await settle();
        key('Enter');
        await settle();
        expect(host.open()).toBe(false);
    });
});
