import { Directive, effect, ElementRef, inject, signal } from '@angular/core';
import { useGraceArea } from '@radix-ng/primitives/core';
import {
    legacyPopperVars,
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';
import { injectRdxPreviewCardRootContext } from './preview-card-root';

/**
 * Positions the preview-card against its trigger.
 *
 * A "thin" positioner (ADR 0012): it inherits the popper positioning surface (inputs, `placed`
 * output, unified vars + placement attrs) from {@link RdxPopperContentWrapper} and adds preview-card's
 * own concerns — Base UI-aligned defaults via the config provider, the open/closed/instant state
 * attributes, the deprecated `--radix-preview-card-*` aliases, and the grace-area hover bridge.
 */
@Directive({
    selector: '[rdxPreviewCardPositioner]',
    providers: [
        ...provideRdxPopperContentWrapper(RdxPreviewCardPositioner),
        provideRdxPopperContentConfig({ arrowPadding: 5, collisionPadding: 5, updatePositionStrategy: 'always' })
    ],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        // `data-side`/`data-align`/`data-anchor-hidden` and the unified `--anchor-*`/`--available-*`/
        // `--transform-origin` vars come from the inherited wrapper (ADR 0012); only the deprecated
        // `--radix-preview-card-*` aliases remain, for one release of back-compat.
        '[style]': 'legacyVars'
    }
})
export class RdxPreviewCardPositioner extends RdxPopperContentWrapper {
    protected readonly rootContext = injectRdxPreviewCardRootContext();
    protected readonly legacyVars = legacyPopperVars('preview-card');
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
