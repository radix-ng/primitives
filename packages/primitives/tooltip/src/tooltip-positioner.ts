import { afterNextRender, DestroyRef, Directive, effect, ElementRef, inject, output, signal } from '@angular/core';
import {
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    useGraceArea
} from '@radix-ng/primitives/core';
import { RdxDismiss, RdxOutsidePressDomEvent } from '@radix-ng/primitives/dismissable-layer';
import {
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    RdxPopperContentWrapper
} from '@radix-ng/primitives/popper';
import { injectRdxTooltipContext } from './tooltip';

/**
 * Positions the tooltip popup against its trigger (or a custom anchor).
 *
 * A "thin" positioner (ADR 0012): it inherits the popper positioning surface (inputs, `placed`
 * output, unified vars + placement attrs) from {@link RdxPopperContentWrapper} and adds tooltip's own
 * concerns — Base UI-aligned defaults (`side: 'top'`) via the config provider, dismiss handling
 * (ADR 0015 — inline {@link RdxDismiss} on the shared floating tree, dismissal-only with
 * no focus manager), the cursor-follow pointer-through behavior (via the inherited `nonInteractive`
 * signal), the open/closed state attributes, and the hover grace area.
 */
@Directive({
    selector: '[rdxTooltipPositioner]',
    providers: [
        ...provideRdxPopperContentWrapper(RdxTooltipPositioner),
        provideRdxPopperContentConfig({ side: 'top', arrowPadding: 5, collisionPadding: 5 })
    ],
    hostDirectives: [RdxFloatingNodeRegistration],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""'
        // `data-side`/`data-align`/`data-anchor-hidden` and the unified vars come from the inherited
        // wrapper (ADR 0012); tooltip exposes no legacy `--radix-*` aliases.
    }
})
export class RdxTooltipPositioner extends RdxPopperContentWrapper {
    protected readonly rootContext = injectRdxTooltipContext();
    private readonly destroyRef = inject(DestroyRef);
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly containerRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Event handler called when the escape key is down. Can be prevented.
     */
    readonly escapeKeyDown = output<KeyboardEvent>();

    /**
     * Event handler called when a `pointerdown` event happens outside of the popup. Can be prevented.
     */
    readonly pointerDownOutside = output<RdxOutsidePressDomEvent>();

    private readonly triggerEl = signal<HTMLElement | null>(null);
    private readonly containerEl = signal<HTMLElement | null>(null);

    private readonly graceArea = useGraceArea(this.triggerEl, this.containerEl, 300);

    private readonly afterNextRender = afterNextRender(() => {
        this.triggerEl.set(this.rootContext.trigger() ?? null);
        this.containerEl.set(this.containerRef.nativeElement);

        const handleScroll = (event: Event) => {
            const target = event.target as HTMLElement;
            const trigger = this.rootContext.trigger();

            if (trigger && target?.contains(trigger)) {
                this.rootContext.close('none', event);
            }
        };

        window.addEventListener('scroll', handleScroll, { capture: true });

        this.destroyRef.onDestroy(() => {
            window.removeEventListener('scroll', handleScroll, { capture: true });
        });

        this.graceArea.onPointerExit(() => {
            // A disabled root is fully controlled by the consumer (e.g. the slider thumb drives
            // `open` while dragging). Hover never opens it, so the hover grace area must not close
            // it either — otherwise a drag that leaves the grace polygon would dismiss it and the
            // one-way `open` binding could not bring it back.
            if (this.rootContext.disabled() || this.rootContext.disableHoverablePopup()) return;
            this.rootContext.closeDelayed();
        });
    });

    constructor() {
        super();

        // Register as the floating element so dismissal containment (outside-press / focus) treats the
        // popup as "inside".
        this.floatingContext.setFloatingElement(this.containerRef.nativeElement);

        // Dismissal-only (ADR 0017 §1 — a tooltip has no focus manager): Escape and an outside press
        // close it; focus-out is intentionally a no-op (a tooltip never traps or follows focus).
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => true,
            outsidePress: () => true,
            focusOutside: () => false,
            onEscapeKeyDown: (event) => this.escapeKeyDown.emit(event),
            onPointerDownOutside: (event) => this.pointerDownOutside.emit(event),
            onDismiss: (reason, event) =>
                this.rootContext.close(reason === 'escape-key' ? 'escape-key' : 'outside-press', event)
        });

        // While following the cursor the popup sits right under the pointer; if it could intercept
        // the pointer it would steal hover from the trigger and the tooltip would flicker. Render it
        // pointer-events: none so the pointer always passes through to the trigger underneath.
        effect(() => this.nonInteractive.set(this.rootContext.trackCursorAxis() !== 'none'));
    }
}
