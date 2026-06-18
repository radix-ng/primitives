import { DestroyRef, Directive, effect, ElementRef, inject, signal } from '@angular/core';
import { useGraceArea } from '@radix-ng/primitives/core';
import {
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * Positions the shared popup against the active trigger.
 *
 * A "thin" positioner (ADR 0012): it inherits the popper positioning surface (inputs, `placed`
 * output, unified vars + placement attrs) from {@link RdxPopperContentWrapper} and adds the
 * navigation-menu defaults, the open/closed/instant state attributes, and the grace-area hover
 * bridge. It exposes no legacy `--radix-*` aliases.
 */
@Directive({
    selector: '[rdxNavigationMenuPositioner]',
    providers: [
        ...provideRdxPopperContentWrapper(RdxNavigationMenuPositioner),
        provideRdxPopperContentConfig({ arrowPadding: 5, collisionPadding: 5, updatePositionStrategy: 'always' })
    ],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[style.--positioner-width.px]': 'rootContext.size()?.width',
        '[style.--positioner-height.px]': 'rootContext.size()?.height'
    }
})
export class RdxNavigationMenuPositioner extends RdxPopperContentWrapper {
    protected readonly rootContext = injectNavigationMenuRootContext();
    private readonly containerRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly triggerEl = signal<HTMLElement | null>(null);
    private readonly containerEl = signal<HTMLElement | null>(this.containerRef.nativeElement);
    private readonly graceArea = useGraceArea(this.triggerEl, this.containerEl);

    constructor() {
        super();
        const destroyRef = inject(DestroyRef);

        effect(() => this.triggerEl.set(this.rootContext.trigger() ?? null));

        effect((onCleanup) => {
            const list = this.rootContext.list();
            const inTransit = this.graceArea.isPointerInTransit();

            if (!list || !inTransit) {
                return;
            }

            const previous = list.style.pointerEvents;
            list.style.pointerEvents = 'none';

            onCleanup(() => {
                if (!destroyRef.destroyed) {
                    list.style.pointerEvents = previous;
                }
            });
        });

        // Keep the menu open while the pointer travels from the trigger to the popup; close once it
        // leaves the grace area between them.
        this.graceArea.onPointerExit(() => this.rootContext.closeOnHover());
    }
}
