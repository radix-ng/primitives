import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, DebugElement, ElementRef, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RdxSwitchInputDirective } from '../src/switch-input.directive';
import { RdxSwitchRootDirective } from '../src/switch-root.directive';
import { RdxSwitchThumbDirective } from '../src/switch-thumb.directive';

xdescribe('RdxSwitchRootDirective', () => {
    let directive: RdxSwitchRootDirective;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RdxSwitchRootDirective,
                { provide: ElementRef, useValue: new ElementRef(document.createElement('button')) }
            ]
        });

        directive = TestBed.inject(RdxSwitchRootDirective);
    });

    it('should initialize with default state', () => {
        expect(directive.checked()).toBe(false);
        expect(directive.required()).toBe(false);
        expect(directive.disabled()).toBe(false);
    });

    it('should toggle checked state and emit event', () => {
        const onCheckedChangeSpy = jest.spyOn(directive.onCheckedChange, 'subscribe');
        directive.toggle();

        expect(directive.checked()).toBe(true);
        expect(onCheckedChangeSpy).toHaveBeenCalledWith(true);

        directive.toggle();

        expect(directive.checked()).toBe(false);
        expect(onCheckedChangeSpy).toHaveBeenCalledWith(false);
    });

    it('should emit correct values for controlled checked state', () => {
        const onCheckedChangeSpy = jest.spyOn(directive.onCheckedChange, 'subscribe');

        directive.checked.set(true);
        directive.toggle(); // Controlled state logic
        expect(directive.checked()).toBe(false);
        expect(onCheckedChangeSpy).toHaveBeenCalledWith(false);
    });
});

@Component({
    imports: [ReactiveFormsModule, RdxSwitchRootDirective, RdxSwitchInputDirective, RdxSwitchThumbDirective],
    template: `
        <form [formGroup]="formGroup">
            <label class="Label" htmlFor="airplane-mode-form">
                Airplane mode
                <button
                    class="SwitchRoot"
                    id="airplane-mode-form"
                    (click)="onSwitchClick()"
                    formControlName="airplaneMode"
                    rdxSwitchRoot
                >
                    <input rdxSwitchInput />
                    <span class="SwitchThumb" rdxSwitchThumb></span>
                </button>
            </label>
        </form>
    `
})
class ReactiveFormSwitch {
    private readonly fb = inject(FormBuilder);

    formGroup: FormGroup;
    clickCount = 0;

    constructor() {
        this.formGroup = this.fb.group({
            airplaneMode: new FormControl(false)
        });
    }

    onSwitchClick() {
        this.clickCount++;
    }
}

describe('RdxSwitch with ReactiveForms', () => {
    let component: ReactiveFormSwitch;
    let fixture: ComponentFixture<ReactiveFormSwitch>;
    let formGroup: FormGroup;
    let switchRoot: DebugElement;
    let switchInput: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormSwitch]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReactiveFormSwitch);
        component = fixture.componentInstance;
        formGroup = component.formGroup;
        fixture.detectChanges();

        switchRoot = fixture.debugElement.query(By.css('[rdxSwitchRoot]'));
        switchInput = fixture.debugElement.query(By.css('[rdxSwitchInput]'));
    });

    it('should initialize with form control value', () => {
        expect(formGroup.value.airplaneMode).toBe(false);
        expect(switchRoot.nativeElement.getAttribute('data-state')).toBe('unchecked');
        expect(switchInput.nativeElement.checked).toBe(false);
    });

    it('should update form control when clicked', () => {
        switchRoot.nativeElement.click();
        fixture.detectChanges();

        expect(formGroup.value.airplaneMode).toBe(true);
        expect(component.clickCount).toBe(1);

        expect(switchRoot.nativeElement.getAttribute('data-state')).toBe('checked');
    });

    it('should update UI when form control changes programmatically', () => {
        formGroup.get('airplaneMode')?.setValue(true);
        fixture.detectChanges();

        expect(switchRoot.nativeElement.getAttribute('data-state')).toBe('checked');

        formGroup.get('airplaneMode')?.setValue(false);
        fixture.detectChanges();

        expect(switchRoot.nativeElement.getAttribute('data-state')).toBe('unchecked');
    });

    it('should handle form control disable/enable', () => {
        formGroup.get('airplaneMode')?.disable();
        fixture.detectChanges();

        expect(switchInput.nativeElement.disabled).toBe(true);
        expect(switchRoot.nativeElement.getAttribute('data-disabled')).toBe('true');

        switchRoot.nativeElement.click();
        fixture.detectChanges();

        expect(formGroup.value.airplaneMode).toBe(false);

        formGroup.get('airplaneMode')?.enable();
        fixture.detectChanges();

        expect(switchInput.nativeElement.disabled).toBe(false);
        expect(switchRoot.nativeElement.getAttribute('data-disabled')).toBe(null);

        switchRoot.nativeElement.click();
        fixture.detectChanges();
        expect(formGroup.value.airplaneMode).toBe(true);
    });

    it('should properly handle label interactions', () => {
        const label = fixture.debugElement.query(By.css('.Label'));

        label.nativeElement.click();
        fixture.detectChanges();

        expect(formGroup.value.airplaneMode).toBe(true);
        expect(component.clickCount).toBe(1);
    });

    it('should reflect required form control state', () => {
        formGroup.get('airplaneMode')?.addValidators(Validators.requiredTrue);
        formGroup.get('airplaneMode')?.updateValueAndValidity();
        fixture.detectChanges();

        expect(formGroup.valid).toBe(false);

        switchRoot.nativeElement.click();
        fixture.detectChanges();

        expect(formGroup.valid).toBe(true);
    });

    it('should not toggle when disabled', () => {
        formGroup.get('airplaneMode')?.disable();
        fixture.detectChanges();

        switchRoot.nativeElement.click();
        fixture.detectChanges();

        expect(formGroup.value.airplaneMode).toBe(false);
        expect(component.clickCount).toBe(0);
    });

    it('should handle form reset', () => {
        switchRoot.nativeElement.click();
        fixture.detectChanges();
        expect(formGroup.value.airplaneMode).toBe(true);

        formGroup.reset();
        fixture.detectChanges();

        expect(formGroup.value.airplaneMode).toBe(null);
        expect(switchRoot.nativeElement.getAttribute('data-state')).toBe('unchecked');
    });
});
