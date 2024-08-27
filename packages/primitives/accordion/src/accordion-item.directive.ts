import { CDK_ACCORDION, CdkAccordion, CdkAccordionItem } from '@angular/cdk/accordion';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { ChangeDetectorRef, Directive, Inject, inject, InjectionToken, Input, Optional, SkipSelf } from '@angular/core';
import { RdxAccordionOrientation } from './accordion-root.directive';

export type RdxAccordionItemState = 'open' | 'closed';

export const RdxAccordionItemToken = new InjectionToken<RdxAccordionItemDirective>('RdxAccordionItemToken');

export function injectAccordionItem(): RdxAccordionItemDirective {
    return inject(RdxAccordionItemDirective);
}

@Directive({
    selector: '[rdxAccordionItem]',
    standalone: true,
    exportAs: 'rdxAccordionItem',
    host: {
        '[attr.data-state]': 'getState()',
        '[attr.data-disabled]': 'disabled ?? ""',
        '[attr.data-orientation]': 'orientation'
    },
    providers: [
        {
            provide: CdkAccordionItem,
            useExisting: RdxAccordionItemDirective,
            multi: true
        }
    ]
})
export class RdxAccordionItemDirective extends CdkAccordionItem {
    public orientation: RdxAccordionOrientation = 'vertical';

    @Input() value?: string;

    constructor(
        @Optional() @Inject(CDK_ACCORDION) @SkipSelf() override accordion: CdkAccordion,
        changeDetectorRef: ChangeDetectorRef,
        expansionDispatcher: UniqueSelectionDispatcher
    ) {
        super(accordion, changeDetectorRef, expansionDispatcher);
    }

    /**
     * @ignore
     */
    setOrientation(orientation: RdxAccordionOrientation) {
        this.orientation = orientation;
    }

    getState(): RdxAccordionItemState {
        return this.expanded ? 'open' : 'closed';
    }
}
