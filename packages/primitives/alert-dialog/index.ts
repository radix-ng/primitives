import { NgModule } from '@angular/core';
import { RdxAlertDialogBackdrop } from './src/alert-dialog-backdrop';
import { RdxAlertDialogClose } from './src/alert-dialog-close';
import { RdxAlertDialogDescription } from './src/alert-dialog-description';
import { RdxAlertDialogPopup } from './src/alert-dialog-popup';
import { RdxAlertDialogPortal, RdxAlertDialogPortalMisuseGuard } from './src/alert-dialog-portal';
import { RdxAlertDialogRoot } from './src/alert-dialog-root';
import { RdxAlertDialogTitle } from './src/alert-dialog-title';
import { RdxAlertDialogTrigger } from './src/alert-dialog-trigger';
import { RdxAlertDialogViewport } from './src/alert-dialog-viewport';

export * from './src/alert-dialog-backdrop';
export * from './src/alert-dialog-close';
export * from './src/alert-dialog-description';
export * from './src/alert-dialog-handle';
export * from './src/alert-dialog-popup';
export * from './src/alert-dialog-portal';
export * from './src/alert-dialog-root';
export * from './src/alert-dialog-title';
export * from './src/alert-dialog-trigger';
export * from './src/alert-dialog-viewport';

export const alertDialogImports = [
    RdxAlertDialogRoot,
    RdxAlertDialogTrigger,
    RdxAlertDialogPortal,
    RdxAlertDialogPortalMisuseGuard,
    RdxAlertDialogBackdrop,
    RdxAlertDialogViewport,
    RdxAlertDialogPopup,
    RdxAlertDialogTitle,
    RdxAlertDialogDescription,
    RdxAlertDialogClose
];

@NgModule({
    imports: [...alertDialogImports],
    exports: [...alertDialogImports]
})
export class RdxAlertDialogModule {}
