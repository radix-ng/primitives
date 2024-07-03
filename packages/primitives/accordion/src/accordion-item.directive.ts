import { CdkAccordion } from '@angular/cdk/accordion';
import { contentChild, Directive, inject, InjectionToken, Input } from '@angular/core';

import { RdxAccordionContentToken } from './accordion-content.directive';
import { RdxAccordionOrientation } from './accordion-root.directive';

export type RdxAccordionItemState = 'open' | 'closed';

export const RdxAccordionItemToken = new InjectionToken<RdxAccordionItemDirective>(
    'RdxAccordionItemToken'
);

export function injectAccordionItem(): RdxAccordionItemDirective {
    return inject(RdxAccordionItemDirective);
}

@Directive({
    selector: '[AccordionItem]',
    standalone: true,
    exportAs: 'AccordionItem',
    providers: [
        { provide: RdxAccordionItemToken, useExisting: RdxAccordionItemDirective, multi: true }
    ],
    host: {
        '[attr.data-state]': 'state',
        '[attr.data-disabled]': 'disabled ?? undefined',
        '[attr.data-orientation]': 'orientation'
    },
    hostDirectives: [CdkAccordion]
})
export class RdxAccordionItemDirective {
    private rdxContent = contentChild(RdxAccordionContentToken);
    state: RdxAccordionItemState = 'closed';
    orientation: RdxAccordionOrientation = 'vertical';
    @Input() disabled = false;

    setOpen(state?: RdxAccordionItemState) {
        if (this.disabled) {
            return;
        }

        if (state === undefined) {
            this.state = this.state === 'open' ? 'closed' : 'open';
        } else {
            this.state = state;
        }

        this.rdxContent()?.setOpen(this.state);
    }
}
