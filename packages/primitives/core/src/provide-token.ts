import { forwardRef, InjectionToken, Provider, Type } from '@angular/core';

/**
 * Creates an Angular provider that binds the given token to the existing instance
 * of the specified class. This is especially useful when you want multiple
 * tokens (or interfaces) to resolve to the same directive/component instance.
 *
 * @template T - The type associated with the injection token.
 * @param token - The InjectionToken or abstract type you want to provide.
 * @param type  - The class type whose existing instance will be used for this token.
 * @returns A Provider configuration object for Angular's DI system.
 *
 * @example
 *
 * @Directive({
 *   providers: [
 *     provideToken(RdxToggleGroupToken, RdxToggleGroupDirective),
 *     provideValueAccessor(RdxToggleGroupDirective)
 *   ]
 * })
 * export class RdxToggleGroupDirective {}
 */
export function provideToken<T>(token: InjectionToken<T>, type: Type<unknown>): Provider {
    return {
        provide: token,
        useExisting: forwardRef(() => type)
    };
}
