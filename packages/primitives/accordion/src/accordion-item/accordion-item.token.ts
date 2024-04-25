import { inject, InjectionToken } from '@angular/core';

import type { RdxAccordionItemDirective } from './accordion-item.directive';

export const RdxAccordionItemToken = new InjectionToken<RdxAccordionItemDirective>(
    'RdxAccordionItemToken'
);

export function injectAccordionItem(): RdxAccordionItemDirective {
    return inject(RdxAccordionItemToken);
}
