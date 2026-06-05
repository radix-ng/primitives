import { InjectionToken, Provider } from '@angular/core';

export type RdxDialogRole = 'dialog' | 'alertdialog';

/**
 * Behavioral profile for a dialog, supplied by a composing root (e.g. alert-dialog, drawer) to
 * specialize the shared Dialog without new public dialog inputs.
 *
 * The three concerns are kept independent on purpose so future variants can mix them freely
 * (e.g. a modal, non-dismissable drawer that is still `role="dialog"`):
 * - `role` — ARIA role rendered on the popup.
 * - `forceModal` — pin modality to `true` regardless of the `modal` input.
 * - `forcePointerDismissalDisabled` — disable outside-press / focus-out dismissal (Escape still closes).
 */
export interface RdxDialogVariant {
    role: RdxDialogRole;
    forceModal: boolean;
    forcePointerDismissalDisabled: boolean;
}

const DEFAULT_VARIANT: RdxDialogVariant = {
    role: 'dialog',
    forceModal: false,
    forcePointerDismissalDisabled: false
};

export const RDX_DIALOG_VARIANT = new InjectionToken<RdxDialogVariant>('RdxDialogVariant', {
    factory: () => DEFAULT_VARIANT
});

export function provideRdxDialogVariant(variant: Partial<RdxDialogVariant>): Provider {
    return { provide: RDX_DIALOG_VARIANT, useValue: { ...DEFAULT_VARIANT, ...variant } };
}
