import { NgModule } from '@angular/core';
import { RdxContextMenuContentDirective } from './src/context-menu-content.directive';
import { RdxContextMenuItemCheckboxDirective } from './src/context-menu-item-checkbox.directive';
import { RdxContextMenuItemIndicatorDirective } from './src/context-menu-item-indicator.directive';
import { RdxContextMenuItemRadioGroupDirective } from './src/context-menu-item-radio-group.directive';
import { RdxContextMenuItemRadioDirective } from './src/context-menu-item-radio.directive';
import { RdxContextMenuSelectable } from './src/context-menu-item-selectable';
import { RdxContextMenuItemDirective } from './src/context-menu-item.directive';
import { RdxContextMenuLabelDirective } from './src/context-menu-label.directive';
import { RdxContextMenuSeparatorDirective } from './src/context-menu-separator.directive';
import { RdxContextMenuTriggerDirective } from './src/context-menu-trigger.directive';

export * from './src/context-menu-content.directive';
export * from './src/context-menu-item-checkbox.directive';
export * from './src/context-menu-item-indicator.directive';
export * from './src/context-menu-item-radio-group.directive';
export * from './src/context-menu-item-radio.directive';
export * from './src/context-menu-item-selectable';
export * from './src/context-menu-item.directive';
export * from './src/context-menu-label.directive';
export * from './src/context-menu-separator.directive';
export * from './src/context-menu-trigger.directive';

const _imports = [
    RdxContextMenuContentDirective,
    RdxContextMenuSelectable,
    RdxContextMenuItemCheckboxDirective,
    RdxContextMenuItemDirective,
    RdxContextMenuItemRadioGroupDirective,
    RdxContextMenuItemIndicatorDirective,
    RdxContextMenuItemRadioDirective,
    RdxContextMenuLabelDirective,
    RdxContextMenuSeparatorDirective,
    RdxContextMenuTriggerDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxContextMenuModule {}
