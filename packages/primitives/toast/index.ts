import { RdxToastAction } from './src/toast-action';
import { RdxToastClose } from './src/toast-close';
import { RdxToastContent } from './src/toast-content';
import { RdxToastDescription } from './src/toast-description';
import { RdxToastPortal } from './src/toast-portal';
import { RdxToastPositioner } from './src/toast-positioner';
import { RdxToastProvider } from './src/toast-provider';
import { RdxToastRoot } from './src/toast-root';
import { RdxToastTitle } from './src/toast-title';
import { RdxToastViewport } from './src/toast-viewport';
import { NgModule } from '@angular/core';

export * from './src/toast.types';
export * from './src/toast-action';
export * from './src/toast-close';
export * from './src/toast-content';
export * from './src/toast-description';
export * from './src/toast-portal';
export * from './src/toast-positioner';
export * from './src/toast-provider';
export * from './src/toast-root';
export * from './src/toast-swipe';
export * from './src/toast-title';
export * from './src/toast-viewport';

export const toastImports = [
    RdxToastProvider,
    RdxToastPortal,
    RdxToastViewport,
    RdxToastPositioner,
    RdxToastRoot,
    RdxToastContent,
    RdxToastTitle,
    RdxToastDescription,
    RdxToastClose,
    RdxToastAction
];

@NgModule({
    imports: [...toastImports],
    exports: [...toastImports]
})
export class RdxToastModule {}
