import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxThemeSwitchComponent } from '../src/switch';

@Component({
    selector: 'theme-switch-forms',
    standalone: true,
    imports: [ReactiveFormsModule, NgIf, RdxThemeSwitchComponent],
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div *ngIf="first.invalid">Name is too short.</div>
            <input formControlName="first" placeholder="First name" />
            <input formControlName="last" placeholder="Last name" />
            <label for="policy-form">Policy</label>
            <rdx-theme-switch id="policy-form" formControlName="policy" />

            <button type="submit">Submit</button>
        </form>
        <button (click)="setValue()">Set preset value</button>
    `
})
export class ThemeSwitchFormsComponent {
    form = new FormGroup({
        first: new FormControl('Nancy', Validators.minLength(2)),
        last: new FormControl('Drew'),
        policy: new FormControl<boolean>(false)
    });
    get first(): any {
        return this.form.get('first');
    }
    onSubmit(): void {
        console.log(this.form.value); // {first: 'Nancy', last: 'Drew'}
    }
    setValue() {
        this.form.setValue({ first: 'Carson', last: 'Drew', policy: false });
    }
}
