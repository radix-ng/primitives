import { injectRdxPopoverRootContext } from './popover-root';
import { Directive, effect, ElementRef, inject, signal } from '@angular/core';
import { useGraceArea } from '@radix-ng/primitives/core';
import {
    legacyPopperVars,
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';

/**
 * Positions the popover against its trigger.
 *
 * A "thin" positioner (ADR 0012): it inherits the popper positioning surface (inputs, `placed`
 * output, unified vars + placement attrs) from {@link RdxPopperContentWrapper} and adds popover's own
 * concerns — Base UI-aligned defaults via the config provider, the open/closed/instant state
 * attributes, the deprecated `--radix-popover-*` aliases, and the grace-area hover bridge.
 */
@Directive({
    selector: '[rdxPopoverPositioner]',
    providers: [
        ...provideRdxPopperContentWrapper(RdxPopoverPositioner),
        provideRdxPopperContentConfig({ arrowPadding: 5, collisionPadding: 5, updatePositionStrategy: 'always' })
    ],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-instant]': 'rootContext.instantType()',
        // `data-side`/`data-align`/`data-anchor-hidden` and the unified `--anchor-*`/`--available-*`/
        // `--transform-origin` vars come from the inherited wrapper (ADR 0012); only the deprecated
        // `--radix-popover-*` aliases remain, for one release of back-compat.
        '[style]': 'legacyVars'
    }
})
export class RdxPopoverPositioner extends RdxPopperContentWrapper {
    protected readonly rootContext = injectRdxPopoverRootContext();
    protected readonly legacyVars = legacyPopperVars('popover');
    private readonly containerRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly triggerEl = signal<HTMLElement | null>(null);
    private readonly containerEl = signal<HTMLElement | null>(this.containerRef.nativeElement);
    private readonly graceArea = useGraceArea(this.triggerEl, this.containerEl);

    constructor() {
        super();

        effect(() => this.triggerEl.set(this.rootContext.trigger() ?? null));

        this.graceArea.onPointerExit(() => {
            this.rootContext.closeOnHover();
        });
    }
}
