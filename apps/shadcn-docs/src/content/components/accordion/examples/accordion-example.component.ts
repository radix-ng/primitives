import { Component } from '@angular/core';

import { RdxAccordionRootDirective } from '@radix-ng/primitives/accordion';
import {
    ShAccordionContent,
    ShAccordionItemDirective,
    ShAccordionTrigger
} from '@radix-ng/shadcn/accordion';

@Component({
    standalone: true,
    imports: [
        RdxAccordionRootDirective,
        ShAccordionItemDirective,
        ShAccordionTrigger,
        ShAccordionContent
    ],
    templateUrl: './accordion-example.component.html'
})
export class AccordionExampleComponent {}
