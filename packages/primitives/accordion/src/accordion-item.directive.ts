import { Directive, inject, InjectionToken, Input } from '@angular/core';

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
    }
})
export class RdxAccordionItemDirective {
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
    }
}
