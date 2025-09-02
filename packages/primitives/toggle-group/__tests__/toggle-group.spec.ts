import { Component, DebugElement, inject, Input, model } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RdxToggleGroupItemDirective } from '../src/toggle-group-item.directive';
import { RdxToggleGroupDirective } from '../src/toggle-group.directive';

@Component({
    imports: [RdxToggleGroupDirective, RdxToggleGroupItemDirective],
    template: `
        <div
            class="ToggleGroup"
            [value]="value()"
            [type]="multiple"
            (valueChange)="onValueChange($event)"
            rdxToggleGroup
            aria-label="Text alignment"
        >
            <button class="ToggleGroupItem" rdxToggleGroupItem value="left" aria-label="Left aligned">Left</button>
            <button class="ToggleGroupItem" rdxToggleGroupItem value="center" aria-label="Center aligned">
                Center
            </button>
            <button class="ToggleGroupItem" rdxToggleGroupItem value="right" aria-label="Right aligned">Right</button>
        </div>
    `
})
class ToggleGroupTestComponent {
    readonly value = model<string | string[]>('center');

    @Input() multiple: 'single' | 'multiple' = 'single';

    onValueChange(value: string | string[]): void {
        this.value.set(value);
    }
}

@Component({
    imports: [RdxToggleGroupDirective, RdxToggleGroupItemDirective, ReactiveFormsModule],
    template: `
        <form [formGroup]="formGroup">
            <div
                class="ToggleGroup"
                [type]="multiple"
                rdxToggleGroup
                formControlName="alignment"
                aria-label="Text alignment"
            >
                <button class="ToggleGroupItem" rdxToggleGroupItem value="left" aria-label="Left aligned">Left</button>
                <button class="ToggleGroupItem" rdxToggleGroupItem value="center" aria-label="Center aligned">
                    Center
                </button>
                <button class="ToggleGroupItem" rdxToggleGroupItem value="right" aria-label="Right aligned">
                    Right
                </button>
            </div>
        </form>
    `
})
class ReactiveFormToggleGroup {
    private readonly fb = inject(FormBuilder);

    formGroup: FormGroup;

    @Input() multiple: 'single' | 'multiple' = 'single';

    constructor() {
        this.formGroup = this.fb.group({
            alignment: new FormControl('center', Validators.required)
        });
    }
}

describe('RdxToggleGroupDirective', () => {
    let component: ToggleGroupTestComponent;
    let fixture: ComponentFixture<ToggleGroupTestComponent>;
    let items: DebugElement[];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ToggleGroupTestComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ToggleGroupTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        items = fixture.debugElement.queryAll(By.css('.ToggleGroupItem'));
    });

    it('should initialize with correct value', () => {
        expect(component.value()).toBe('center');

        expect(items[0].nativeElement.getAttribute('aria-pressed')).toBe('false');
        expect(items[1].nativeElement.getAttribute('aria-pressed')).toBe('true');
        expect(items[2].nativeElement.getAttribute('aria-pressed')).toBe('false');

        expect(items[0].nativeElement.getAttribute('data-state')).toBe('off');
        expect(items[1].nativeElement.getAttribute('data-state')).toBe('on');
        expect(items[2].nativeElement.getAttribute('data-state')).toBe('off');
    });

    it('should change value on item click', () => {
        items[0].nativeElement.click();
        fixture.detectChanges();

        expect(component.value()).toBe('left');

        expect(items[0].nativeElement.getAttribute('aria-pressed')).toBe('true');
        expect(items[1].nativeElement.getAttribute('aria-pressed')).toBe('false');
        expect(items[2].nativeElement.getAttribute('aria-pressed')).toBe('false');

        expect(items[0].nativeElement.getAttribute('data-state')).toBe('on');
        expect(items[1].nativeElement.getAttribute('data-state')).toBe('off');
        expect(items[2].nativeElement.getAttribute('data-state')).toBe('off');
    });

    it('should emit valueChange event', () => {
        const spy = jest.spyOn(component, 'onValueChange');

        items[2].nativeElement.click();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledWith('right');
    });

    it('should update UI when value changes programmatically', () => {
        component.value.set('right');
        fixture.detectChanges();

        expect(items[0].nativeElement.getAttribute('aria-pressed')).toBe('false');
        expect(items[1].nativeElement.getAttribute('aria-pressed')).toBe('false');
        expect(items[2].nativeElement.getAttribute('aria-pressed')).toBe('true');

        expect(items[0].nativeElement.getAttribute('data-state')).toBe('off');
        expect(items[1].nativeElement.getAttribute('data-state')).toBe('off');
        expect(items[2].nativeElement.getAttribute('data-state')).toBe('on');
    });

    it('should handle multiple selections when enabled', () => {
        component.multiple = 'multiple';
        component.value.set(['center']);
        fixture.detectChanges();

        items[0].nativeElement.click();
        items[2].nativeElement.click();
        fixture.detectChanges();

        expect(component.value()).toEqual(['center', 'left', 'right']);

        expect(items[0].nativeElement.getAttribute('data-state')).toBe('on');
        expect(items[1].nativeElement.getAttribute('data-state')).toBe('on');
        expect(items[2].nativeElement.getAttribute('data-state')).toBe('on');
    });

    it('should respect disabled state', () => {
        items[1].nativeElement.disabled = true;
        fixture.detectChanges();

        items[1].nativeElement.click();
        fixture.detectChanges();

        expect(component.value()).toBe('center');

        expect(items[1].nativeElement.getAttribute('data-disabled')).toBe(null);
    });
});

describe('RdxToggleGroupDirective with ReactiveFormsModule', () => {
    let component: ReactiveFormToggleGroup;
    let fixture: ComponentFixture<ReactiveFormToggleGroup>;
    let formGroup: FormGroup;
    let items: DebugElement[];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormToggleGroup]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReactiveFormToggleGroup);
        component = fixture.componentInstance;
        formGroup = component.formGroup;
        fixture.detectChanges();

        items = fixture.debugElement.queryAll(By.css('.ToggleGroupItem'));
    });

    it('should initialize with form control value', () => {
        expect(formGroup.value.alignment).toBe('center');

        expect(items[0].nativeElement.getAttribute('aria-pressed')).toBe('false');
        expect(items[1].nativeElement.getAttribute('aria-pressed')).toBe('true');
        expect(items[2].nativeElement.getAttribute('aria-pressed')).toBe('false');
    });

    it('should update form control value on item click', () => {
        items[0].nativeElement.click();
        fixture.detectChanges();

        expect(formGroup.value.alignment).toBe('left');

        items[2].nativeElement.click();
        fixture.detectChanges();

        expect(formGroup.value.alignment).toBe('right');
    });

    it('should reflect form control programmatic changes', () => {
        formGroup.get('alignment')?.setValue('left');
        fixture.detectChanges();

        expect(items[0].nativeElement.getAttribute('aria-pressed')).toBe('true');
        expect(items[1].nativeElement.getAttribute('aria-pressed')).toBe('false');

        formGroup.get('alignment')?.setValue('right');
        fixture.detectChanges();

        expect(items[0].nativeElement.getAttribute('aria-pressed')).toBe('false');
        expect(items[2].nativeElement.getAttribute('aria-pressed')).toBe('true');
    });

    it('should handle form control disable/enable', () => {
        formGroup.get('alignment')?.disable();
        fixture.detectChanges();

        expect(items[0].nativeElement.disabled).toBe(true);
        expect(items[1].nativeElement.disabled).toBe(true);
        expect(items[2].nativeElement.disabled).toBe(true);

        items[0].nativeElement.click();
        fixture.detectChanges();

        expect(formGroup.value.alignment).toBe('center');

        formGroup.get('alignment')?.enable();
        fixture.detectChanges();

        items[0].nativeElement.click();
        fixture.detectChanges();

        expect(formGroup.value.alignment).toBe('left');
    });

    it('should validate required form control', () => {
        expect(formGroup.valid).toBe(true);

        formGroup.get('alignment')?.reset();
        fixture.detectChanges();

        expect(formGroup.invalid).toBe(true);
        expect(formGroup.hasError('required', 'alignment')).toBe(true);

        items[1].nativeElement.click();
        fixture.detectChanges();

        expect(formGroup.valid).toBe(true);
    });

    it('should handle multiple selection with form array', () => {
        component.multiple = 'multiple';
        fixture.detectChanges();

        items[0].nativeElement.click(); // left
        items[2].nativeElement.click(); // right
        fixture.detectChanges();

        expect(formGroup.value.alignment).toEqual(['center', 'left', 'right']);

        items[1].nativeElement.click(); // center
        fixture.detectChanges();

        expect(formGroup.value.alignment).toEqual(['left', 'right']);
    });

    it('should handle form reset', () => {
        items[0].nativeElement.click();
        fixture.detectChanges();
        expect(formGroup.value.alignment).toBe('left');

        formGroup.reset();
        fixture.detectChanges();

        expect(formGroup.value.alignment).toBe(null);

        expect(items[0].nativeElement.getAttribute('aria-pressed')).toBe('false');
        expect(items[1].nativeElement.getAttribute('aria-pressed')).toBe('false');
        expect(items[2].nativeElement.getAttribute('aria-pressed')).toBe('false');
    });
});
