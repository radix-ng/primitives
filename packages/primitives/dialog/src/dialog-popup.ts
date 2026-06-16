import { afterNextRender, computed, DestroyRef, Directive, ElementRef, inject, Injector, output } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import {
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    setupInternalBackdrop,
    useScrollLock
} from '@radix-ng/primitives/core';
import { RdxDismiss, RdxOutsidePressDomEvent } from '@radix-ng/primitives/dismissable-layer';
import {
    provideFloatingFocusManagerConfig,
    RdxFloatingFocusManager
} from '@radix-ng/primitives/floating-focus-manager';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { injectRdxDialogRootContext } from './dialog-root';

/** Composite navigation keys a Dialog popup keeps to itself, so they never reach an enclosing Menu / Composite. */
const COMPOSITE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);
const DIALOG_INTERNAL_BACKDROP_ATTR = 'data-rdx-dialog-internal-backdrop';

/**
 * A container for the dialog contents.
 *
 * **ADR 0015/0017 Phase-4 migration — Dialog is the PILOT cutover onto the new floating dismissal +
 * focus engine. Browser-verified** by `apps/visual-regression/tests/dialog.behavior.spec.ts` (trap,
 * initial / return focus, Escape / outside-press / focus-out dismissal, nested-Escape deepest-first,
 * backdrop-not-marked).
 *
 * **Mapping (legacy → new):**
 * - `RdxDismissableLayer` (legacy) → `RdxFloatingNodeRegistration` (registers the tree node) +
 *   `RdxDismiss` (Escape / outside-press; reads the root context + node).
 * - `RdxFocusScope` (direct) → `RdxFloatingFocusManager` (composes the reworked focus scope; trap +
 *   markOthers + close-on-focus-out), driven by `provideFloatingFocusManagerConfig`.
 * - `disableOutsidePointerEvents` → the focus manager's `inert` pass marks outside elements
 *   non-interactive for a modal (finding #4), scoped to siblings of the popup's ancestor chain instead
 *   of a global `body { pointer-events: none }` lock — so the popup needs no `pointer-events: auto`.
 * - focus-out close moved from the dismissal capability (`focusOutside: () => false`) to the manager
 *   (`manager.focusOut`), per ADR 0017 §3.
 * - `isEventOnTrigger` preventDefault → removed: the trigger is in `context.triggers`, so the engine
 *   treats a press/focus on it as **inside** (no close-then-reopen).
 *
 * **Parity notes:**
 * - **Lifecycle split (resolved 2026-06-16):** `enabled` is `open || transitionStatus === 'ending'`, so
 *   the trap / return-focus machinery survives the exit animation, while the manager's marker + isolation
 *   passes additionally key off `open` and release at close-start (Base UI `markOthers` gating).
 * - **`trap-focus` split:** the manager traps focus for `modal === true` and `'trap-focus'`, but applies
 *   real `inert` isolation only for `modal === true`, matching Base UI's public contract that
 *   `modal="trap-focus"` leaves outside pointer interaction enabled.
 * - **`returnFocus` orchestration (resolved 2026-06-16):** the manager now owns the return-focus *target*
 *   via the focus scope's `returnFocus` config seam (the scope owns the *timing* — its queued post-unmount
 *   frame). Dialog leaves it at the default (`returnFocus: true` → return to the element focused before
 *   open), so behavior is unchanged; a consumer can now also pass `false` / an element / a callback.
 */
@Directive({
    selector: '[rdxDialogPopup]',
    exportAs: 'rdxDialogPopup',
    hostDirectives: [RdxFloatingNodeRegistration, RdxFloatingFocusManager],
    providers: [
        provideFloatingFocusManagerConfig(() => {
            const rootContext = injectRdxDialogRootContext();
            return {
                // Trap for a modal or trap-focus dialog (Base UI `modal={modal !== false}`).
                modal: () => rootContext.modal() === true || rootContext.modal() === 'trap-focus',
                // Full modal blocks outside pointer interaction; `trap-focus` only traps focus.
                inert: () => rootContext.modal() === true,
                // Active for the whole MOUNTED lifetime — including an explicit
                // `preventUnmountOnClose()` cycle after the exit transition — matching Base UI's
                // `FloatingFocusManager disabled={!mounted}` (NOT `open`) for trap/return-focus.
                // Marker + isolation are additionally gated on `open` inside the manager.
                enabled: () => rootContext.present(),
                closeOnFocusOut: () => !rootContext.disablePointerDismissal()
            };
        })
    ],
    host: {
        '[attr.role]': 'rootContext.role',
        '[attr.aria-modal]': 'rootContext.modal() === true ? "true" : undefined',
        '[attr.aria-describedby]': 'rootContext.descriptionId()',
        '[attr.aria-labelledby]': 'rootContext.titleId()',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-nested]': 'rootContext.nested ? "" : undefined',
        '[attr.data-nested-dialog-open]': 'rootContext.nestedDialogOpen() ? "" : undefined',
        '[id]': 'rootContext.contentId',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class RdxDialogPopup {
    protected readonly rootContext = injectRdxDialogRootContext();
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly focusManager = inject(RdxFloatingFocusManager);
    private readonly focusScope = inject(RdxFocusScope);

    /** Event handler called when the escape key is down. Can be prevented. */
    readonly escapeKeyDown = output<KeyboardEvent>();

    /** Event handler called when a pointerdown event happens outside of the popup. Can be prevented. */
    readonly pointerDownOutside = output<RdxOutsidePressDomEvent>();

    /** Event handler called when focus moves outside of the popup. Can be prevented. */
    readonly focusOutside = output<FocusEvent>();

    /** Event handler called when an interaction (pointer / focus) happens outside of the popup. */
    readonly interactOutside = output<RdxOutsidePressDomEvent | FocusEvent>();

    /** Event handler called before focus moves into the popup. Can be prevented. */
    readonly openAutoFocus = outputFromObservable(outputToObservable(this.focusScope.mountAutoFocus));

    /** Event handler called before focus returns after the popup is removed. Can be prevented. */
    readonly closeAutoFocus = outputFromObservable(outputToObservable(this.focusScope.unmountAutoFocus));

    constructor() {
        // The popup element is this layer's floating element (inside-surface for containment checks).
        this.floatingContext.setFloatingElement(this.host);

        // Scroll lock follows Base UI (`open && modal === true`): released at close-start so the page is
        // scrollable again as the exit animation plays. Background pointer/AT isolation is no longer a
        // global body lock — the focus manager applies real `inert` to outside elements (finding #4).
        useScrollLock(
            computed(() => this.rootContext.modal() === true && this.rootContext.isOpen()),
            {
                referenceElement: () => this.host
            }
        );

        const unregisterTransitionElement = this.rootContext.registerTransitionElement(this.host);
        inject(DestroyRef).onDestroy(unregisterTransitionElement);

        // Base UI always renders an internal backdrop for a fully modal dialog. It is invisible and exists
        // even when consumers also render `rdxDialogBackdrop`: outside pointer events land on this owned
        // target instead of being swallowed by inert page content.
        const injector = inject(Injector);
        afterNextRender(() =>
            setupInternalBackdrop(this.host, injector, {
                marker: DIALOG_INTERNAL_BACKDROP_ATTR,
                isOpen: () => this.rootContext.isOpen(),
                shouldRender: () => this.rootContext.modal() === true,
                cutout: () => this.host.closest('[rdxDialogViewport]'),
                passThrough: () => this.host.closest('[rdxDialogViewport]') !== null
            })
        );

        // Dismissal (Base UI Dialog outside-press policy): Escape always closes; an outside press closes
        // only the **topmost** dialog (a parent with an open nested dialog never self-closes) and only when
        // pointer dismissal is enabled. A fully modal dialog uses the internal backdrop and intentional
        // outside-press timing (click, not pointerdown). Focus-out is owned by the focus manager (below).
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => true,
            outsidePress: () => this.isTopmost() && !this.rootContext.disablePointerDismissal(),
            outsidePressEvent: () => (this.rootContext.modal() === true ? 'intentional' : 'sloppy'),
            focusOutside: () => false,
            onEscapeKeyDown: (event) => this.escapeKeyDown.emit(event),
            onPointerDownOutside: (event) => {
                this.pointerDownOutside.emit(event);
                this.interactOutside.emit(event);
            },
            onDismiss: (reason, event) => {
                this.rootContext.close(reason === 'escape-key' ? 'escape-key' : 'outside-press', event);
            }
        });

        // Focus-out close (ADR 0017 §3) — the manager emits when focus leaves a non-modal dialog to an
        // unrelated node; re-expose as `focusOutside` (preventable) and close unless vetoed.
        this.focusManager.focusOut.subscribe((event) => {
            this.focusOutside.emit(event);
            this.interactOutside.emit(event);
            if (!event.defaultPrevented) {
                this.rootContext.close('focus-out', event);
            }
        });
    }

    /** This dialog is the topmost (deepest open) one — it has no open nested dialog above it. */
    private isTopmost(): boolean {
        return this.rootContext.isOpen() && !this.rootContext.nestedDialogOpen();
    }

    /**
     * Composite navigation keys (arrows / Home / End) are kept inside the dialog (Base UI `DialogPopup`):
     * a dialog opened from inside a Menu / Menubar / Composite must not let an arrow press bubble out and
     * move the outer collection's active item.
     */
    protected onKeyDown(event: KeyboardEvent): void {
        if (COMPOSITE_KEYS.has(event.key)) {
            event.stopPropagation();
        }
    }
}
