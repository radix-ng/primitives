import { WritableSignal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

export interface RdxMenuGroupContext {
    labelId: WritableSignal<string | undefined>;
}

export const [injectRdxMenuGroupContext, provideRdxMenuGroupContext] = createContext<RdxMenuGroupContext>(
    'RdxMenuGroupContext',
    'components/menu'
);
