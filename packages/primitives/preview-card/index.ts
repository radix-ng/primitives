import { NgModule } from '@angular/core';
import { RdxPreviewCardArrow } from './src/preview-card-arrow';
import { RdxPreviewCardBackdrop } from './src/preview-card-backdrop';
import { RdxPreviewCardPopup } from './src/preview-card-popup';
import { RdxPreviewCardPortal, RdxPreviewCardPortalMisuseGuard } from './src/preview-card-portal';
import { RdxPreviewCardPositioner } from './src/preview-card-positioner';
import { RdxPreviewCardRoot } from './src/preview-card-root';
import { RdxPreviewCardTrigger } from './src/preview-card-trigger';
import { RdxPreviewCardViewport } from './src/preview-card-viewport';

export * from './src/preview-card-arrow';
export * from './src/preview-card-backdrop';
export * from './src/preview-card-handle';
export * from './src/preview-card-popup';
export * from './src/preview-card-portal';
export * from './src/preview-card-positioner';
export * from './src/preview-card-root';
export * from './src/preview-card-trigger';
export * from './src/preview-card-viewport';

export const previewCardImports = [
    RdxPreviewCardRoot,
    RdxPreviewCardTrigger,
    RdxPreviewCardPortal,
    RdxPreviewCardPortalMisuseGuard,
    RdxPreviewCardBackdrop,
    RdxPreviewCardPositioner,
    RdxPreviewCardPopup,
    RdxPreviewCardArrow,
    RdxPreviewCardViewport
];

@NgModule({
    imports: [...previewCardImports],
    exports: [...previewCardImports]
})
export class RdxPreviewCardModule {}
