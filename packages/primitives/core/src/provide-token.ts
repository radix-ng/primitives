import { forwardRef, Provider, ProviderToken, Type } from '@angular/core';

/**
 * Creates an Angular provider that binds the given token to the existing instance
 * of the specified class. This is especially useful when you want multiple
 * tokens (or interfaces) to resolve to the same directive/component instance.
 *
 * `Type<T>` ties the class to the token's contract, so a class that does not
 * satisfy `T` is rejected at compile time instead of failing at runtime.
 *
 * @template T - The type associated with the provider token.
 * @param token - The token (InjectionToken, class, or abstract class) to provide.
 * @param type  - The class whose existing instance resolves this token; must satisfy `T`.
 * @returns A Provider configuration object for Angular's DI system.
 *
 * @example
 *
 * @Directive({
 *   providers: [
 *     provideExistingToken(RdxFooToken, RdxFooDirective),
 *     provideValueAccessor(RdxFooDirective)
 *   ]
 * })
 * export class RdxFooDirective {}
 */
export function provideExistingToken<T>(token: ProviderToken<T>, type: Type<T>): Provider {
    return {
        provide: token,
        useExisting: forwardRef(() => type)
    };
}
