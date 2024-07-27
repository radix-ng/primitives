import { CdkAccordion } from '@angular/cdk/accordion';
import {
    contentChild,
    Directive,
    inject,
    InjectionToken,
    Input,
    input,
    signal
} from '@angular/core';

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
    selector: '[rdxAccordionItem]',
    standalone: true,
    exportAs: 'rdxAccordionItem',
    providers: [
        { provide: RdxAccordionItemToken, useExisting: RdxAccordionItemDirective, multi: true }
    ],
    host: {
        '[attr.data-state]': 'state()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-orientation]': 'orientation'
    },
    hostDirectives: [CdkAccordion]
})
export class RdxAccordionItemDirective {
    /**
     * @ignore
     */
    private accordionContent = contentChild.required(RdxAccordionContentToken);
    /**
     * Current item state
     */
    state = signal<RdxAccordionItemState>('closed');
    /**
     * When true, prevents the user from interacting with the item.
     */
    disabled = input(false);
    /**
     * @ignore
     */
    orientation: RdxAccordionOrientation = 'vertical';

    @Input() value?: string;

    /**
     * Changes current item state
     */
    setOpen(state?: RdxAccordionItemState) {
        if (this.disabled()) {
            return;
        }

        if (state === undefined) {
            this.state.update(() => (this.state() === 'open' ? 'closed' : 'open'));
        } else {
            this.state.update(() => state);
        }

        this.accordionContent().setOpen(this.state());
    }

    /**
     * @ignore
     */
    setOrientation(orientation: RdxAccordionOrientation) {
        this.orientation = orientation;

        this.accordionContent().orientation = orientation;
    }
}
