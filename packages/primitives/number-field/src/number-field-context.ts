import type { RdxNumberFieldRoot } from './number-field-root';
import { createContext } from '@radix-ng/primitives/core';

/**
 * The Number Field context exposes the root directive instance to every child part.
 * The root owns all state, parsing/formatting and value-change logic; parts read
 * signals and call methods off it.
 *
 * @see https://base-ui.com/react/components/number-field
 */
export const [injectNumberFieldRootContext, provideNumberFieldRootContext] = createContext<RdxNumberFieldRoot>(
    'RdxNumberFieldRootContext',
    'components/number-field'
);
