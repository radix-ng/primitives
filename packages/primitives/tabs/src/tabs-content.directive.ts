import { computed, Directive, inject, input } from '@angular/core';
import { TABS_CONTEXT_TOKEN } from './tabs-context.service';

@Directive({
    selector: '[rdxTabsContent]',
    standalone: true,
    host: {
        role: 'tabpanel',
        tabindex: '0',
        '[id]': 'tabsContext.getBaseId()',
        '[attr.aria-labelledby]': 'tabsContext.getBaseId()',
        '[attr.data-state]': 'selected() ? "active" : "inactive"',
        '[attr.data-orientation]': 'tabsContext.orientation$()',
        '[hidden]': '!selected()'
    }
})
export class RdxTabsContentDirective {
    protected readonly tabsContext = inject(TABS_CONTEXT_TOKEN);

    readonly value = input.required<string>();

    protected readonly selected = computed(() => this.tabsContext.value$() === this.value());
}
