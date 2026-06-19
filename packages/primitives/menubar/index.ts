import { NgModule } from '@angular/core';
import { RdxMenubarRoot } from './src/menubar-root';

export * from './src/menubar-root';

/**
 * Menubar-specific parts. Triggers use the standard `rdxMenuTrigger` from
 * `@radix-ng/primitives/menu`; the menubar root composes them into Composite focus,
 * hover switching, and ArrowLeft / ArrowRight navigation. The menu popup, items,
 * checkbox/radio, submenu, separator, etc. also come from `RdxMenuModule`.
 */
const menubarImports = [RdxMenubarRoot];

@NgModule({
    imports: [...menubarImports],
    exports: [...menubarImports]
})
export class RdxMenubarModule {}
