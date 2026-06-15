import { computed, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import {
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    useBodyPointerEventsLock,
    useScrollLock
} from '@radix-ng/primitives/core';
import { RdxDismissableCapability } from '@radix-ng/primitives/dismissable-layer';
import {
    provideFloatingFocusManagerConfig,
    RdxFloatingFocusManager
} from '@radix-ng/primitives/floating-focus-manager';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * A container for the dialog contents.
 *
 * ⚠️ **NOT VERIFIED — ADR 0015/0017 Phase-4 migration (browser run required before merge).** This is the
 * Dialog cutover onto the new floating dismissal + focus engine. **jsdom cannot validate it** (no real
 * layout / focus / pointer), so the behaviors below are unproven until exercised in `apps/visual-regression`
 * (Playwright). Do **not** merge on a green `dialog.spec.ts` alone.
 *
 * **Mapping (legacy → new):**
 * - `RdxDismissableLayer` (legacy) → `RdxFloatingNodeRegistration` (registers the tree node) +
 *   `RdxDismissableCapability` (Escape / outside-press; reads the root context + node).
 * - `RdxFocusScope` (direct) → `RdxFloatingFocusManager` (composes the reworked focus scope; trap +
 *   markOthers + close-on-focus-out), driven by `provideFloatingFocusManagerConfig`.
 * - `disableOutsidePointerEvents` → `useBodyPointerEventsLock(modal === true)`.
 * - focus-out close moved from the dismissal capability (`focusOutside: () => false`) to the manager
 *   (`manager.focusOut`), per ADR 0017 §3.
 * - `isEventOnTrigger` preventDefault → removed: the trigger is in `context.triggers`, so the engine
 *   treats a press/focus on it as **inside** (no close-then-reopen).
 *
 * **Nuances to verify in the browser / AT (flagged):**
 * 1. `enabled: isOpen()` releases the trap at close-start; legacy held it until unmount (the
 *    closed-but-mounted exit window — ADR §1). Confirm no focus jump during the exit animation.
 * 2. `markOthers` aria-hidden applies for `'trap-focus'` too (manager modal), while `aria-modal` is set
 *    only for `modal === true`. Verify AT behavior / whether to split these.
 * 3. `markOthers` is NEW for Dialog — verify no double / conflicting `aria-hidden`.
 * 4. `returnFocus` orchestration is deferred → the reworked focus scope's default return-focus is used.
 * 5. `pointerDownOutside` no longer fires for presses on the trigger (now inside) — minor API shift.
 * 6. Atomic-cutover caveat: Dialog is on the new engine while other primitives are legacy — cross-primitive
 *    nesting (e.g. a legacy Popover inside this Dialog) is **out of scope** until the full cutover.
 */
@Directive({
    selector: '[rdxDialogPopup]',
    exportAs: 'rdxDialogPopup',
    hostDirectives: [RdxFloatingNodeRegistration, RdxFloatingFocusManager],
    providers: [
        provideFloatingFocusManagerConfig(() => {
            const rootContext = injectRdxDialogRootContext();
            return {
                // Trap for a modal or trap-focus dialog; off when the dialog is closed (still mounted).
                modal: () => rootContext.modal() === true || rootContext.modal() === 'trap-focus',
                enabled: () => rootContext.isOpen(),
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
        '[id]': 'rootContext.contentId'
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

        // Lock scroll / outside pointer events for a full modal, held for the whole mounted lifetime (not
        // just while open) so the page doesn't reflow by the scrollbar width mid-exit-animation.
        const isFullyModal = computed(() => this.rootContext.modal() === true);
        useScrollLock(isFullyModal);
        useBodyPointerEventsLock(isFullyModal);

        const unregisterTransitionElement = this.rootContext.registerTransitionElement(this.host);
        inject(DestroyRef).onDestroy(unregisterTransitionElement);

        // Dismissal: Escape always closes; outside-press only when pointer dismissal is enabled. Focus-out
        // is owned by the focus manager (below), so the capability's own focus-out is disabled.
        new RdxDismissableCapability(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => true,
            outsidePress: () => !this.rootContext.disablePointerDismissal(),
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
}
