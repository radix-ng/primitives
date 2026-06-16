import { computed, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import {
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    useScrollLock
} from '@radix-ng/primitives/core';
import { RdxDismiss } from '@radix-ng/primitives/dismissable-layer';
import {
    provideFloatingFocusManagerConfig,
    RdxFloatingFocusManager
} from '@radix-ng/primitives/floating-focus-manager';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { injectRdxDialogRootContext } from './dialog-root';

/** Composite navigation keys a Dialog popup keeps to itself, so they never reach an enclosing Menu / Composite. */
const COMPOSITE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);

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
 * - **Mounted-scoped manager (resolved 2026-06-16):** `enabled` is now `open || transitionStatus ===
 *   'ending'`, so the trap / marker / modal-`inert` isolation hold for the whole **mounted** lifetime
 *   (through the exit animation) — Base UI's `FloatingFocusManager disabled={!mounted}`, not `open`.
 * - **`trap-focus` background isolation is intended (Base UI parity):** the manager applies `inert`
 *   (a11y-hidden + non-interactive) to outside elements for `modal === true` **and** `'trap-focus'`,
 *   matching Base UI's `modal={modal !== false}` + `markOthers({ ariaHidden: modal })`. The separate
 *   `aria-modal="true"` attribute is set only for `modal === true` (Base UI does not emit `aria-modal`
 *   at all and relies on the isolation pass); whether to drop / extend the attribute is the one open
 *   **AT-review** decision here.
 * - **`returnFocus` orchestration is deferred** → the reworked focus scope's default return-focus is
 *   used (overriding it means intercepting `unmountAutoFocus`, which fires during teardown after the
 *   output subscription is gone; a robust override is a focus-manager follow-up — see ADR 0017 §2).
 */
@Directive({
    selector: '[rdxDialogPopup]',
    exportAs: 'rdxDialogPopup',
    hostDirectives: [RdxFloatingNodeRegistration, RdxFloatingFocusManager],
    providers: [
        provideFloatingFocusManagerConfig(() => {
            const rootContext = injectRdxDialogRootContext();
            return {
                // Trap for a modal or trap-focus dialog (Base UI `modal={modal !== false}` — both isolate
                // the background via the manager's marker/inert pass).
                modal: () => rootContext.modal() === true || rootContext.modal() === 'trap-focus',
                // Active for the whole MOUNTED lifetime — including the close (exit) animation — matching
                // Base UI's `FloatingFocusManager disabled={!mounted}` (NOT `open`): the trap, the marker,
                // and the modal `inert` isolation hold until the popup actually unmounts, so focus can't
                // escape and the background can't be reached mid-close. A closed-but-never-opened mount
                // (`forceMount`) stays disabled (`isOpen` false, no `ending` transition) so it never traps
                // a hidden dialog.
                enabled: () => rootContext.isOpen() || rootContext.transitionStatus() === 'ending',
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
    readonly pointerDownOutside = output<PointerEvent>();

    /** Event handler called when focus moves outside of the popup. Can be prevented. */
    readonly focusOutside = output<FocusEvent>();

    /** Event handler called when an interaction (pointer / focus) happens outside of the popup. */
    readonly interactOutside = output<PointerEvent | FocusEvent>();

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
        useScrollLock(computed(() => this.rootContext.modal() === true && this.rootContext.isOpen()));

        const unregisterTransitionElement = this.rootContext.registerTransitionElement(this.host);
        inject(DestroyRef).onDestroy(unregisterTransitionElement);

        // Dismissal (Base UI Dialog outside-press policy, finding #1): Escape always closes; an outside
        // press closes only the **topmost** dialog (a parent with an open nested dialog never self-closes)
        // and only when pointer dismissal is enabled. With a backdrop the press is `intentional` (closes
        // on `click`, so a text-selection drag out of the popup doesn't dismiss); without one it stays
        // `sloppy` (immediate `pointerdown`). Focus-out is owned by the focus manager (below).
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => true,
            outsidePress: () => this.isTopmost() && !this.rootContext.disablePointerDismissal(),
            outsidePressEvent: () =>
                this.rootContext.modal() === true && this.hasBackdrop() ? 'intentional' : 'sloppy',
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

    /** Whether this dialog owns a backdrop element (a registered root sibling that isn't the popup). */
    private hasBackdrop(): boolean {
        for (const element of this.floatingContext.floatingElements) {
            if (element !== this.host) {
                return true;
            }
        }
        return false;
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
