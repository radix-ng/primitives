import { computed, Directive, inject, input } from '@angular/core';
import { RDX_TABS_ROOT_TOKEN } from './tabs-root.directive';
import { makeContentId, makeTriggerId } from './utils';

@Directive({
    selector: '[rdxTabsContent]',
    standalone: true,
    host: {
        role: 'tabpanel',
        tabindex: '0',
        '[id]': 'contentId()',
        '[attr.aria-labelledby]': 'triggerId()',
        '[attr.data-state]': 'selected() ? "active" : "inactive"',
        '[attr.data-orientation]': 'tabsContext.orientation()',
        '[hidden]': '!selected()'
    }
})
export class RdxTabsContentDirective {
    protected readonly tabsContext = inject(RDX_TABS_ROOT_TOKEN);

    /**
     * A unique value that associates the content with a trigger.
     */
    readonly value = input.required<string>();

    protected readonly contentId = computed(() => makeContentId(this.tabsContext.getBaseId(), this.value()));
    protected readonly triggerId = computed(() => makeTriggerId(this.tabsContext.getBaseId(), this.value()));

    protected readonly selected = computed(() => this.tabsContext.value() === this.value());
}
