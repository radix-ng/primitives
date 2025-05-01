import { forwardRef, Provider, Type } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Include in the providers section of a component which utilizes ControlValueAccessor to redundant code.
 *
 * ```ts
 * @Directive({
 *   providers: [provideValueAccessor(ExampleDirective)]
 *}
 * export class ExampleDirective{}
 * ```
 */
export function provideValueAccessor<T>(type: Type<T>): Provider {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => type),
        multi: true
    };
}
