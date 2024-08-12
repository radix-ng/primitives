import { CdkMenu, CdkMenuItem, CdkMenuTrigger, CdkTargetMenuAim } from '@angular/cdk/menu';
import { Directive, inject } from '@angular/core';
import { pairwise, startWith, Subject } from 'rxjs';
import { RdxDropdownMenuItemDirective } from './dropdown-menu-item.directive';
import { RdxDropdownMenuTriggerDirective } from './dropdown-menu-trigger.directive';

@Directive({
    selector: '[rdxDropdownMenuContent]',
    standalone: true,
    hostDirectives: [CdkMenu, CdkTargetMenuAim],
    host: {
        '[attr.data-state]': "cdkMenuTrigger.isOpen() ? 'open': 'closed'",
        '[attr.data-align]': 'menuTrigger!.align',
        '[attr.data-side]': 'menuTrigger!.side',
        '[attr.data-orientation]': 'cdkMenu.orientation'
    }
})
export class RdxDropdownMenuContentDirective {
    readonly highlighted = new Subject<RdxDropdownMenuItemDirective>();
    readonly cdkMenu = inject(CdkMenu);
    protected readonly cdkMenuTrigger = inject(CdkMenuTrigger, { host: true });
    protected readonly menuTrigger = inject(RdxDropdownMenuTriggerDirective, { optional: true });

    constructor() {
        // todo need sync with keyManager
        this.highlighted.pipe(startWith(null), pairwise()).subscribe(([prev, item]) => {
            if (prev) {
                prev.highlighted = false;
            }

            if (item) {
                item.highlighted = true;
            }
        });
    }

    updateActiveItem(item: CdkMenuItem) {
        this.cdkMenu['keyManager'].updateActiveItem(item);
    }
}
