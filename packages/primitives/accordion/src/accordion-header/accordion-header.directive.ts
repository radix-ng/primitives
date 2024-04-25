import { Directive } from '@angular/core';

import { RdxAccordionStateDirective } from '../accordion-state.directive';

@Directive({
    selector: '[rdxAccordionHeader]',
    standalone: true,
    hostDirectives: [RdxAccordionStateDirective]
})
export class RdxAccordionHeaderDirective {}
