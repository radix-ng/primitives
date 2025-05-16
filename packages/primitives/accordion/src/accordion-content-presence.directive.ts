import { Directive } from '@angular/core';
import { RdxCollapsibleContentPresenceDirective } from '@radix-ng/primitives/collapsible';

@Directive({
    selector: 'ng-template[rdxAccordionContentPresence]',
    hostDirectives: [RdxCollapsibleContentPresenceDirective]
})
export class RdxAccordionContentPresenceDirective {}
