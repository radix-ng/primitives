import { NgModule } from '@angular/core';

import { RdxMenuContentDirective } from './src/menu-content.directive';
import { RdxMenuDirective } from './src/menu-directive';
import { RdxMenuGroupDirective } from './src/menu-group.directive';
import { RdxMenuItemDirective } from './src/menu-item.directive';
import { RdxMenuSeparatorDirective } from './src/menu-separator.directive';

export * from './src/menu-directive';
export * from './src/menu-group.directive';
export * from './src/menu-item.directive';
export * from './src/menu-separator.directive';
export * from './src/menu-content.directive';

const menuImports = [
    RdxMenuDirective,
    RdxMenuGroupDirective,
    RdxMenuItemDirective,
    RdxMenuSeparatorDirective,
    RdxMenuContentDirective
];

@NgModule({
    imports: [...menuImports],
    exports: [...menuImports]
})
export class MenuModule {}
