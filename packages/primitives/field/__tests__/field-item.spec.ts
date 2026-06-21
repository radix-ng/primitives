import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldItem } from '../src/field-item';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxFieldRoot, RdxFieldItem, RdxFieldLabel, RdxFieldControl, RdxFieldDescription],
    template: `
        <div [invalid]="invalid()" [disabled]="rootDisabled()" rdxFieldRoot>
            <div [disabled]="itemADisabled()" rdxFieldItem>
                <label rdxFieldLabel>Option A</label>
                <input id="ctrl-a" rdxFieldControl />
                <p rdxFieldDescription>A description</p>
            </div>
            <div rdxFieldItem>
                <label rdxFieldLabel>Option B</label>
                <input id="ctrl-b" rdxFieldControl />
            </div>
        </div>
    `
})
class FieldItemHost {
    readonly invalid = signal(false);
    readonly rootDisabled = signal(false);
    readonly itemADisabled = signal(false);
}

describe('RdxFieldItem', () => {
    let fixture: ComponentFixture<FieldItemHost>;
    let host: FieldItemHost;
    let items: HTMLElement[];
    let labels: HTMLLabelElement[];
    let controlA: HTMLInputElement;
    let controlB: HTMLInputElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [FieldItemHost] });
        fixture = TestBed.createComponent(FieldItemHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        items = fixture.debugElement.queryAll(By.css('[rdxFieldItem]')).map((d) => d.nativeElement);
        labels = fixture.debugElement.queryAll(By.css('[rdxFieldLabel]')).map((d) => d.nativeElement);
        controlA = fixture.debugElement.query(By.css('#ctrl-a')).nativeElement;
        controlB = fixture.debugElement.query(By.css('#ctrl-b')).nativeElement;
    });

    it('scopes label/control association per item (each label points at its own control)', () => {
        expect(labels[0].getAttribute('for')).toBe('ctrl-a');
        expect(labels[1].getAttribute('for')).toBe('ctrl-b');
        expect(labels[0].getAttribute('for')).not.toBe(labels[1].getAttribute('for'));
    });

    it('scopes aria-describedby to the item (item A has a description, item B does not)', () => {
        const description = fixture.debugElement.query(By.css('[rdxFieldDescription]')).nativeElement as HTMLElement;
        expect(controlA.getAttribute('aria-describedby')).toContain(description.id);
        expect(controlB.getAttribute('aria-describedby')).toBeNull();
    });

    it('reflects the field validation state on every item (delegated from the root)', () => {
        expect(items[0].getAttribute('data-valid')).toBe('');
        expect(items[0].getAttribute('data-invalid')).toBeNull();

        host.invalid.set(true);
        fixture.detectChanges();
        expect(items[0].getAttribute('data-invalid')).toBe('');
        expect(items[1].getAttribute('data-invalid')).toBe('');
    });

    it('ORs the item disabled with the root, and the root takes precedence', () => {
        // item-level disabled affects only that item
        host.itemADisabled.set(true);
        fixture.detectChanges();
        expect(items[0].getAttribute('data-disabled')).toBe('');
        expect(items[1].getAttribute('data-disabled')).toBeNull();
        expect(controlA.hasAttribute('disabled')).toBe(true);

        // root disabled cascades to every item
        host.itemADisabled.set(false);
        host.rootDisabled.set(true);
        fixture.detectChanges();
        expect(items[0].getAttribute('data-disabled')).toBe('');
        expect(items[1].getAttribute('data-disabled')).toBe('');
    });
});
