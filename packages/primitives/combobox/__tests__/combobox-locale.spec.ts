import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsCombobox } from '../index';

/**
 * The default `contains` filter must honor the `locale` input.
 *
 * Turkish collation fixture: the lowercase query `i` matches the dotted `İ` in "İzmir" but not the
 * dotless `I` in "Isparta". Guards the root → engine wiring of `locale`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" [locale]="locale()" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="City" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Cities">
                        <div [value]="'Isparta'" rdxComboboxItem>Isparta</div>
                        <div [value]="'İzmir'" rdxComboboxItem>İzmir</div>
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly open = signal(false);
    readonly locale = signal<Intl.LocalesArgument>('tr');
}

describe('Combobox locale filtering', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    function visibleItems(): string[] {
        // The portal relocates the list under `document.body`, so query the document, not the host.
        return Array.from(document.querySelectorAll('[rdxComboboxItem]'))
            .filter((el) => !(el as HTMLElement).hidden)
            .map((el) => (el as HTMLElement).textContent!.trim());
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
        host.open.set(true);
        await settle();
    });

    it('applies the default filter with the configured locale', async () => {
        inputEl().value = 'i';
        inputEl().dispatchEvent(new Event('input', { bubbles: true }));
        await settle();

        expect(visibleItems()).toEqual(['İzmir']);
    });
});
