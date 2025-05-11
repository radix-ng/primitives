// Thanks for idea.
// https://github.com/unovue/reka-ui/blob/v2/packages/core/src/shared/createContext.ts

import { inject, InjectionToken, Provider } from '@angular/core';

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
): readonly [injectContext: (optional?: boolean) => T | null, provideContext: (useFactory: () => T) => Provider] {
    const CONTEXT_TOKEN = new InjectionToken<T>(`${description}Context`);

    /**
     * Retrieves the context value from Angular's dependency injection
     * @param optional If true, returns null when context is not provided instead of throwing
     * @returns The context value or null if optional and not provided
     * @throws Error when context is not provided and not optional
     */
    const injectContext = (optional = false): T | null => {
        const value = optional ? inject(CONTEXT_TOKEN, { optional: true }) : inject(CONTEXT_TOKEN);

        if (value == null && !optional) {
            throw new Error(`No context provided for token ${CONTEXT_TOKEN.toString()}`);
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

    return [injectContext, provideContext] as const;
}
