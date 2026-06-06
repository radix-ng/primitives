import { createContext } from '@radix-ng/primitives/core';
import type { RdxNumberFieldRoot } from './number-field-root';

/**
 * The Number Field context exposes the root directive instance to every child part.
 * The root owns all state, parsing/formatting and value-change logic; parts read
 * signals and call methods off it.
 *
 * @see https://base-ui.com/react/components/number-field
 */
export const [injectNumberFieldRootContext, provideNumberFieldRootContext] =
    createContext<RdxNumberFieldRoot>('RdxNumberFieldRootContext');
