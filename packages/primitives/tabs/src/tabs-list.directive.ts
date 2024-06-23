import { Directive, ElementRef, inject, OnInit } from '@angular/core';

import { TABS_CONTEXT_TOKEN } from './tabs-context.service';

interface TabsListProps {
    // When true, keyboard navigation will loop from last tab to first, and vice versa.
    loop?: boolean;
}

@Directive({
    selector: '[TabsList]',
    standalone: true,
    host: {
        role: 'tablist'
    }
})
export class RdxTabsListDirective implements OnInit {
    private readonly tabsContext = inject(TABS_CONTEXT_TOKEN);

    ngOnInit() {
        if (this.tabsContext) {
            /* empty */
        }
    }
}
