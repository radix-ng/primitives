import { isPlatformBrowser } from '@angular/common';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    output,
    PLATFORM_ID,
    Provider,
    signal,
    WritableSignal
} from '@angular/core';
import {
    BooleanInput,
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    RdxFloatingRootContext
} from '@radix-ng/primitives/core';
import {
    composedContains,
    FOCUS_GUARD_ATTR,
    provideRdxFocusScopeConfig,
    RdxFocusScope,
    RdxFocusScopeConfig,
    RdxFocusScopeConfigToken
} from '@radix-ng/primitives/focus-scope';
import { markOthers } from './mark-others';

/**
 * How a popup was opened / closed (Base UI `InteractionType`). `null` = a **programmatic** open (prefer
 * the previously-focused element); `''` = an **unknown** interaction. The two are deliberately distinct
 * (Base UI keys `preferPreviousFocus = openInteractionType == null` off exactly this).
 */
export type RdxInteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '' | null;

/** A focus target: an element, a getter, or `null`. */
export type RdxFocusTarget = HTMLElement | (() => HTMLElement | null) | null;

/** `initialFocus` policy (ADR 0017 §2) — a target or a callback receiving the **open** interaction type. */
export type RdxInitialFocus = RdxFocusTarget | ((openInteractionType: RdxInteractionType) => RdxFocusTarget);

/** `returnFocus` policy (ADR 0017 §2) — a target/boolean or a callback receiving the **close** interaction type. */
export type RdxReturnFocus =
    | RdxFocusTarget
    | boolean
    | ((closeInteractionType: RdxInteractionType) => RdxFocusTarget | boolean);

/** Resolves an {@link RdxFocusTarget} (element | getter | null) to a concrete element. */
export function resolveFocusTarget(target: RdxFocusTarget): HTMLElement | null {
    return typeof target === 'function' ? target() : target;
}

/**
 * Resolves an {@link RdxInitialFocus} policy against how the popup opened.
 */
export function resolveInitialFocus(
    policy: RdxInitialFocus,
    openInteractionType: RdxInteractionType
): HTMLElement | null {
    return resolveFocusTarget(typeof policy === 'function' ? policy(openInteractionType) : policy);
}

/**
 * Resolves an {@link RdxReturnFocus} policy against how the popup closed. `false` = do not return focus;
 * `true` = the default (return to the previously-focused element); an element = return there.
 */
export function resolveReturnFocus(
    policy: RdxReturnFocus,
    closeInteractionType: RdxInteractionType
): HTMLElement | boolean | null {
    const resolved = typeof policy === 'function' ? policy(closeInteractionType) : policy;
    return typeof resolved === 'boolean' ? resolved : resolveFocusTarget(resolved);
}

/**
 * DI seam for a **composing primitive** (Dialog / Popover / Menu) to drive the manager's gates from its
 * own root context instead of template-bound inputs (which a primitive cannot set). Each field falls
 * back to the manager's input, then to the documented default. Mirrors {@link RdxFocusScopeConfig}.
 */
export interface RdxFloatingFocusManagerConfig {
    modal?: () => boolean;
    enabled?: () => boolean;
    closeOnFocusOut?: () => boolean;
}

export const RDX_FLOATING_FOCUS_MANAGER_CONFIG = new InjectionToken<RdxFloatingFocusManagerConfig>(
    'RdxFloatingFocusManagerConfig'
);

/** Provides a {@link RdxFloatingFocusManagerConfig} for an enclosing primitive's focus manager. */
export function provideFloatingFocusManagerConfig(factory: () => RdxFloatingFocusManagerConfig): Provider {
    return { provide: RDX_FLOATING_FOCUS_MANAGER_CONFIG, useFactory: factory };
}

/** Coerces a boolean-ish input while preserving `undefined` ("not set" → fall back to the config). */
function coerceOptionalBoolean(value: BooleanInput | undefined): boolean | undefined {
    return value === undefined ? undefined : booleanAttribute(value);
}

/**
 * Provides a {@link RdxFocusScopeConfig} whose `trapped` is a **writable** signal, so the enclosing
 * {@link RdxFloatingFocusManager} can drive it from its `modal`/`enabled` policy after construction. The
 * factory has **no** dependency on the manager instance, so it cannot deadlock the host-directive
 * construction order (the manager later injects this same config and writes the signal).
 */
function provideManagedFocusScopeConfig(): Provider {
    return provideRdxFocusScopeConfig((): RdxFocusScopeConfig => ({ trapped: signal(false) }));
}

/**
 * `RdxFloatingFocusManager` (ADR 0017 Phase 1b skeleton) — the Angular counterpart of Base UI's
 * `FloatingFocusManager`. It is a **coordinator** that composes three low-level focus parts (it never
 * inherits them, which would re-fuse trap + popup policy): the **reworked {@link RdxFocusScope}** (the
 * trap, via `hostDirectives`), the portal-focus bridge, and owner-`Document` guards. Per ADR 0017 §1/§2
 * its policies are **independent**, none derived from `modal`.
 *
 * **This skeleton wires the composition + lifecycle gates:**
 * - `enabled` — the manager's active-ness (`mounted && !hover-open`). When off, **no trap** (and, later,
 *   no aria-hidden / no marker — Phase 2).
 * - `modal` → `RdxFocusScope.trapped`: the effective trap is `enabled() && modal()`, pushed into the
 *   composed focus scope through its config token (the composition seam).
 * - `loop` is forwarded to `RdxFocusScope`.
 * - `initialFocus` / `returnFocus` are **typed** here (the §2 policy contract, incl. the interaction-type
 *   callback forms); their full orchestration + the portal-bridge wiring + close-on-focus-out land in
 *   later phases.
 */
@Directive({
    selector: '[rdxFloatingFocusManager]',
    exportAs: 'rdxFloatingFocusManager',
    hostDirectives: [{ directive: RdxFocusScope, inputs: ['loop'] }],
    providers: [provideManagedFocusScopeConfig()]
})
export class RdxFloatingFocusManager {
    /** Manager active-ness (ADR 0017 §2): the popup is mounted **and** not hover-opened. */
    readonly enabled = input(undefined, { transform: coerceOptionalBoolean });

    /** Modal popup → focus trap. Combined with `enabled` to drive the composed `RdxFocusScope`. */
    readonly modal = input(undefined, { transform: coerceOptionalBoolean });

    /** Where focus goes when the popup opens (ADR 0017 §2). */
    readonly initialFocus = input<RdxInitialFocus>(null);

    /** Where focus returns when the popup closes (ADR 0017 §2). */
    readonly returnFocus = input<RdxReturnFocus>(true);

    /**
     * Whether a **non-modal** popup closes when focus leaves to an unrelated node (Base UI
     * `closeOnFocusOut`, default `true`; Dialog sets it to `!disablePointerDismissal`). Modal popups
     * never close on focus-out (the trap keeps focus in).
     */
    readonly closeOnFocusOut = input(undefined, { transform: coerceOptionalBoolean });

    /**
     * Emitted when focus leaves a non-modal popup to a node **unrelated** to the floating tree (ADR 0017
     * §3) — the consumer should close the popup. This is the focus-manager's focus-out close (it reads
     * the shared tree), replacing the dismissal capability's focus-out at the ADR 0015 Phase-4 cutover.
     */
    readonly focusOut = output<FocusEvent>();

    /** Optional DI config a composing primitive provides to drive the gates (input wins over config). */
    private readonly config = inject(RDX_FLOATING_FOCUS_MANAGER_CONFIG, { optional: true });

    /** Effective gates: `input ?? config ?? default`. */
    readonly effectiveEnabled = computed(() => this.enabled() ?? this.config?.enabled?.() ?? true);
    readonly effectiveModal = computed(() => this.modal() ?? this.config?.modal?.() ?? false);
    readonly effectiveCloseOnFocusOut = computed(
        () => this.closeOnFocusOut() ?? this.config?.closeOnFocusOut?.() ?? true
    );

    /** The effective trap state the composed `RdxFocusScope` reads via its config token. */
    readonly trapped = computed(() => this.effectiveEnabled() && this.effectiveModal());

    // The config this directive provides — its `trapped` signal is writable so we can drive it.
    private readonly focusScopeConfig = inject(RdxFocusScopeConfigToken) as { trapped: WritableSignal<boolean> };

    private readonly host = inject(ElementRef).nativeElement as HTMLElement;
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    /** The shared per-popup context (open / triggers / elements), if a primitive root provides one. */
    private readonly rootContext = inject(RDX_FLOATING_ROOT_CONTEXT, { optional: true });
    /** The registration handle for this node, used to read the shared tree (ancestors / descendants). */
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });

    private readonly _interactionType = signal<RdxInteractionType>('');
    /** How the popup was most recently interacted with — fed to the initial/return focus policy callbacks. */
    readonly interactionType = this._interactionType.asReadonly();

    constructor() {
        effect(() => this.focusScopeConfig.trapped.set(this.trapped()));

        if (!this.isBrowser) {
            return; // SSR: no DOM marking / listeners.
        }

        // Marker pass (ADR 0017 §3) — applied to outside elements whenever the manager is **active**,
        // independent of `modal`. Read by ADR 0015's outside-press guard.
        effect((onCleanup) => {
            if (!this.effectiveEnabled()) {
                return;
            }
            onCleanup(markOthers(this.avoidElements(), { ariaHidden: false, mark: true }));
        });

        // Modal isolation pass (ADR 0017 §3 / finding #4) — apply the real `inert` attribute to outside
        // elements for a modal popup. `inert` is non-interactive **and** a11y-hidden in one, so it both
        // replaces the old global `body { pointer-events: none }` lock (now scoped to siblings of the
        // popup's ancestor chain — independent overlays at a higher layer keep working) and supplies the
        // AT isolation the separate `aria-hidden` pass used to. Non-modal popups (Select / Menu root) get
        // none.
        effect((onCleanup) => {
            if (!this.effectiveEnabled() || !this.effectiveModal()) {
                return;
            }
            onCleanup(markOthers(this.avoidElements(), { inert: true, mark: false }));
        });

        this.trackInteractionType();
        this.wireCloseOnFocusOut();
        this.wireFocusOrchestration();
    }

    /** Records the most recent open/close interaction (pointer type or keyboard) for the focus policies. */
    private trackInteractionType(): void {
        const ownerDocument = this.host.ownerDocument;
        const onPointer = (event: Event): void => {
            this._interactionType.set(((event as PointerEvent).pointerType || 'mouse') as RdxInteractionType);
        };
        const onKey = (): void => this._interactionType.set('keyboard');

        ownerDocument.addEventListener('pointerdown', onPointer, true);
        ownerDocument.addEventListener('keydown', onKey, true);
        inject(DestroyRef).onDestroy(() => {
            ownerDocument.removeEventListener('pointerdown', onPointer, true);
            ownerDocument.removeEventListener('keydown', onKey, true);
        });
    }

    /**
     * Initial-focus orchestration (ADR 0017 §2). The manager owns the focus *policy*; it intercepts the
     * composed {@link RdxFocusScope}'s preventable `mountAutoFocus` (its designed extension point) and
     * applies the `initialFocus` policy, falling back to the scope's first-tabbable default when the
     * policy is `null`.
     *
     * @remarks `returnFocus` is **typed** ({@link resolveReturnFocus}) but not orchestrated here:
     * overriding the scope's return-focus would mean intercepting `unmountAutoFocus`, which fires during
     * teardown after the output subscription is already torn down (unreliable). A robust `returnFocus`
     * override is deferred to the Phase-4 integration, where the manager can own return-focus directly.
     */
    private wireFocusOrchestration(): void {
        const focusScope = inject(RdxFocusScope);

        focusScope.mountAutoFocus.subscribe((event) => {
            const interactionType = this._interactionType();
            const target =
                resolveInitialFocus(this.initialFocus(), interactionType) ?? this.defaultInitialFocus(interactionType);
            if (target) {
                event.preventDefault(); // override the scope's first-tabbable default
                target.focus();
            }
        });
    }

    /**
     * Base UI's `defaultInitialFocus`: on a **touch** open, focus the popup itself instead of its first
     * tabbable control, so a soft keyboard (Android) does not pop up over the popup. Any other interaction
     * returns `null`, keeping the focus scope's first-tabbable default. The popup is made programmatically
     * focusable (`tabindex="-1"`) if it isn't already.
     */
    private defaultInitialFocus(interactionType: RdxInteractionType): HTMLElement | null {
        if (interactionType !== 'touch') {
            return null;
        }
        const popup = (this.rootContext?.floatingElement ?? this.host) as HTMLElement;
        if (!popup.hasAttribute('tabindex')) {
            popup.setAttribute('tabindex', '-1');
        }
        return popup;
    }

    /**
     * Close-on-focus-out (ADR 0017 §3): a **non-modal** active popup closes when focus moves to a node
     * unrelated to the floating tree — not the popup, its trigger(s), a focus guard, or an ancestor /
     * descendant popup — and not during a pointer press (a drag must not close it). Mirrors Base UI's
     * `FloatingFocusManager` `!modal` branch (`movedToUnrelatedNode`).
     */
    private wireCloseOnFocusOut(): void {
        const ownerDocument = this.host.ownerDocument;
        let pointerDown = false;

        const onPointerDown = (): void => {
            pointerDown = true;
        };
        const onPointerUp = (): void => {
            pointerDown = false;
        };
        const onFocusOut = (event: FocusEvent): void => {
            if (!this.effectiveEnabled() || !this.effectiveCloseOnFocusOut() || this.effectiveModal() || pointerDown) {
                return;
            }
            const relatedTarget = event.relatedTarget as Node | null;
            if (!relatedTarget) {
                return; // focus left to nothing (tab-away / window blur) — let the browser handle it
            }
            if (relatedTarget instanceof Element && relatedTarget.hasAttribute(FOCUS_GUARD_ATTR)) {
                return; // moved onto a focus guard — still inside the focus system
            }
            if (this.isRelatedTargetInside(relatedTarget)) {
                return; // moved to a related node (trigger / ancestor / descendant) — keep open
            }
            this.focusOut.emit(event);
        };

        ownerDocument.addEventListener('pointerdown', onPointerDown, true);
        ownerDocument.addEventListener('pointerup', onPointerUp, true);
        ownerDocument.addEventListener('focusout', onFocusOut, true);

        inject(DestroyRef).onDestroy(() => {
            ownerDocument.removeEventListener('pointerdown', onPointerDown, true);
            ownerDocument.removeEventListener('pointerup', onPointerUp, true);
            ownerDocument.removeEventListener('focusout', onFocusOut, true);
        });
    }

    /**
     * The `markOthers` keep-set: this manager's own host **plus** any extra root elements the layer owns
     * (e.g. a Dialog backdrop relocated as a separate body sibling, registered on the root context). Using
     * only `[host]` would wrongly mark those sibling roots as outside content.
     */
    private avoidElements(): Element[] {
        const extra = this.rootContext ? [...this.rootContext.floatingElements] : [];
        return [this.host, ...extra.filter((element) => element !== this.host)];
    }

    /** Whether `relatedTarget` is inside the popup, its trigger(s), or an ancestor / descendant popup. */
    private isRelatedTargetInside(relatedTarget: Node): boolean {
        const floating = this.rootContext?.floatingElement ?? this.host;
        if (composedContains(floating, relatedTarget)) {
            return true;
        }
        if (this.rootContext && this.contextContains(this.rootContext, relatedTarget)) {
            return true;
        }

        const node = this.registration?.node() ?? null;
        if (node) {
            for (const ancestor of node.tree.ancestors(node)) {
                if (ancestor.context && this.contextContains(ancestor.context, relatedTarget)) {
                    return true;
                }
            }
            for (const child of node.tree.children(node, { onlyOpen: true })) {
                if (child.context && this.contextContains(child.context, relatedTarget)) {
                    return true;
                }
            }
        }
        return false;
    }

    private contextContains(context: RdxFloatingRootContext, relatedTarget: Node): boolean {
        if (context.floatingElement && composedContains(context.floatingElement, relatedTarget)) {
            return true;
        }
        if (context.referenceElement && composedContains(context.referenceElement, relatedTarget)) {
            return true;
        }
        return context.triggers.contains(relatedTarget);
    }
}
