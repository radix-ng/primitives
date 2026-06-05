import { NgModule } from '@angular/core';
import { RdxDialogBackdrop } from './src/dialog-backdrop';
import { RdxDialogClose } from './src/dialog-close';
import { RdxDialogDescription } from './src/dialog-description';
import { RdxDialogPopup } from './src/dialog-popup';
import { RdxDialogPortal } from './src/dialog-portal';
import { RdxDialogPortalPresence } from './src/dialog-portal-presence';
import { RdxDialogRoot } from './src/dialog-root';
import { RdxDialogTitle } from './src/dialog-title';
import { RdxDialogTrigger } from './src/dialog-trigger';

export * from './src/dialog-backdrop';
export * from './src/dialog-close';
export * from './src/dialog-description';
export * from './src/dialog-popup';
export * from './src/dialog-portal';
export * from './src/dialog-portal-presence';
export * from './src/dialog-root';
export * from './src/dialog-title';
export * from './src/dialog-trigger';

export const dialogImports = [
    RdxDialogRoot,
    RdxDialogTrigger,
    RdxDialogPortalPresence,
    RdxDialogPortal,
    RdxDialogBackdrop,
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
