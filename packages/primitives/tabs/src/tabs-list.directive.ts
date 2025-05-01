import { Directive, inject } from '@angular/core';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import { RDX_TABS_ROOT_TOKEN } from './tabs-root.directive';

export interface TabsListProps {
    // When true, keyboard navigation will loop from last tab to first, and vice versa.
    loop?: boolean;
}

@Directive({
    selector: '[rdxTabsList]',
    hostDirectives: [{ directive: RdxRovingFocusGroupDirective, inputs: ['dir', 'orientation', 'loop'] }],
    host: {
        role: 'tablist',
        '[attr.aria-orientation]': 'tabsContext.orientation()',
        '[attr.data-orientation]': 'tabsContext.orientation()'
    }
})
export class RdxTabsListDirective {
    protected readonly tabsContext = inject(RDX_TABS_ROOT_TOKEN);
}
