import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxFieldsetLegend } from '../src/fieldset-legend';
import { RdxFieldsetRoot } from '../src/fieldset-root';

@Component({
    template: `
        <fieldset [disabled]="disabled" rdxFieldsetRoot>
            <legend rdxFieldsetLegend>Account details</legend>
            <input name="email" />
        </fieldset>
    `,
    imports: [RdxFieldsetRoot, RdxFieldsetLegend]
})
class TestHostComponent {
    disabled = false;
}

describe('Fieldset', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let fieldset: HTMLFieldSetElement;
    let legend: HTMLLegendElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestHostComponent]
        });

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        fieldset = fixture.nativeElement.querySelector('fieldset');
        legend = fixture.nativeElement.querySelector('legend');
    });

    it('renders enabled by default', () => {
        expect(fieldset.hasAttribute('disabled')).toBe(false);
        expect(fieldset.hasAttribute('data-disabled')).toBe(false);
        expect(legend.hasAttribute('data-disabled')).toBe(false);
    });

    it('reflects disabled state on the root and legend', () => {
        fixture.componentInstance.disabled = true;
        fixture.detectChanges();

        expect(fieldset.getAttribute('disabled')).toBe('');
        expect(fieldset.getAttribute('data-disabled')).toBe('');
        expect(legend.getAttribute('data-disabled')).toBe('');
    });
});
