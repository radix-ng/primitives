import { NgModule } from '@angular/core';
import { RdxDrawerBackdrop } from './src/drawer-backdrop';
import { RdxDrawerClose } from './src/drawer-close';
import { RdxDrawerContent } from './src/drawer-content';
import { RdxDrawerDescription } from './src/drawer-description';
import { RdxDrawerIndent } from './src/drawer-indent';
import { RdxDrawerIndentBackground } from './src/drawer-indent-background';
import { RdxDrawerPopup } from './src/drawer-popup';
import { RdxDrawerPortal, RdxDrawerPortalMisuseGuard } from './src/drawer-portal';
import { RdxDrawerProviderDirective } from './src/drawer-provider';
import { RdxDrawerRoot } from './src/drawer-root';
import { RdxDrawerSwipeArea } from './src/drawer-swipe-area';
import { RdxDrawerTitle } from './src/drawer-title';
import { RdxDrawerTrigger } from './src/drawer-trigger';
import { RdxDrawerViewport } from './src/drawer-viewport';

export * from './src/drawer-backdrop';
export * from './src/drawer-close';
export * from './src/drawer-content';
export * from './src/drawer-description';
export * from './src/drawer-handle';
export * from './src/drawer-indent';
export * from './src/drawer-indent-background';
export * from './src/drawer-pointer';
export * from './src/drawer-popup';
export * from './src/drawer-portal';
export * from './src/drawer-provider';
export * from './src/drawer-root';
export * from './src/drawer-snap';
export * from './src/drawer-swipe';
export * from './src/drawer-swipe-area';
export * from './src/drawer-title';
export * from './src/drawer-trigger';
export * from './src/drawer-viewport';

export const drawerImports = [
    RdxDrawerProviderDirective,
    RdxDrawerRoot,
    RdxDrawerTrigger,
    RdxDrawerSwipeArea,
    RdxDrawerPortal,
    RdxDrawerPortalMisuseGuard,
    RdxDrawerBackdrop,
    RdxDrawerViewport,
    RdxDrawerPopup,
    RdxDrawerContent,
    RdxDrawerTitle,
    RdxDrawerDescription,
    RdxDrawerClose,
    RdxDrawerIndent,
    RdxDrawerIndentBackground
];

@NgModule({
    imports: [...drawerImports],
    exports: [...drawerImports]
})
export class RdxDrawerModule {}
