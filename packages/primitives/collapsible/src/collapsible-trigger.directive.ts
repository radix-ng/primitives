import { Directive } from '@angular/core';

import { injectCollapsible, RdxCollapsibleState } from './collapsible-root.directive';

@Directive({
    selector: '[CollapsibleTrigger]',
    standalone: true,
    host: {
        '(click)': 'onOpenToggle()',
        '[attr.data-state]': 'getState()',
        '[attr.aria-expanded]': 'getState() === "open" ? "true" : "false"',
        '[disabled]': 'getDisabled()'
    }
})
export class RdxCollapsibleTriggerDirective {
    private readonly collapsible = injectCollapsible();

    onOpenToggle(): void {
        this.collapsible.setOpen();
    }

    getState(): RdxCollapsibleState {
        return this.collapsible.isOpen() ? 'open' : 'closed';
    }

    getDisabled(): string | undefined {
        return this.collapsible.disabled ? 'disabled' : undefined;
    }
}
