import { Signal } from '@angular/core';
import { createContext, DataOrientation } from '@radix-ng/primitives/core';

export interface RdxToolbarRootContext {
    /** The orientation of the toolbar. */
    readonly orientation: Signal<DataOrientation>;

    /** Whether the whole toolbar is disabled. */
    readonly disabled: Signal<boolean>;
}

export const [injectToolbarRootContext, provideToolbarRootContext] =
    createContext<RdxToolbarRootContext>('RdxToolbarRootContext');

export interface RdxToolbarGroupContext {
    /** Whether the group (and therefore its items) is disabled. */
    readonly disabled: Signal<boolean>;
}

export const [injectToolbarGroupContext, provideToolbarGroupContext] =
    createContext<RdxToolbarGroupContext>('RdxToolbarGroupContext');
