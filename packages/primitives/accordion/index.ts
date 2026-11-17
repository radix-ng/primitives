import { NgModule } from '@angular/core';
import { RdxAccordionHeaderDirective } from './src/accordion-header.directive';
import { RdxAccordionItemDirective } from './src/accordion-item.directive';
import { RdxAccordionPanelPresenceDirective } from './src/accordion-panel-presence.directive';
import { RdxAccordionPanelDirective } from './src/accordion-panel.directive';
import { RdxAccordionRootDirective } from './src/accordion-root.directive';
import { RdxAccordionTriggerDirective } from './src/accordion-trigger.directive';

export * from './src/accordion-header.directive';
export * from './src/accordion-item.directive';
export * from './src/accordion-panel-presence.directive';
export * from './src/accordion-panel.directive';
export * from './src/accordion-root.directive';
export * from './src/accordion-trigger.directive';

const _imports = [
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxAccordionModule {}
