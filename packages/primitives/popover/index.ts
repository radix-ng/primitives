import { NgModule } from '@angular/core';
import { RdxPopoverAnchorDirective } from './src/popover-anchor.directive';
import { RdxPopoverArrowDirective } from './src/popover-arrow.directive';
import { RdxPopoverCloseDirective } from './src/popover-close.directive';
import { RdxPopoverContentAttributesComponent } from './src/popover-content-attributes.component';
import { RdxPopoverContentDirective } from './src/popover-content.directive';
import { RdxPopoverRootDirective } from './src/popover-root.directive';
import { RdxPopoverTriggerDirective } from './src/popover-trigger.directive';

export * from './src/popover-anchor.directive';
export * from './src/popover-arrow.directive';
export * from './src/popover-close.directive';
export * from './src/popover-content-attributes.component';
export * from './src/popover-content.directive';
export * from './src/popover-root.directive';
export * from './src/popover-trigger.directive';
export * from './src/popover.types';

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
