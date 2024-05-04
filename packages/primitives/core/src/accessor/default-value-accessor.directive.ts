import { Directive, forwardRef } from '@angular/core';
import { DefaultValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DefaultValueAccessorDirective),
            multi: true
        }
    ]
})
export class DefaultValueAccessorDirective extends DefaultValueAccessor {}
