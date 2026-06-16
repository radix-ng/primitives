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

/** `initialFocus` policy (ADR 0017 §2) — a target, `false`, or an open-interaction callback. */
export type RdxInitialFocus =
    | RdxFocusTarget
    | false
    | ((openInteractionType: RdxInteractionType) => RdxFocusTarget | false);

/** `returnFocus` policy (ADR 0017 §2) — a target/boolean or a callback receiving the **close** interaction type. */
export type RdxReturnFocus =
    | RdxFocusTarget
    | boolean
    | ((closeInteractionType: RdxInteractionType) => RdxFocusTarget | boolean);

/** Normalizes a DOM event into Base UI-like interaction intent for focus policy decisions. */
export function getInteractionTypeFromEvent(event?: Event): RdxInteractionType {
    if (!event) {
        return null;
    }

    if (typeof KeyboardEvent !== 'undefined' && event instanceof KeyboardEvent) {
        return 'keyboard';
    }

    if ('pointerType' in event && typeof event.pointerType === 'string') {
        return (event.pointerType || 'mouse') as RdxInteractionType;
    }

    if (typeof MouseEvent !== 'undefined' && event instanceof MouseEvent) {
        return event.detail === 0 ? 'keyboard' : 'mouse';
    }

    return '';
}

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
): HTMLElement | null | false {
    const resolved = typeof policy === 'function' ? policy(openInteractionType) : policy;
    return resolved === false ? false : resolveFocusTarget(resolved);
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
    inert?: () => boolean;
    enabled?: () => boolean;
    closeOnFocusOut?: () => boolean;
    initialFocus?: () => RdxInitialFocus;
    returnFocus?: () => RdxReturnFocus;
    openInteractionType?: () => RdxInteractionType;
    closeInteractionType?: () => RdxInteractionType;
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
 * - `initialFocus` / `returnFocus` are **orchestrated** here (the §2 policy contract, incl. the
 *   interaction-type callback forms): `initialFocus` via the scope's `mountAutoFocus` hook, `returnFocus`
 *   via the scope's `returnFocus` config seam (resolved at the scope's queued post-unmount frame). The
 *   portal-focus bridge remains a later-phase dependency.
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

    /**
     * Whether outside elements receive the real `inert` attribute. Defaults to the effective `modal` value,
     * but primitives can split focus trapping from pointer/AT isolation (Base UI `modal="trap-focus"`).
     */
    readonly inert = input(undefined, { transform: coerceOptionalBoolean });

    /** Where focus goes when the popup opens (ADR 0017 §2). */
    readonly initialFocus = input<RdxInitialFocus | undefined>(undefined);

    /** Where focus returns when the popup closes (ADR 0017 §2). */
    readonly returnFocus = input<RdxReturnFocus | undefined>(undefined);

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
    readonly effectiveInert = computed(() => this.inert() ?? this.config?.inert?.() ?? this.effectiveModal());
    readonly effectiveCloseOnFocusOut = computed(
        () => this.closeOnFocusOut() ?? this.config?.closeOnFocusOut?.() ?? true
    );
    readonly effectiveInitialFocus = computed(() =>
        this.initialFocus() !== undefined ? this.initialFocus()! : (this.config?.initialFocus?.() ?? null)
    );
    readonly effectiveReturnFocus = computed(() =>
        this.returnFocus() !== undefined ? this.returnFocus()! : (this.config?.returnFocus?.() ?? true)
    );
    readonly effectiveOpenInteractionType = computed(
        () => this.config?.openInteractionType?.() ?? this._interactionType()
    );
    readonly effectiveCloseInteractionType = computed(
        () => this.config?.closeInteractionType?.() ?? this._interactionType()
    );

    /** The effective trap state the composed `RdxFocusScope` reads via its config token. */
    readonly trapped = computed(() => this.effectiveEnabled() && this.effectiveModal());

    // The config this directive provides — its `trapped` signal is writable so we can drive it, and we
    // attach a `returnFocus` resolver the composed focus scope calls at unmount (ADR 0017 `returnFocus`).
    private readonly focusScopeConfig = inject(RdxFocusScopeConfigToken) as {
        trapped: WritableSignal<boolean>;
        returnFocus?: () => HTMLElement | false | undefined;
    };

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

        // Own the return-focus *target* (the composed focus scope owns the *timing*): the scope calls this
        // in its queued post-unmount frame, resolving the `returnFocus` policy against the close interaction.
        this.focusScopeConfig.returnFocus = () => this.resolveReturnFocusTarget();

        if (!this.isBrowser) {
            return; // SSR: no DOM marking / listeners.
        }

        // Marker pass (ADR 0017 §3) — applied to outside elements while the manager is active **and the
        // popup is open**, independent of `modal`. Read by ADR 0015's outside-press guard.
        effect((onCleanup) => {
            if (!this.effectiveEnabled() || !this.isFloatingOpen()) {
                return;
            }
            onCleanup(markOthers(this.avoidElements(), { ariaHidden: false, mark: true }));
        });

        // Pointer/AT isolation pass — apply the real `inert` attribute to outside elements only when the
        // composing primitive asks for outside interaction to be blocked. This is intentionally separate from
        // focus trapping: Base UI `modal="trap-focus"` traps focus but leaves outside pointer interaction
        // enabled.
        effect((onCleanup) => {
            if (!this.effectiveEnabled() || !this.isFloatingOpen() || !this.effectiveInert()) {
                return;
            }
            onCleanup(markOthers(this.avoidElements(), { inert: true, mark: false }));
        });

        this.trackInteractionType();
        this.wireCloseOnFocusOut();
        this.wireFocusOrchestration();
        this.wireInitialFocusFallback();
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
     * policy is `null`. (`returnFocus` is orchestrated separately via the config seam — see
     * {@link resolveReturnFocusTarget} — because it must run during the scope's queued *post-unmount* frame.)
     */
    private wireFocusOrchestration(): void {
        const focusScope = inject(RdxFocusScope);

        focusScope.mountAutoFocus.subscribe((event) => {
            const interactionType = this.effectiveOpenInteractionType();
            const target =
                resolveInitialFocus(this.effectiveInitialFocus(), interactionType) ??
                this.defaultInitialFocus(interactionType);
            if (target === false) {
                event.preventDefault();
                return;
            }
            if (target) {
                event.preventDefault(); // override the scope's first-tabbable default
                target.focus();
            }
        });
    }

    /**
     * Resolves the {@link returnFocus} policy against the **close** interaction type for the composed
     * focus scope to apply at unmount (ADR 0017 §2). Mirrors Base UI's `getReturnElement`:
     * - `false` → `false` (the scope suppresses return-focus);
     * - `true` / `null` → `undefined` (the scope's default — return to the element focused before mount);
     * - an element (direct or from a callback) → that element (returned **explicitly**, bypassing the
     *   "focus moved elsewhere" guard).
     */
    private resolveReturnFocusTarget(): HTMLElement | false | undefined {
        const resolved = resolveReturnFocus(this.effectiveReturnFocus(), this.effectiveCloseInteractionType());
        if (resolved === false) {
            return false;
        }
        if (resolved === true || resolved == null) {
            return undefined;
        }
        return resolved;
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
     * Manager-owned post-open fallback. Some popup types open from a trigger event that fired before the
     * manager existed, and some policies resolve their final target only after a couple of renders. Re-run
     * the initial-focus policy for a few animation frames while the popup is open so the target can settle.
     */
    private wireInitialFocusFallback(): void {
        effect(() => {
            if (!this.effectiveEnabled() || !this.isFloatingOpen()) {
                return;
            }

            this.scheduleInitialFocusFallback();
        });
    }

    private scheduleInitialFocusFallback(attempt = 0): void {
        const view = this.host.ownerDocument.defaultView ?? globalThis;
        view.requestAnimationFrame(() => this.applyInitialFocusFallback(attempt));
    }

    private applyInitialFocusFallback(attempt: number): void {
        if (!this.effectiveEnabled() || !this.isFloatingOpen()) {
            return;
        }

        const popup = (this.rootContext?.floatingElement ?? this.host) as HTMLElement;
        const activeElement = this.host.ownerDocument.activeElement;

        if (activeElement instanceof HTMLElement && popup.contains(activeElement)) {
            return;
        }

        const interactionType = this.effectiveOpenInteractionType();
        const resolved = resolveInitialFocus(this.effectiveInitialFocus(), interactionType);
        if (resolved === false) {
            return;
        }

        const target = resolved ?? this.defaultInitialFocus(interactionType);
        if (target && activeElement !== target) {
            target.focus({ preventScroll: true });
        }

        if (attempt < 2) {
            this.scheduleInitialFocusFallback(attempt + 1);
        }
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
     * The marker keep-set is intentionally narrow: the popup/focus host only. Own sibling roots such as a
     * user backdrop are DOM-footprint bookkeeping, not marker keep-set members.
     */
    private avoidElements(): Element[] {
        return [this.host];
    }

    private isFloatingOpen(): boolean {
        return this.rootContext?.open() ?? true;
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
