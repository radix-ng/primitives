import { type DeclarationReflection } from 'typedoc';

/**
 * TypeDoc's `DeclarationReflection` with the addition of decorators.
 * (See 'plugins/typedoc-plugin-decorators.mjs').
 */
export interface DeclarationReflectionWithDecorators extends DeclarationReflection {
    decorators?: { name: string; arguments?: Record<string, string> }[];
}
