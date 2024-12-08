/**
 * This code is adapted from the original implementation by the ngxTension team.
 * Source: https://github.com/ngxtension/ngxtension-platform/blob/main/libs/ngxtension/assert-injector/src/assert-injector.ts
 *
 * Copyright (c) ngxtension Authors. Licensed under the MIT License.
 */
import { assertInInjectionContext, inject, Injector, runInInjectionContext } from '@angular/core';
import { Nullable, SafeFunction } from '../types';

/**
 * `assertInjector` extends `assertInInjectionContext` with an optional `Injector`
 * After assertion, `assertInjector` runs the `runner` function with the guaranteed `Injector`
 * whether it is the default `Injector` within the current **Injection Context**
 * or the custom `Injector` that was passed in.
 *
 * @template {() => unknown} Runner - Runner is a function that can return anything
 * @param {SafeFunction} fn - the Function to pass in `assertInInjectionContext`
 * @param {Nullable<Injector>} injector - the optional "custom" Injector
 * @param {Runner} runner - the runner fn
 * @returns {ReturnType<Runner>} result - returns the result of the Runner
 *
 * @example
 * ```ts
 * function injectValue(injector?: Injector) {
 *  return assertInjector(injectValue, injector, () => 'value');
 * }
 *
 * injectValue(); // string
 * ```
 */
export function assertInjector<Runner extends () => unknown>(
    fn: SafeFunction,
    injector: Nullable<Injector>,
    runner: Runner
): ReturnType<Runner>;
/**
 * `assertInjector` extends `assertInInjectionContext` with an optional `Injector`
 * After assertion, `assertInjector` returns a guaranteed `Injector` whether it is the default `Injector`
 * within the current **Injection Context** or the custom `Injector` that was passed in.
 *
 * @param {SafeFunction} fn - the Function to pass in `assertInInjectionContext`
 * @param {Nullable<Injector>} injector - the optional "custom" Injector
 * @returns Injector
 *
 * @example
 * ```ts
 * function injectDestroy(injector?: Injector) {
 *  injector = assertInjector(injectDestroy, injector);
 *
 *  return runInInjectionContext(injector, () => {
 *    // code
 *  })
 * }
 * ```
 */
export function assertInjector(fn: SafeFunction, injector: Nullable<Injector>): Injector;
export function assertInjector<Runner extends () => unknown>(
    fn: SafeFunction,
    injector: Nullable<Injector>,
    runner?: () => unknown
): Injector | ReturnType<Runner> {
    !injector && assertInInjectionContext(fn);

    const assertedInjector = injector ?? inject(Injector);

    if (!runner) return assertedInjector;

    return runInInjectionContext(assertedInjector, runner) as ReturnType<Runner>;
}
