import { RdxDialogBackdrop } from './src/dialog-backdrop';
import { RdxDialogClose } from './src/dialog-close';
import { RdxDialogDescription } from './src/dialog-description';
import { RdxDialogPopup } from './src/dialog-popup';
import { RdxDialogPortal, RdxDialogPortalMisuseGuard } from './src/dialog-portal';
import { RdxDialogRoot } from './src/dialog-root';
import { RdxDialogTitle } from './src/dialog-title';
import { RdxDialogTrigger } from './src/dialog-trigger';
import { RdxDialogViewport } from './src/dialog-viewport';
import { NgModule } from '@angular/core';

export * from './src/dialog-backdrop';
export * from './src/dialog-close';
export * from './src/dialog-description';
export * from './src/dialog-handle';
export * from './src/dialog-popup';
export * from './src/dialog-portal';
export * from './src/dialog-root';
export * from './src/dialog-title';
export * from './src/dialog-trigger';
export * from './src/dialog-variant';
export * from './src/dialog-viewport';

export const dialogImports = [
    RdxDialogRoot,
    RdxDialogTrigger,
    RdxDialogPortal,
    RdxDialogPortalMisuseGuard,
    RdxDialogBackdrop,
    RdxDialogViewport,
    RdxDialogPopup,
    RdxDialogTitle,
    RdxDialogDescription,
    RdxDialogClose
];

@NgModule({
    imports: [...dialogImports],
    exports: [...dialogImports]
})
export class RdxDialogModule {}
