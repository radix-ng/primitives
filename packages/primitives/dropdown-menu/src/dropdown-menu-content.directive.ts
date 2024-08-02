import { CdkMenu, CdkMenuItem, CdkTargetMenuAim } from '@angular/cdk/menu';
import { Directive } from '@angular/core';
import { pairwise, startWith, Subject } from 'rxjs';
import { RdxDropdownMenuItemDirective } from './dropdown-menu-item.directive';

@Directive({
    selector: '[rdxDropdownMenuContent]',
    standalone: true,
    hostDirectives: [CdkMenu, CdkTargetMenuAim]
})
export class RdxDropdownMenuContentDirective {
    readonly highlighted = new Subject<RdxDropdownMenuItemDirective>();

    constructor() {
        // todo need sync with keyManager
        this.highlighted
            .pipe(startWith(null), pairwise())
            .subscribe(([prev, item]) => {
                if (prev) {
                    prev.highlighted = false;
                }

                if (item) {
                    item.highlighted = true;
                }
            });
    }
}
