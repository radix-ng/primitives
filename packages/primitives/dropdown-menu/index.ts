import { NgModule } from '@angular/core';
import { RdxDropdownMenuContentDirective } from './src/dropdown-menu-content.directive';
import { RdxDropdownMenuItemCheckboxDirective } from './src/dropdown-menu-item-checkbox.directive';
import { RdxDropdownMenuItemIndicatorDirective } from './src/dropdown-menu-item-indicator.directive';
import { RdxDropdownMenuItemRadioGroupDirective } from './src/dropdown-menu-item-radio-group.directive';
import { RdxDropdownMenuItemRadioDirective } from './src/dropdown-menu-item-radio.directive';
import { RdxDropdownMenuSelectable } from './src/dropdown-menu-item-selectable';
import { RdxDropdownMenuItemDirective } from './src/dropdown-menu-item.directive';
import { RdxDropdownMenuLabelDirective } from './src/dropdown-menu-label.directive';
import { RdxDropdownMenuSeparatorDirective } from './src/dropdown-menu-separator.directive';
import { RdxDropdownMenuTriggerDirective } from './src/dropdown-menu-trigger.directive';

export * from './src/dropdown-menu-content.directive';
export * from './src/dropdown-menu-item-checkbox.directive';
export * from './src/dropdown-menu-item-indicator.directive';
export * from './src/dropdown-menu-item-radio-group.directive';
export * from './src/dropdown-menu-item-radio.directive';
export * from './src/dropdown-menu-item-selectable';
export * from './src/dropdown-menu-item.directive';
export * from './src/dropdown-menu-label.directive';
export * from './src/dropdown-menu-separator.directive';
export * from './src/dropdown-menu-trigger.directive';

const _imports = [
    RdxDropdownMenuTriggerDirective,
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemCheckboxDirective,
    RdxDropdownMenuItemIndicatorDirective,
    RdxDropdownMenuItemRadioGroupDirective,
    RdxDropdownMenuItemRadioDirective,
    RdxDropdownMenuSelectable,
    RdxDropdownMenuItemDirective,
    RdxDropdownMenuLabelDirective,
    RdxDropdownMenuSeparatorDirective,
    RdxDropdownMenuTriggerDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class Rdx {}
