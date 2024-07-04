import { NgModule } from '@angular/core';

import { RdxMenuBarContentDirective } from './src/menubar-content.directive';
import { RdxMenubarItemCheckboxDirective } from './src/menubar-item-checkbox.directive';
import { RdxMenubarItemIndicatorDirective } from './src/menubar-item-indicator.directive';
import { RdxMenuItemDirective } from './src/menubar-item.directive';
import { RdxMenuBarDirective } from './src/menubar-root.directive';
import { RdxMenubarSeparatorDirective } from './src/menubar-separator.directive';
import { RdxMenuBarTriggerDirective } from './src/menubar-trigger.directive';

export * from './src/menubar-content.directive';
export * from './src/menubar-item.directive';
export * from './src/menubar-item-checkbox.directive';
export * from './src/menubar-item-indicator.directive';
export * from './src/menubar-root.directive';
export * from './src/menubar-separator.directive';
export * from './src/menubar-trigger.directive';

const menubarImports = [
    RdxMenuBarContentDirective,
    RdxMenuBarTriggerDirective,
    RdxMenubarSeparatorDirective,
    RdxMenubarItemCheckboxDirective,
    RdxMenuBarDirective,
    RdxMenuItemDirective,
    RdxMenubarItemIndicatorDirective
];

@NgModule({
    imports: [...menubarImports],
    exports: [...menubarImports]
})
export class MenubarModule {}
