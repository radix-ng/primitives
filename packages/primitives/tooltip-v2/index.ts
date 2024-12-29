import { NgModule } from '@angular/core';
import { RdxPopoverAnchorDirective } from './src/tooltip-anchor.directive';
import { RdxPopoverArrowDirective } from './src/tooltip-arrow.directive';
import { RdxPopoverCloseDirective } from './src/tooltip-close.directive';
import { RdxPopoverContentAttributesComponent } from './src/tooltip-content-attributes.component';
import { RdxPopoverContentDirective } from './src/tooltip-content.directive';
import { RdxPopoverRootDirective } from './src/tooltip-root.directive';
import { RdxPopoverTriggerDirective } from './src/tooltip-trigger.directive';

export * from './src/tooltip-anchor.directive';
export * from './src/tooltip-arrow.directive';
export * from './src/tooltip-close.directive';
export * from './src/tooltip-content-attributes.component';
export * from './src/tooltip-content.directive';
export * from './src/tooltip-root.directive';
export * from './src/tooltip-trigger.directive';

const _imports = [
    RdxPopoverArrowDirective,
    RdxPopoverCloseDirective,
    RdxPopoverContentDirective,
    RdxPopoverTriggerDirective,
    RdxPopoverRootDirective,
    RdxPopoverAnchorDirective,
    RdxPopoverContentAttributesComponent
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxPopoverModule {}
