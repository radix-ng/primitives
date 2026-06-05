import { createRdxDialogHandle, RdxDialogHandle } from '@radix-ng/primitives/dialog';

/**
 * Connects an alert dialog root with trigger elements rendered elsewhere in the DOM.
 *
 * Alert dialogs reuse the dialog handle implementation unchanged.
 */
export const RdxAlertDialogHandle = RdxDialogHandle;
export type RdxAlertDialogHandle<Payload = unknown> = RdxDialogHandle<Payload>;

export function createRdxAlertDialogHandle<Payload = unknown>(): RdxAlertDialogHandle<Payload> {
    return createRdxDialogHandle<Payload>();
}
