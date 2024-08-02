import { Directive, inject } from '@angular/core';
import { TABS_CONTEXT_TOKEN } from './tabs-context.service';

interface TabsListProps {
    // When true, keyboard navigation will loop from last tab to first, and vice versa.
    loop?: boolean;
}

@Directive({
    selector: '[TabsList]',
    standalone: true,
    host: {
        role: 'tablist',
        '[attr.aria-orientation]': 'tabsContext.orientation$()',
        '[attr.data-orientation]': 'tabsContext.orientation$()'
    }
})
export class RdxTabsListDirective {
    protected readonly tabsContext = inject(TABS_CONTEXT_TOKEN);
}
