import { Directive } from '@angular/core';
import { RdxCollapsiblePanelPresenceDirective } from '@radix-ng/primitives/collapsible';

@Directive({
    selector: 'ng-template[rdxAccordionContentPresence]',
    hostDirectives: [RdxCollapsiblePanelPresenceDirective]
})
export class RdxAccordionContentPresenceDirective {}
