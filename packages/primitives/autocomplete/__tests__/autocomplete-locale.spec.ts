import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';

/**
 * The default `contains` filter must honor the `locale` input.
 *
 * Deterministic collation fixture: under Turkish rules the lowercase query `i` matches the dotted
 * `İ` in "İzmir" but NOT the dotless `I` in "Isparta"; under the default (English) locale it matches
 * both. Flipping `locale` on the same query proves the collator is rebuilt reactively.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" [(open)]="open" [locale]="locale()" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="City" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Cities">
                        <div rdxAutocompleteItem>Isparta</div>
                        <div rdxAutocompleteItem>İzmir</div>
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal('');
    readonly open = signal(false);
    readonly locale = signal<Intl.LocalesArgument>('tr');
}

describe('Autocomplete locale filtering', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function visibleItems(): string[] {
        // The portal relocates the list under `document.body`, so query the document, not the host.
        return Array.from(document.querySelectorAll('[rdxAutocompleteItem]'))
            .filter((el) => !(el as HTMLElement).hidden)
            .map((el) => (el as HTMLElement).textContent!.trim());
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    async function type(text: string): Promise<void> {
        inputEl().value = text;
        inputEl().dispatchEvent(new Event('input', { bubbles: true }));
        await settle();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        host.open.set(true);
        await settle();
    });

    it('applies the default filter with the Turkish collator', async () => {
        await type('i');
        // Turkish: `i` matches dotted `İ` (İzmir) but not dotless `I` (Isparta).
        expect(visibleItems()).toEqual(['İzmir']);
    });

    it('rebuilds the collator when locale changes (reactive)', async () => {
        await type('i');
        expect(visibleItems()).toEqual(['İzmir']);

        // Same query, English collation → `i` now matches both `I` and `İ`. Negative control:
        // this only changes if the default filter re-reads `locale` (a plain one-shot filter fails).
        host.locale.set('en');
        await settle();
        expect(visibleItems()).toEqual(['Isparta', 'İzmir']);
    });
});
