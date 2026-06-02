import { NgModule } from '@angular/core';
import { RdxPopoverArrow } from './src/popover-arrow';
import { RdxPopoverBackdrop } from './src/popover-backdrop';
import { RdxPopoverClose } from './src/popover-close';
import { RdxPopoverDescription } from './src/popover-description';
import { RdxPopoverPopup } from './src/popover-popup';
import { RdxPopoverPortal } from './src/popover-portal';
import { RdxPopoverPortalPresence } from './src/popover-portal-presence';
import { RdxPopoverPositioner } from './src/popover-positioner';
import { RdxPopoverRoot } from './src/popover-root';
import { RdxPopoverTitle } from './src/popover-title';
import { RdxPopoverTrigger } from './src/popover-trigger';

export * from './src/popover-arrow';
export * from './src/popover-backdrop';
export * from './src/popover-close';
export * from './src/popover-description';
export * from './src/popover-handle';
export * from './src/popover-popup';
export * from './src/popover-portal';
export * from './src/popover-portal-presence';
export * from './src/popover-positioner';
export * from './src/popover-root';
export * from './src/popover-title';
export * from './src/popover-trigger';

export const popoverImports = [
    RdxPopoverRoot,
    RdxPopoverTrigger,
    RdxPopoverPortalPresence,
    RdxPopoverPortal,
    RdxPopoverBackdrop,
    RdxPopoverPositioner,
    RdxPopoverPopup,
    RdxPopoverArrow,
    RdxPopoverTitle,
    RdxPopoverDescription,
    RdxPopoverClose
];

@NgModule({
    imports: [...popoverImports],
    exports: [...popoverImports]
})
export class RdxPopoverModule {}
