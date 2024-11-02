import { NgModule } from '@angular/core';
import { RdxSelectContentDirective } from './src/select-content.directive';
import { RdxSelectGroupDirective } from './src/select-group.directive';
import { RdxSelectItemIndicatorDirective } from './src/select-item-indicator.directive';
import { RdxSelectItemDirective } from './src/select-item.directive';
import { RdxSelectLabelDirective } from './src/select-label.directive';
import { RdxSelectRootComponent } from './src/select-root.component';
import { RdxSelectSeparatorDirective } from './src/select-separator.directive';
import { RdxSelectTriggerDirective } from './src/select-trigger.directive';

export * from './src/select-content.directive';
export * from './src/select-group.directive';
export * from './src/select-item-indicator.directive';
export * from './src/select-item.directive';
export * from './src/select-label.directive';
export * from './src/select-root.component';
export * from './src/select-separator.directive';
export * from './src/select-trigger.directive';

const _imports = [
    RdxSelectContentDirective,
    RdxSelectGroupDirective,
    RdxSelectItemDirective,
    RdxSelectItemIndicatorDirective,
    RdxSelectLabelDirective,
    RdxSelectRootComponent,
    RdxSelectSeparatorDirective,
    RdxSelectTriggerDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxSelectModule {}
