import { inject, InjectionToken, Provider } from '@angular/core';

export type RdxDialogRole = 'dialog' | 'alertdialog';

/**
 * Behavioral profile for a dialog, supplied by a composing root (e.g. alert-dialog, drawer) to
 * specialize the shared Dialog without new public dialog inputs.
 *
 * Modality and dismissal overrides are force-only. AlertDialog pins those behaviors regardless
 * of the public inputs. Drawer leaves both configurable through its composing Root.
 *
 * The dismissal and accessibility concerns are independent so variants can mix them freely
 * (e.g. a modal, non-dismissable drawer that is still `role="dialog"`):
 * - `role` — ARIA role rendered on the popup.
 * - `forceModal` — pin modality to `true` regardless of the `modal` input.
 * - `forcePointerDismissalDisabled` — disable outside-press / focus-out dismissal (Escape still closes).
 */
export interface RdxDialogVariant {
    role: RdxDialogRole;
    forceModal: boolean;
    forcePointerDismissalDisabled: boolean;
    /** @internal Applies Drawer focus and descendant-count policies. */
    isDrawer?: boolean;
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

/** @internal A nested Root gets its behavior profile from its own host. */
export function injectRdxDialogVariant(): RdxDialogVariant {
    return inject(RDX_DIALOG_VARIANT, { optional: true, self: true }) ?? DEFAULT_VARIANT;
}
