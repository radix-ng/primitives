import { CDK_ACCORDION, CdkAccordion, CdkAccordionItem } from '@angular/cdk/accordion';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { ChangeDetectorRef, Directive, Inject, InjectionToken } from '@angular/core';

export const RdxCdkAccordionItemToken = new InjectionToken<RdxCdkAccordionItem>(
    'RdxCdkAccordionItemToken'
);

@Directive({ standalone: true })
export class RdxCdkAccordionItem extends CdkAccordionItem {
    constructor(
        @Inject(CDK_ACCORDION) cdkAccordion: CdkAccordion,
        changeDetectorRef: ChangeDetectorRef,
        uniqueSelectionDispatcher: UniqueSelectionDispatcher
    ) {
        super(cdkAccordion, changeDetectorRef, uniqueSelectionDispatcher);
    }
}
