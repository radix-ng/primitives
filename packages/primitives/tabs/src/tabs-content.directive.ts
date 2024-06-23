import { computed, Directive, inject, input } from '@angular/core';

import { TABS_CONTEXT_TOKEN } from './tabs-context.service';

@Directive({
    selector: '[TabsContent]',
    standalone: true,
    host: {
        role: 'tabpanel',
        tabindex: '0',
        '[hidden]': '!selected()'
    }
})
export class RdxTabsContentDirective {
    private readonly tabsContext = inject(TABS_CONTEXT_TOKEN);

    readonly value = input.required<string>();

    protected readonly selected = computed(() => this.tabsContext.value$() === this.value());
}
