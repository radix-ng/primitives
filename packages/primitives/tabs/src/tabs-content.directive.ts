import { computed, Directive, inject, input } from '@angular/core';
import { RDX_TABS_ROOT_TOKEN } from './tabs-root.directive';

@Directive({
    selector: '[rdxTabsContent]',
    standalone: true,
    host: {
        role: 'tabpanel',
        tabindex: '0',
        '[id]': 'tabsContext.getBaseId()',
        '[attr.aria-labelledby]': 'tabsContext.getBaseId()',
        '[attr.data-state]': 'selected() ? "active" : "inactive"',
        '[attr.data-orientation]': 'tabsContext.orientation()',
        '[hidden]': '!selected()'
    }
})
export class RdxTabsContentDirective {
    protected readonly tabsContext = inject(RDX_TABS_ROOT_TOKEN);

    readonly value = input.required<string>();

    protected readonly selected = computed(() => this.tabsContext.value() === this.value());
}
