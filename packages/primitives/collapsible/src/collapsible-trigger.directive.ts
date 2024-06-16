import { Directive } from '@angular/core';

import { injectCollapsible } from './collapsible-root.directive';

@Directive({
    selector: '[CollapsibleTrigger]',
    standalone: true,
    host: {
        '(click)': 'onOpenToggle()'
    }
})
export class RdxCollapsibleTriggerDirective {
    private readonly collapsible = injectCollapsible();

    onOpenToggle(): void {
        this.collapsible.setOpen();
    }
}
