import { NgModule } from '@angular/core';
import { RdxContextMenuRoot } from './src/context-menu-root';
import { RdxContextMenuTrigger } from './src/context-menu-trigger';

export * from './src/context-menu-root';
export * from './src/context-menu-trigger';

/**
 * Context-menu-specific parts. The popup, items, checkbox/radio, submenus, separators, etc. come
 * from `@radix-ng/primitives/menu` (`RdxMenuModule`) and behave identically inside a context menu.
 */
const contextMenuImports = [RdxContextMenuRoot, RdxContextMenuTrigger];

@NgModule({
    imports: [...contextMenuImports],
    exports: [...contextMenuImports]
})
export class RdxContextMenuModule {}
