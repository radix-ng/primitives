import { NgModule } from '@angular/core';
import { RdxTooltipAnchorDirective } from './src/tooltip-anchor.directive';
import { RdxTooltipArrowDirective } from './src/tooltip-arrow.directive';
import { RdxTooltipCloseDirective } from './src/tooltip-close.directive';
import { RdxTooltipContentAttributesComponent } from './src/tooltip-content-attributes.component';
import { RdxTooltipContentDirective } from './src/tooltip-content.directive';
import { RdxTooltipRootDirective } from './src/tooltip-root.directive';
import { RdxTooltipTriggerDirective } from './src/tooltip-trigger.directive';

export * from './src/tooltip-anchor.directive';
export * from './src/tooltip-arrow.directive';
export * from './src/tooltip-close.directive';
export * from './src/tooltip-content-attributes.component';
export * from './src/tooltip-content.directive';
export * from './src/tooltip-root.directive';
export * from './src/tooltip-trigger.directive';

const _imports = [
    RdxTooltipArrowDirective,
    RdxTooltipCloseDirective,
    RdxTooltipContentDirective,
    RdxTooltipTriggerDirective,
    RdxTooltipRootDirective,
    RdxTooltipAnchorDirective,
    RdxTooltipContentAttributesComponent
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxTooltipModule {}
