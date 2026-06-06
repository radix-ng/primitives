import { createContext } from '@radix-ng/primitives/core';
import type { RdxSliderRoot } from './slider-root';

/**
 * The Slider context exposes the root directive instance to every child part.
 * The root owns all state, value-change logic and thumb registration; parts read
 * signals and call methods off it.
 *
 * @see https://base-ui.com/react/components/slider
 */
export const [injectSliderRootContext, provideSliderRootContext] = createContext<RdxSliderRoot>('RdxSliderRootContext');
