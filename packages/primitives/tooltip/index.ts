import { NgModule } from '@angular/core';
import { RdxTooltipArrowDirective } from './src/tooltip-arrow.directive';
import { RdxTooltipContentAttributesDirective } from './src/tooltip-content-attributes.directive';
import { RdxTooltipContentDirective } from './src/tooltip-content.directive';
import { RdxTooltipRootDirective } from './src/tooltip-root.directive';
import { RdxTooltipTriggerDirective } from './src/tooltip-trigger.directive';

export * from './src/tooltip-arrow.directive';
export * from './src/tooltip-content-attributes.directive';
export * from './src/tooltip-content.directive';
export * from './src/tooltip-root.directive';
export * from './src/tooltip-trigger.directive';
export * from './src/tooltip.types';

const directives = [
    RdxTooltipArrowDirective,
    RdxTooltipContentDirective,
    RdxTooltipTriggerDirective,
    RdxTooltipContentAttributesDirective,
    RdxTooltipRootDirective
];

@NgModule({
    imports: [...directives],
    exports: [...directives]
})
export class RdxTooltipModule {}
