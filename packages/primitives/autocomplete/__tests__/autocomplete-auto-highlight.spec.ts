import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsAutocomplete } from '../index';
import { RdxAutocompleteRoot } from '../src/autocomplete-root';

// Bare `autoHighlight` attribute (no value) — the common authoring form. Must coerce to `true`.
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" autoHighlight rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Tag" />
            <div *rdxAutocompletePortal rdxAutocompletePositioner>
                <div rdxAutocompletePopup>
                    <div rdxAutocompleteList aria-label="Tags">
                        @for (tag of tags; track tag) {
                            <div rdxAutocompleteItem>{{ tag }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal('');
    readonly tags = ['feature', 'fix', 'bug', 'docs'];
}

describe('Autocomplete autoHighlight (bare attribute)', () => {
    let fixture: ComponentFixture<HostComponent>;

    function root(): RdxAutocompleteRoot {
        return fixture.debugElement.query(By.directive(RdxAutocompleteRoot)).injector.get(RdxAutocompleteRoot);
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
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

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        await settle();
    });

    it('coerces the bare attribute to enable auto-highlight', () => {
        expect(root().autoHighlightMode()).toBe('input-change');
    });

    it('highlights the matching item as you type a full match, ready for Enter', async () => {
        type('fix');
        await settle();
        expect(root().highlightedItem()?.textValue()).toBe('fix');

        inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await settle();
        expect(root().value()).toBe('fix');
        expect(root().open()).toBe(false);
    });
});
