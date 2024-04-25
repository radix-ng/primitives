import { inject, InjectionToken } from '@angular/core';

import type { RdxAccordionDirective } from './accordion.directive';

export const RdxAccordionToken = new InjectionToken<RdxAccordionDirective>('NgpAccordionToken');

export function injectAccordion(): RdxAccordionDirective {
    return inject(RdxAccordionToken);
}
