/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any */
import { Directive } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

@Directive({
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: NoopValueAccessorDirective,
            multi: true
        }
    ]
})
export class NoopValueAccessorDirective implements ControlValueAccessor {
    writeValue(obj: any): void {
        /* NOOP */
    }
    registerOnChange(fn: any): void {
        /* NOOP */
    }
    registerOnTouched(fn: any): void {
        /* NOOP */
    }
}
