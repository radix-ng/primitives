import { Directive } from '@angular/core';
import { injectTooltipRoot } from './tooltip-root.directive';

@Directive({
    selector: '[rdxTooltipTrigger]',
    standalone: true,
    host: {
        // TODO: actually hover and click can trigger tooltip
        '(click)': 'toggle()',
        '[attr.data-state]': 'getState()'
    }
})
export class RdxTooltipTriggerDirective {
    private tooltipRoot = injectTooltipRoot();

    toggle(): void {
        this.tooltipRoot.toggle();
    }

    getState(): string {
        // TODO: set correct states
        // correct states is: "closed" | "delayed-open" | "instant-open"
        return this.tooltipRoot.isOpen() ? 'open' : 'closed';
    }
}
