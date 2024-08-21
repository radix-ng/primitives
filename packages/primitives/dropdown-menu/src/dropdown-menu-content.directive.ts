import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { Directive, inject, Input } from '@angular/core';
import { pairwise, startWith, Subject } from 'rxjs';
import { RdxDropdownMenuItemDirective } from './dropdown-menu-item.directive';
import { RdxDropdownMenuTriggerDirective } from './dropdown-menu-trigger.directive';

@Directive({
    selector: '[rdxDropdownMenuContent]',
    standalone: true,
    host: {
        '[attr.data-state]': "menuTrigger.isOpen() ? 'open': 'closed'",
        '[attr.data-align]': 'menuTrigger!.align',
        '[attr.data-side]': 'menuTrigger!.side',
        '[attr.data-orientation]': 'orientation'
    },
    providers: [
        {
            provide: CdkMenu,
            useExisting: RdxDropdownMenuContentDirective
        }
    ]
})
export class RdxDropdownMenuContentDirective extends CdkMenu {
    readonly highlighted = new Subject<RdxDropdownMenuItemDirective>();
    readonly menuTrigger = inject(RdxDropdownMenuTriggerDirective, { optional: true });

    @Input() onEscapeKeyDown: (event?: Event) => void = () => undefined;
    @Input() closeOnEscape: boolean = true;

    constructor() {
        super();

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
        this.keyManager.updateActiveItem(item);
    }
}
