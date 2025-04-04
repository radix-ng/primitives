// ./index.ts
import { NgModule } from '@angular/core';
import {
    RdxNavigationMenuAriaOwnsComponent,
    RdxNavigationMenuFocusProxyComponent
} from './src/navigation-menu-a11y.component';
import { RdxNavigationMenuContentDirective } from './src/navigation-menu-content.directive';
import { RdxNavigationMenuIndicatorDirective } from './src/navigation-menu-indicator.directive';
import { RdxNavigationMenuItemDirective } from './src/navigation-menu-item.directive';
import { RdxNavigationMenuLinkDirective } from './src/navigation-menu-link.directive';
import { RdxNavigationMenuListDirective } from './src/navigation-menu-list.directive';
import { RdxNavigationMenuSubDirective } from './src/navigation-menu-sub.directive';
import { RdxNavigationMenuTriggerDirective } from './src/navigation-menu-trigger.directive';
import { RdxNavigationMenuViewportDirective } from './src/navigation-menu-viewport.directive';
import { RdxNavigationMenuDirective } from './src/navigation-menu.directive';

export * from './src/navigation-menu-a11y.component';
export * from './src/navigation-menu-content.directive';
export * from './src/navigation-menu-indicator.directive';
export * from './src/navigation-menu-item.directive';
export * from './src/navigation-menu-link.directive';
export * from './src/navigation-menu-list.directive';
export * from './src/navigation-menu-sub.directive';
export * from './src/navigation-menu-trigger.directive';
export * from './src/navigation-menu-viewport.directive';
export * from './src/navigation-menu.directive';
export * from './src/navigation-menu.token';
export * from './src/navigation-menu.types';

const _imports = [
    RdxNavigationMenuDirective,
    RdxNavigationMenuSubDirective,
    RdxNavigationMenuListDirective,
    RdxNavigationMenuItemDirective,
    RdxNavigationMenuTriggerDirective,
    RdxNavigationMenuLinkDirective,
    RdxNavigationMenuIndicatorDirective,
    RdxNavigationMenuContentDirective,
    RdxNavigationMenuViewportDirective,
    RdxNavigationMenuFocusProxyComponent,
    RdxNavigationMenuAriaOwnsComponent
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxNavigationMenuModule {}
