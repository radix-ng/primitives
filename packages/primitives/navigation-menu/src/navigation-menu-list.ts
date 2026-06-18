import { DestroyRef, Directive, effect, ElementRef, inject } from '@angular/core';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * Contains the navigation menu items and coordinates roving keyboard focus between triggers.
 */
@Directive({
    selector: '[rdxNavigationMenuList]',
    hostDirectives: [RdxRovingFocusGroupDirective],
    host: {
        '[attr.data-orientation]': 'rootContext.orientation()',
        '(pointerleave)': 'onPointerLeave($event)'
    }
})
export class RdxNavigationMenuList {
    protected readonly rootContext = injectNavigationMenuRootContext();
    private readonly rovingFocusGroup = inject(RdxRovingFocusGroupDirective, { self: true });

    constructor() {
        const unregisterList = this.rootContext.registerList(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
        inject(DestroyRef).onDestroy(unregisterList);

        effect(() => {
            this.rovingFocusGroup.setEnabled(!this.rootContext.nested);
            this.rovingFocusGroup.setOrientation(this.rootContext.orientation());
            this.rovingFocusGroup.setDir(this.rootContext.dir());
            this.rovingFocusGroup.setLoop(this.rootContext.loop());
        });
    }

    protected onPointerLeave(event: PointerEvent) {
        if (event.pointerType === 'touch') {
            return;
        }

        this.rootContext.closeOnHover(event);
    }
}
