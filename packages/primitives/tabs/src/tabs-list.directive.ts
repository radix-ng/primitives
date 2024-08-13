import { Directive, inject } from '@angular/core';
import { TABS_CONTEXT_TOKEN } from './tabs-context.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TabsListProps {
    // When true, keyboard navigation will loop from last tab to first, and vice versa.
    loop?: boolean;
}

@Directive({
    selector: '[rdxTabsList]',
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
