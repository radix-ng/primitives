import { Directive, effect, inject } from '@angular/core';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * Contains the navigation menu items. Renders as a menubar with roving keyboard focus.
 */
@Directive({
    selector: '[rdxNavigationMenuList]',
    hostDirectives: [RdxRovingFocusGroupDirective],
    host: {
        role: 'menubar',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '(pointerleave)': 'onPointerLeave($event)'
    }
})
export class RdxNavigationMenuList {
    protected readonly rootContext = injectNavigationMenuRootContext();
    private readonly rovingFocusGroup = inject(RdxRovingFocusGroupDirective, { self: true });

    constructor() {
        effect(() => {
            this.rovingFocusGroup.setOrientation(this.rootContext.orientation());
            this.rovingFocusGroup.setDir(this.rootContext.dir());
            this.rovingFocusGroup.setLoop(this.rootContext.loop());
        });
    }

    protected onPointerLeave(event: PointerEvent) {
        if (event.pointerType === 'touch') {
            return;
        }

        this.rootContext.closeOnHover();
    }
}
