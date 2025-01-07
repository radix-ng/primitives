import { Directive } from '@angular/core';
import { injectCollapsible, RdxCollapsibleState } from './collapsible-root.directive';

@Directive({
    selector: '[rdxCollapsibleTrigger]',
    host: {
        '[attr.data-state]': 'getState()',
        '[attr.data-disabled]': 'getDisabled()',
        '[attr.aria-expanded]': 'getState() === "open" ? "true" : "false"',
        '[disabled]': 'getDisabled()',

        '(click)': 'onOpenToggle()'
    }
})
export class RdxCollapsibleTriggerDirective {
    /**
     * Reference to CollapsibleRoot
     * @private
     * @ignore
     */
    private readonly collapsible = injectCollapsible();

    /**
     * Called on trigger clicked
     */
    onOpenToggle(): void {
        this.collapsible.setOpen();
    }

    /**
     * Returns current directive state (open | closed)
     * @ignore
     */
    getState(): RdxCollapsibleState {
        return this.collapsible.getState();
    }

    /**
     * Returns current trigger state
     * @ignore
     */
    getDisabled(): string | undefined {
        return this.collapsible.disabled() ? 'disabled' : undefined;
    }
}
