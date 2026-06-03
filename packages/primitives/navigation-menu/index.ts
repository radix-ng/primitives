import { RdxNavigationMenuArrow } from './src/navigation-menu-arrow';
import { RdxNavigationMenuBackdrop } from './src/navigation-menu-backdrop';
import { RdxNavigationMenuContent } from './src/navigation-menu-content';
import { RdxNavigationMenuIcon } from './src/navigation-menu-icon';
import { RdxNavigationMenuItem } from './src/navigation-menu-item';
import { RdxNavigationMenuLink } from './src/navigation-menu-link';
import { RdxNavigationMenuList } from './src/navigation-menu-list';
import { RdxNavigationMenuPopup } from './src/navigation-menu-popup';
import { RdxNavigationMenuPortal, RdxNavigationMenuPortalMisuseGuard } from './src/navigation-menu-portal';
import { RdxNavigationMenuPositioner } from './src/navigation-menu-positioner';
import { RdxNavigationMenuRoot } from './src/navigation-menu-root';
import { RdxNavigationMenuTrigger } from './src/navigation-menu-trigger';
import { RdxNavigationMenuViewport } from './src/navigation-menu-viewport';
import { NgModule } from '@angular/core';

export * from './src/navigation-menu-arrow';
export * from './src/navigation-menu-backdrop';
export * from './src/navigation-menu-content';
export * from './src/navigation-menu-icon';
export * from './src/navigation-menu-item';
export * from './src/navigation-menu-link';
export * from './src/navigation-menu-list';
export * from './src/navigation-menu-popup';
export * from './src/navigation-menu-portal';
export * from './src/navigation-menu-positioner';
export * from './src/navigation-menu-root';
export * from './src/navigation-menu-root-context';
export * from './src/navigation-menu-trigger';
export * from './src/navigation-menu-viewport';

export const navigationMenuImports = [
    RdxNavigationMenuRoot,
    RdxNavigationMenuList,
    RdxNavigationMenuItem,
    RdxNavigationMenuTrigger,
    RdxNavigationMenuIcon,
    RdxNavigationMenuContent,
    RdxNavigationMenuLink,
    RdxNavigationMenuPortal,
    RdxNavigationMenuPortalMisuseGuard,
    RdxNavigationMenuBackdrop,
    RdxNavigationMenuPositioner,
    RdxNavigationMenuPopup,
    RdxNavigationMenuArrow,
    RdxNavigationMenuViewport
];

@NgModule({
    imports: [...navigationMenuImports],
    exports: [...navigationMenuImports]
})
export class RdxNavigationMenuModule {}
