import { computed, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import {
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingNodeRegistration,
    useAnchoredScrollLock
} from '@radix-ng/primitives/core';
import { RdxDismiss } from '@radix-ng/primitives/dismissable-layer';
import {
    provideFloatingFocusManagerConfig,
    RdxFloatingFocusManager
} from '@radix-ng/primitives/floating-focus-manager';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { RdxPopperContent, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * A container for the popover contents.
 *
 * **ADR 0015/0017 Phase-4 migration** onto the new floating dismissal + focus engine (same pattern as
 * Dialog; browser-verified via `popover.behavior` Playwright). Popover-specific:
 * - **Hover-open disables the manager** (`enabled = isOpen && !isHoverActive`) — Base UI parity
 *   (`disabled={!mounted || openReason === triggerHover}`); a hover-opened popover does not trap / mark.
 *   (The legacy only suppressed auto-focus while still trapping — that Radix divergence is dropped.)
 * - Trap = `'trap-focus' || (modal === true && hasPopupClose())`; scroll / body-pointer lock + the
 *   popup's `pointer-events: auto` key off the full modal (`modal === true`).
 * - No `disablePointerDismissal` — outside-press + focus-out always close.
 *
 * Note: a positioned popover does **not** auto-focus into the popup on open (pre-existing — the legacy
 * behaved the same; verified). The trap holds focus once it is inside. Auto-focus-on-open + redirecting a
 * Tab from the trigger into the popup needs the deferred portal-focus bridge / guards (ADR 0017 §6a).
 */
@Directive({
    selector: '[rdxPopoverPopup]',
    hostDirectives: [RdxPopperContent, RdxFloatingNodeRegistration, RdxFloatingFocusManager],
    providers: [
        provideFloatingFocusManagerConfig(() => {
            const rootContext = injectRdxPopoverRootContext();
            return {
                modal: () =>
                    rootContext.modal() === 'trap-focus' ||
                    (rootContext.modal() === true && rootContext.hasPopupClose()),
                // Active for the whole MOUNTED lifetime (Base UI `disabled={!mounted}`, not `open`): the
                // trap / marker / modal-`inert` isolation hold through the close (exit) animation, lifting
                // only at unmount. Still suppressed while hover-opened (no trap / mark on hover) and for a
                // closed-but-never-opened mount (no `isOpen`, no `ending` transition).
                enabled: () =>
                    (rootContext.isOpen() || rootContext.transitionStatus() === 'ending') &&
                    !rootContext.isHoverActive()
            };
        })
    ],
    host: {
        role: 'dialog',
        '[attr.aria-describedby]': 'rootContext.descriptionId()',
        '[attr.aria-labelledby]': 'rootContext.titleId()',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-align]': 'align()',
        '[attr.data-side]': 'side()',
        '[id]': 'rootContext.contentId',
        '(pointerenter)': 'rootContext.cancelHoverClose()'
    }
})
export class RdxPopoverPopup {
    protected readonly rootContext = injectRdxPopoverRootContext();
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly focusManager = inject(RdxFloatingFocusManager);
    private readonly focusScope = inject(RdxFocusScope);
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });
    protected readonly align = computed(() => this.wrapper?.placedAlign());
    protected readonly side = computed(() => this.wrapper?.placedSide());

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
        this.floatingContext.setFloatingElement(this.host);

        // Background pointer/AT isolation for a full modal is the focus manager's `inert` pass (finding
        // #4), not a global body lock; only the page scroll lock stays here. Activation policy (ADR 0016
        // §2): lock only while a `modal === true` popover is OPEN and was **not** hover-opened, gated on
        // `open` (not mounted) so it releases at close-start. For a **touch** open the anchored helper only
        // locks when the popup is effectively viewport-width (a small popover stays swipe-to-dismissable on
        // mobile, §3).
        useAnchoredScrollLock(
            computed(
                () =>
                    this.rootContext.isOpen() && this.rootContext.modal() === true && !this.rootContext.isHoverActive()
            ),
            {
                touchOpen: () => this.rootContext.openedByTouch(),
                element: () => this.host
            }
        );

        const unregisterTransitionElement = this.rootContext.registerTransitionElement(this.host);
        inject(DestroyRef).onDestroy(unregisterTransitionElement);

        // A hover-opened popover must not steal focus — suppress the composed focus scope's auto-focus.
        this.focusScope.mountAutoFocus.subscribe((event) => {
            if (this.rootContext.isHoverActive()) {
                event.preventDefault();
            }
        });

        // Dismissal: Escape + outside-press always close (no pointer-dismissal opt-out). Focus-out is
        // owned by the focus manager (below), so the capability's own focus-out is disabled.
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => true,
            outsidePress: () => true,
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

        // Focus-out close (ADR 0017 §3) — re-expose as `focusOutside` (preventable) and close unless vetoed.
        this.focusManager.focusOut.subscribe((event) => {
            this.focusOutside.emit(event);
            this.interactOutside.emit(event);
            if (!event.defaultPrevented) {
                this.rootContext.close('focus-out', event);
            }
        });
    }
}
