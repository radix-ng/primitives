import {
    afterNextRender,
    afterRenderEffect,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    output,
    signal
} from '@angular/core';
import type { Middleware } from '@floating-ui/dom';
import {
    isNode,
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    useGraceArea
} from '@radix-ng/primitives/core';
import { RdxDismiss, RdxOutsidePressDomEvent } from '@radix-ng/primitives/dismissable-layer';
import {
    provideRdxPopperContentConfig,
    provideRdxPopperContentWrapper,
    type RdxPopperArrow,
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
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-instant]': 'rootContext.instantType()',
        '[hidden]': '!positioningActive()',
        '[attr.inert]': 'nonInteractive() ? "" : undefined',
        '(pointerenter)': 'handlePointerEnter($event)'
        // `data-side`/`data-align`/`data-anchor-hidden` and the unified vars come from the inherited
        // wrapper (ADR 0012); tooltip exposes no legacy `--radix-*` aliases.
    }
})
export class RdxTooltipPositioner extends RdxPopperContentWrapper {
    protected readonly rootContext = injectRdxTooltipContext();
    protected override positioningActive = computed(
        () => this.rootContext.isOpen() || this.rootContext.transitionStatus() === 'ending'
    );
    private readonly destroyRef = inject(DestroyRef);
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly containerRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly viewports = signal(0);

    /**
     * Event handler called when the escape key is down. Can be prevented.
     */
    readonly escapeKeyDown = output<KeyboardEvent>();

    /**
     * Event handler called when a `pointerdown` event happens outside of the popup. Can be prevented.
     */
    readonly pointerDownOutside = output<RdxOutsidePressDomEvent>();

    private readonly hoverable = computed(
        () =>
            this.rootContext.isOpen() &&
            !this.rootContext.disableHoverablePopup() &&
            this.rootContext.trackCursorAxis() !== 'both'
    );
    private readonly triggerEl = computed(() => (this.hoverable() ? this.rootContext.trigger() : undefined));
    private readonly containerEl = signal<HTMLElement | null>(null);

    private readonly graceArea = useGraceArea(this.triggerEl, this.containerEl, 300);

    private readonly cursorTracking = afterRenderEffect((onCleanup) => {
        const root = this.rootContext;
        const trigger = root.trigger();
        if (
            !trigger ||
            !root.isOpen() ||
            root.trackCursorAxis() === 'none' ||
            root.openChangeReason() === 'trigger-focus'
        ) {
            return;
        }

        const positioner = this.containerRef.nativeElement;
        const view = positioner.ownerDocument.defaultView;
        let tracking = true;
        const onPointerMove = (event: PointerEvent) => {
            if (event.pointerType === 'touch') return;
            const path = event.composedPath();
            // Freeze the position when the pointer reaches the popup. Re-entering the trigger resumes tracking.
            if (path.includes(positioner)) {
                tracking = false;
            } else if (tracking || path.includes(trigger)) {
                tracking = true;
                root.setCursorPosition({ x: event.clientX, y: event.clientY });
            }
        };
        view?.addEventListener('pointermove', onPointerMove, { passive: true });
        onCleanup(() => view?.removeEventListener('pointermove', onPointerMove));
    });

    private readonly afterNextRender = afterNextRender(() => {
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
            if (!this.hoverable()) return;
            this.rootContext.closeDelayed();
        });
    });

    constructor() {
        super();

        // Register as the floating element so dismissal containment (outside-press / focus) treats the
        // popup as "inside".
        this.floatingContext.setFloatingElement(this.containerRef.nativeElement);
        this.destroyRef.onDestroy(() => {
            if (this.floatingContext.floatingElement === this.containerRef.nativeElement) {
                this.floatingContext.setFloatingElement(null);
            }
        });

        // Dismissal-only (ADR 0017 §1 — a tooltip has no focus manager): Escape and an outside press
        // close it; focus-out is intentionally a no-op (a tooltip never traps or follows focus).
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => true,
            outsidePress: (event) => !this.isDehydratedTriggerPress(event),
            focusOutside: () => false,
            onEscapeKeyDown: (event) => this.escapeKeyDown.emit(event),
            onPointerDownOutside: (event) => this.pointerDownOutside.emit(event),
            onDismiss: (reason, event) =>
                this.rootContext.close(reason === 'escape-key' ? 'escape-key' : 'outside-press', event)
        });

        effect(() => this.nonInteractive.set(!this.hoverable()));
    }

    protected handlePointerEnter(event: PointerEvent): void {
        if (event.pointerType !== 'touch' && this.hoverable()) this.rootContext.cancelHoverClose();
    }

    private isDehydratedTriggerPress(event: Event): boolean {
        const id = this.rootContext.triggerId();
        const description = this.rootContext.contentId();
        if (this.rootContext.trigger() || id === null || !description) return false;

        // An incrementally hydrated trigger can receive the press that registers it.
        const trigger = this.containerRef.nativeElement.ownerDocument.getElementById(id);
        return (
            !!trigger &&
            trigger.getAttribute('aria-describedby') === description &&
            isNode(event.target) &&
            trigger.contains(event.target)
        );
    }

    /** @internal Viewport size transitions keep the edge nearest the trigger in place. */
    registerViewport(): () => void {
        this.viewports.update((count) => count + 1);
        return () => this.viewports.update((count) => count - 1);
    }

    protected override createArrowMiddleware(arrow: RdxPopperArrow): Middleware {
        const middleware = super.createArrowMiddleware(arrow);
        if (!this.viewports()) return middleware;

        // During a resize, the popup is still animating toward the positioner's target dimensions.
        return {
            ...middleware,
            fn: (state) =>
                middleware.fn({
                    ...state,
                    platform: { ...state.platform, getOffsetParent: () => state.elements.floating }
                })
        };
    }

    protected override getPositionerStyles(): Record<string, string | number | undefined> {
        const styles = super.getPositionerStyles();
        const side = this.physicalPlacedSide();
        if (!this.positioningActive() || !this.viewports() || (side !== 'top' && side !== 'left')) return styles;

        // Percent offsets are relative to the same containing block as Floating UI's x/y.
        // Use the actual positioner size so authored max widths and boundaries remain effective.
        if (side === 'top' && styles['top']) {
            styles['bottom'] = `calc(100% - ${styles['top']} - ${styles['--radix-popper-content-wrapper-height']})`;
            styles['top'] = undefined;
        } else if (side === 'left' && styles['left']) {
            styles['right'] = `calc(100% - ${styles['left']} - ${styles['--radix-popper-content-wrapper-width']})`;
            styles['left'] = undefined;
        }
        // Positioner takes the target size while the Popup animates inside it, in normal flow.
        styles['display'] = 'grid';
        styles['gridTemplate'] = 'minmax(0, 1fr) / minmax(0, 1fr)';
        styles['minWidth'] = '0';
        if (side === 'top') styles['alignItems'] = 'end';
        else styles['justifyItems'] = 'end';
        return styles;
    }
}
