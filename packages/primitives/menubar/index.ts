import { NgModule } from '@angular/core';

import { RdxMenuBarContentDirective } from './src/menubar-content.directive';
import { RdxMenuItemDirective } from './src/menubar-item.directive';
import { RdxMenuBarDirective } from './src/menubar-root.directive';
import { RdxMenubarSeparatorDirective } from './src/menubar-separator.directive';
import { RdxMenuBarTriggerDirective } from './src/menubar-trigger.directive';

const menubarImports = [
    RdxMenuBarContentDirective,
    RdxMenuBarTriggerDirective,
    RdxMenubarSeparatorDirective,
    RdxMenuBarDirective,
    RdxMenuItemDirective
];

@NgModule({
    imports: [...menubarImports],
    exports: [...menubarImports]
})
export class MenubarModule {}
