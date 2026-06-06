import { Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroup } from '../src/toggle-group';

@Component({
    imports: [RdxToggleGroup, RdxToggle],
    template: `
        <div
            [(value)]="value"
            [multiple]="multiple()"
            [disabled]="disabled()"
            [orientation]="orientation()"
            rdxToggleGroup
            aria-label="Text alignment"
        >
            <button rdxToggle value="left" aria-label="Left aligned">Left</button>
            <button rdxToggle value="center" aria-label="Center aligned">Center</button>
            <button rdxToggle value="right" aria-label="Right aligned">Right</button>
        </div>
    `
})
class ToggleGroupTestComponent {
    readonly value = signal<string[] | undefined>(['center']);
    readonly multiple = signal(false);
    readonly disabled = signal(false);
    readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
}

describe('RdxToggleGroup', () => {
    let fixture: ComponentFixture<ToggleGroupTestComponent>;
    let component: ToggleGroupTestComponent;
    let group: HTMLElement;
    let items: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ToggleGroupTestComponent] });
        fixture = TestBed.createComponent(ToggleGroupTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        group = fixture.debugElement.query(By.css('[rdxToggleGroup]')).nativeElement;
        items = fixture.debugElement.queryAll(By.css('button')).map((d) => d.nativeElement);
    });

    it('exposes role, orientation and pressed state', () => {
        expect(group.getAttribute('role')).toBe('group');
        expect(group.getAttribute('data-orientation')).toBe('horizontal');
        expect(items[1].getAttribute('aria-pressed')).toBe('true');
        expect(items[1].getAttribute('data-pressed')).toBe('');
        expect(items[0].getAttribute('data-pressed')).toBeNull();
    });

    it('changes the value on item click (single)', () => {
        items[0].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['left']);
        expect(items[0].getAttribute('data-pressed')).toBe('');
        expect(items[1].getAttribute('data-pressed')).toBeNull();
    });

    it('reflects programmatic value changes', () => {
        component.value.set(['right']);
        fixture.detectChanges();
        expect(items[2].getAttribute('aria-pressed')).toBe('true');
    });

    it('supports multiple selection and exposes data-multiple', () => {
        component.multiple.set(true);
        component.value.set(['center']);
        fixture.detectChanges();
        expect(group.getAttribute('data-multiple')).toBe('');

        items[0].click();
        items[2].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['center', 'left', 'right']);
    });

    it('disables the whole group', () => {
        component.disabled.set(true);
        fixture.detectChanges();
        expect(group.getAttribute('data-disabled')).toBe('');
        expect(items[0].getAttribute('data-disabled')).toBe('');

        items[0].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['center']);
    });

    it('exposes vertical orientation', () => {
        component.orientation.set('vertical');
        fixture.detectChanges();
        expect(group.getAttribute('data-orientation')).toBe('vertical');
    });
});

@Component({
    imports: [RdxToggleGroup, RdxToggle, ReactiveFormsModule],
    template: `
        <form [formGroup]="form">
            <div rdxToggleGroup formControlName="alignment" aria-label="Text alignment">
                <button rdxToggle value="left">Left</button>
                <button rdxToggle value="center">Center</button>
                <button rdxToggle value="right">Right</button>
            </div>
        </form>
    `
})
class ReactiveFormToggleGroup {
    private readonly fb = inject(FormBuilder);
    form: FormGroup = this.fb.group({ alignment: [['center']] });
}

describe('RdxToggleGroup with ReactiveFormsModule', () => {
    let fixture: ComponentFixture<ReactiveFormToggleGroup>;
    let component: ReactiveFormToggleGroup;
    let items: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ReactiveFormToggleGroup] });
        fixture = TestBed.createComponent(ReactiveFormToggleGroup);
        component = fixture.componentInstance;
        fixture.detectChanges();
        items = fixture.debugElement.queryAll(By.css('button')).map((d) => d.nativeElement);
    });

    it('initializes pressed state from the form control', () => {
        expect(items[1].getAttribute('aria-pressed')).toBe('true');
    });

    it('updates the form control value on click', () => {
        items[0].click();
        fixture.detectChanges();
        expect(component.form.value.alignment).toEqual(['left']);
    });

    it('reflects programmatic form changes and disabling', () => {
        component.form.get('alignment')?.setValue(['right']);
        fixture.detectChanges();
        expect(items[2].getAttribute('aria-pressed')).toBe('true');

        component.form.get('alignment')?.disable();
        fixture.detectChanges();
        items[0].click();
        fixture.detectChanges();
        // Disabled group ignores interaction — the value is unchanged.
        expect(component.form.getRawValue().alignment).toEqual(['right']);
    });
});
