import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxSignalField } from '../src/signal-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormField, RdxFieldRoot, RdxSignalField],
    // The field expression is bound exactly ONCE (on `[formField]`); `rdxSignalField` reads it from there.
    template: `
        <div rdxFieldRoot>
            <input [formField]="name" rdxSignalField />
        </div>
    `
})
class SignalFieldHost {
    readonly model = signal({ name: '' });
    readonly formTree = form(this.model, (path) => {
        required(path.name);
    });

    get name() {
        return this.formTree.name;
    }
}

describe('RdxSignalField — single [formField] binding bridges Signal Forms state into Field', () => {
    let fixture: ComponentFixture<SignalFieldHost>;
    let host: SignalFieldHost;
    let root: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [SignalFieldHost] });
        fixture = TestBed.createComponent(SignalFieldHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxFieldRoot]')).nativeElement;
    });

    it('reflects the bound field invalid state (required + empty) on the Field root', () => {
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(root.getAttribute('data-valid')).toBeNull();
    });

    it('clears invalid once the field becomes valid', () => {
        host.model.update((value) => ({ ...value, name: 'Ada' }));
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(root.getAttribute('data-valid')).toBe('');
    });

    it('reflects touched on blur of the bound control', () => {
        expect(root.getAttribute('data-touched')).toBeNull();
        const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expect(root.getAttribute('data-touched')).toBe('');
    });
});
