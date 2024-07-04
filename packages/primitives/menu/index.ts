import { NgModule } from '@angular/core';

import { RdxMenuDirective } from './src/menu-directive';
import { RdxMenuGroupDirective } from './src/menu-group.directive';
import { RdxMenuItemDirective } from './src/menu-item.directive';
import { RdxMenuSeparatorDirective } from './src/menu-separator.directive';

export * from './src/menu-directive';
export * from './src/menu-group.directive';
export * from './src/menu-item.directive';
export * from './src/menu-separator.directive';

const menuImports = [
    RdxMenuDirective,
    RdxMenuGroupDirective,
    RdxMenuItemDirective,
    RdxMenuSeparatorDirective
];

@NgModule({
    imports: [...menuImports],
    exports: [...menuImports]
})
export class MenuModule {}
