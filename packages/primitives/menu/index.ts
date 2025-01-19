import { NgModule } from '@angular/core';
import { RdxMenuContentDirective } from './src/menu-content.directive';
import { RdxMenuDirective } from './src/menu-directive';
import { RdxMenuGroupDirective } from './src/menu-group.directive';
import { RdxMenuItemCheckboxDirective } from './src/menu-item-checkbox.directive';
import { RdxMenuItemIndicatorDirective } from './src/menu-item-indicator.directive';
import { RdxMenuItemRadioDirective } from './src/menu-item-radio.directive';
import { RdxMenuItemDirective } from './src/menu-item.directive';
import { RdxMenuLabelDirective } from './src/menu-label.directive';
import { RdxMenuSeparatorDirective } from './src/menu-separator.directive';
import { RdxMenuTriggerDirective } from './src/menu-trigger.directive';

export * from './src/menu-content.directive';
export * from './src/menu-directive';
export * from './src/menu-group.directive';
export * from './src/menu-item-checkbox.directive';
export * from './src/menu-item-indicator.directive';
export * from './src/menu-item-radio.directive';
export * from './src/menu-item.directive';
export * from './src/menu-label.directive';
export * from './src/menu-separator.directive';
export * from './src/menu-trigger.directive';

const menuImports = [
    RdxMenuDirective,
    RdxMenuItemCheckboxDirective,
    RdxMenuItemRadioDirective,
    RdxMenuItemIndicatorDirective,
    RdxMenuTriggerDirective,
    RdxMenuGroupDirective,
    RdxMenuItemDirective,
    RdxMenuSeparatorDirective,
    RdxMenuContentDirective,
    RdxMenuLabelDirective
];

@NgModule({
    imports: [...menuImports],
    exports: [...menuImports]
})
export class MenuModule {}
