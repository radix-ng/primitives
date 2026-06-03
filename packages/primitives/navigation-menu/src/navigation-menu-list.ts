import { injectNavigationMenuRootContext } from './navigation-menu-root-context';
import { DestroyRef, Directive, effect, ElementRef, inject } from '@angular/core';
import { RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP } from '@radix-ng/primitives/core';

/**
 * Contains the navigation menu items and coordinates composite keyboard focus between triggers.
 */
@Directive({
    selector: '[rdxNavigationMenuList]',
    hostDirectives: [RdxCompositeRoot],
    host: {
        '[attr.data-orientation]': 'rootContext.orientation()',
        '(keydown)': 'onKeydown($event)',
        '(pointerleave)': 'onPointerLeave($event)'
    }
})
export class RdxNavigationMenuList {
    protected readonly rootContext = injectNavigationMenuRootContext();
    private readonly compositeRoot = inject(RdxCompositeRoot, { self: true });

    constructor() {
        const unregisterList = this.rootContext.registerList(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
        inject(DestroyRef).onDestroy(unregisterList);

        effect(() => {
            this.compositeRoot.setOrientation(this.rootContext.orientation());
            this.compositeRoot.setDir(this.rootContext.dir());
            this.compositeRoot.setLoopFocus(false);
        });
    }

    protected onKeydown(event: KeyboardEvent) {
        if (this.rootContext.nested) {
            return;
        }

        const horizontal = this.rootContext.orientation() === 'horizontal';
        const shouldStop = horizontal
            ? event.key === ARROW_LEFT || event.key === ARROW_RIGHT
            : event.key === ARROW_UP || event.key === ARROW_DOWN;

        if (shouldStop) {
            event.stopPropagation();
        }
    }

    protected onPointerLeave(event: PointerEvent) {
        if (event.pointerType === 'touch') {
            return;
        }

        this.rootContext.closeOnHover(event);
    }
}
