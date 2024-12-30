import { NgModule } from '@angular/core';
import { RdxTooltipAnchorDirective } from './src/hover-card-anchor.directive';
import { RdxTooltipArrowDirective } from './src/hover-card-arrow.directive';
import { RdxTooltipCloseDirective } from './src/hover-card-close.directive';
import { RdxTooltipContentAttributesComponent } from './src/hover-card-content-attributes.component';
import { RdxTooltipContentDirective } from './src/hover-card-content.directive';
import { RdxTooltipRootDirective } from './src/hover-card-root.directive';
import { RdxTooltipTriggerDirective } from './src/hover-card-trigger.directive';

export * from './src/hover-card-anchor.directive';
export * from './src/hover-card-arrow.directive';
export * from './src/hover-card-close.directive';
export * from './src/hover-card-content-attributes.component';
export * from './src/hover-card-content.directive';
export * from './src/hover-card-root.directive';
export * from './src/hover-card-trigger.directive';

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
export class RdxHoverCardModule {}
