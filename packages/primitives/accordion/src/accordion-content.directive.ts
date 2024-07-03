import { Directive, InjectionToken } from '@angular/core';

export const RdxAccordionContentToken = new InjectionToken<RdxAccordionContentDirective>(
    'RdxAccordionContentToken'
);

@Directive({
    selector: '[AccordionContent]',
    standalone: true,
    providers: [{ provide: RdxAccordionContentToken, useExisting: RdxAccordionContentDirective }]
})
export class RdxAccordionContentDirective {}
