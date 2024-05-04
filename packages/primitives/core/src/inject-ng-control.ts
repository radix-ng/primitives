import { inject } from '@angular/core';
import { FormControlDirective, FormControlName, NgControl, NgModel } from '@angular/forms';

export function injectNgControl(params: {
    optional: true;
}): FormControlDirective | FormControlName | NgModel | undefined;
export function injectNgControl(params: {
    optional: false;
}): FormControlDirective | FormControlName | NgModel;
export function injectNgControl(): FormControlDirective | FormControlName | NgModel;

export function injectNgControl(params?: { optional: true } | { optional: false }) {
    const ngControl = inject(NgControl, { self: true, optional: true });

    if (!params?.optional && !ngControl) throw new Error('NgControl not found');

    if (
        ngControl instanceof FormControlDirective ||
        ngControl instanceof FormControlName ||
        ngControl instanceof NgModel
    ) {
        return ngControl;
    }

    if (params?.optional) {
        return undefined;
    }

    throw new Error(
        'NgControl is not an instance of FormControlDirective, FormControlName or NgModel'
    );
}
