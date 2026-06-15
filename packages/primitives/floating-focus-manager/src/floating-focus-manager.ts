import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    Provider,
    signal,
    WritableSignal
} from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import {
    provideRdxFocusScopeConfig,
    RdxFocusScope,
    RdxFocusScopeConfig,
    RdxFocusScopeConfigToken
} from '@radix-ng/primitives/focus-scope';

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
    readonly enabled = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** Modal popup → focus trap. Combined with `enabled` to drive the composed `RdxFocusScope`. */
    readonly modal = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Where focus goes when the popup opens (ADR 0017 §2). */
    readonly initialFocus = input<RdxInitialFocus>(null);

    /** Where focus returns when the popup closes (ADR 0017 §2). */
    readonly returnFocus = input<RdxReturnFocus>(true);

    /** The effective trap state the composed `RdxFocusScope` reads via its config token. */
    readonly trapped = computed(() => this.enabled() && this.modal());

    // The config this directive provides — its `trapped` signal is writable so we can drive it.
    private readonly focusScopeConfig = inject(RdxFocusScopeConfigToken) as { trapped: WritableSignal<boolean> };

    constructor() {
        effect(() => this.focusScopeConfig.trapped.set(this.trapped()));
    }
}
