import { NgModule } from '@angular/core';
import { RdxAccordionContentPresenceDirective } from './src/accordion-content-presence.directive';
import { RdxAccordionContentDirective } from './src/accordion-content.directive';
import { RdxAccordionHeaderDirective } from './src/accordion-header.directive';
import { RdxAccordionItemDirective } from './src/accordion-item.directive';
import { RdxAccordionRootDirective } from './src/accordion-root.directive';
import { RdxAccordionTriggerDirective } from './src/accordion-trigger.directive';

export * from './src/accordion-content-presence.directive';
export * from './src/accordion-content.directive';
export * from './src/accordion-header.directive';
export * from './src/accordion-item.directive';
export * from './src/accordion-root.directive';
export * from './src/accordion-trigger.directive';

const _imports = [
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective,
    RdxAccordionContentPresenceDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxAccordionModule {}
