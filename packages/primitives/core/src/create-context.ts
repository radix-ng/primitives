// Thanks for idea.
// https://github.com/unovue/reka-ui/blob/v2/packages/core/src/shared/createContext.ts

import { inject, InjectionToken, Provider } from '@angular/core';

/**
 * Retrieves the context value from Angular's dependency injection.
 * Overloaded so the non-optional call returns a non-nullable `T` (no `!` needed),
 * while the optional call may return `null`.
 */
export interface InjectContext<T> {
    (): T;
    (optional: false): T;
    (optional: true): T | null;
    (optional?: boolean): T | null;
}

/**
 * Creates a context with injector and provider functions for a given type
 * @template T The type of the context value
 * @param description Descriptive string for the context (used in token creation)
 * @returns A tuple containing:
 *   - injectContext: Function to retrieve the context value
 *   - provideContext: Function to create a provider for the context
 */
export function createContext<T>(
    description: string
): readonly [injectContext: InjectContext<T>, provideContext: (useFactory: () => T) => Provider] {
    const CONTEXT_TOKEN = new InjectionToken<T>(`${description}Context`);

    /**
     * Retrieves the context value from Angular's dependency injection
     * @param optional If true, returns null when context is not provided instead of throwing
     * @returns The context value or null if optional and not provided
     * @throws Error when context is not provided and not optional
     */
    const injectContext = (optional = false): T | null => {
        // Always inject optionally so a missing context produces our own descriptive
        // error instead of Angular's generic NullInjectorError. This also catches a
        // provided factory that returns null/undefined for the non-optional case.
        const value = inject(CONTEXT_TOKEN, { optional: true });

        if (value == null && !optional) {
            throw new Error(
                `No \`${description}Context\` found. A part of the \`${description}\` primitive ` +
                    `must be used inside its root (the directive that provides \`${description}Context\`).`
            );
        }

        return value;
    };

    /**
     * Creates a provider that can be used to supply the context value
     * @param useFactory Factory function that creates the context value
     * @returns A provider that can be registered in Angular's DI system
     */
    const provideContext = (useFactory: () => T): Provider => ({
        provide: CONTEXT_TOKEN,
        useFactory: useFactory
    });

    return [injectContext as InjectContext<T>, provideContext] as const;
}
