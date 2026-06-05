import { createRdxDialogHandle, RdxDialogHandle } from '@radix-ng/primitives/dialog';

/**
 * Connects a drawer root with trigger elements rendered elsewhere in the DOM.
 *
 * Drawers reuse the dialog handle implementation unchanged.
 */
export const RdxDrawerHandle = RdxDialogHandle;
export type RdxDrawerHandle<Payload = unknown> = RdxDialogHandle<Payload>;

export function createRdxDrawerHandle<Payload = unknown>(): RdxDrawerHandle<Payload> {
    return createRdxDialogHandle<Payload>();
}
