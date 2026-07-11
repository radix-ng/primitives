import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    InjectionToken,
    input,
    model,
    ModelSignal,
    output,
    OutputEmitterRef,
    Provider,
    signal,
    Signal
} from '@angular/core';
import { injectNgControlState, RdxNgControlState } from '../accessor/ng-control-state';
import { BooleanInput } from '../types';
import { RdxValidationError } from './form-control';

/**
 * Optional form-control UI state derived from a control's `invalid`/`pending`/`errors`/`touched`/`dirty`
 * inputs (the optional members of Signal Forms' `FormUiControl`), plus the two mutators every
 * control needs.
 *
 * @see createFormUiState
 */
export interface RdxFormUiState {
    /** Invalid when the `invalid` input is set or the `errors` list is non-empty. */
    readonly invalidState: Signal<boolean>;
    /** Whether asynchronous validation is still settling. Pending is neither valid nor invalid. */
    readonly pendingState: Signal<boolean>;
    /** Tri-state validity: valid / invalid / neutral while pending or disabled. */
    readonly validState: Signal<boolean | null>;
    /** Explicit control errors merged with same-host Angular Forms errors. */
    readonly errorsState: Signal<readonly RdxValidationError[]>;
    /** Whether the control has been touched (reflects the `touched` model). */
    readonly touchedState: Signal<boolean>;
    /** Whether the value changed from its initial value — external `dirty` OR internal tracking. */
    readonly dirtyState: Signal<boolean>;
    /** Mark the control touched: bridges the CVA (if any) + sets the `touched` model + emits `touch`. */
    markAsTouched(): void;
    /** Flag the control dirty after a value change (feeds {@link dirtyState}). */
    markDirty(): void;
    /** Clear control-owned touched/dirty state when a form resets it. */
    resetInteractionState?(): void;
    /** Clear only control-owned dirty state when the form marks the field pristine. */
    resetDirtyState?(): void;
}

/** Minimal `ControlValueAccessor` surface the form-UI state bridges for the dual (Reactive/template) path. */
export interface RdxFormUiTouchTarget {
    markAsTouched(): void;
}

/** Inputs a control passes to {@link createFormUiState} — its own `FormUiControl` signals. */
export interface RdxFormUiStateOptions {
    readonly invalid: Signal<boolean>;
    /** Optional for backwards compatibility with custom controls authored before pending support. */
    readonly pending?: Signal<boolean>;
    readonly errors: Signal<readonly RdxValidationError[]>;
    readonly touched: ModelSignal<boolean>;
    readonly touch: OutputEmitterRef<void>;
    readonly dirty: Signal<boolean>;
    /** Same-host Reactive/template-driven form interaction state, when one is present. */
    readonly ngControlState?: RdxNgControlState | null;
    /**
     * The control's `ControlValueAccessor`, if it has one (dual controls — switch, number-field, …).
     * Omit or pass `null` for Signal-Forms-only controls without a CVA (e.g. date-field).
     */
    readonly cva?: RdxFormUiTouchTarget | null;
}

/**
 * Builds the shared form-UI state and its mutators from a control's input signals, removing the
 * per-control copy-paste of the validation/interaction computeds and the `markAsTouched`/`markDirty`
 * logic.
 *
 * **Why the inputs stay on the control (not in here):** Angular's compiler only discovers
 * `input()`/`model()` declared as field initializers, and Signal Forms binds form-written state
 * (`errors`/`disabled`/`touched`) onto the single directive that carries the `value`/`checked`
 * model — so the inputs must co-locate with `value` on the control directive. This helper takes
 * those signals and centralizes only the derivation.
 *
 * Safe to call from a field initializer: `signal()`/`computed()` need no injection context.
 */
export function createFormUiState(options: RdxFormUiStateOptions): RdxFormUiState {
    const dirtyValue = signal(false);
    const errorsState = computed(() => {
        const ownErrors = options.errors() ?? [];
        const ngControlErrors = options.ngControlState?.connected() ? options.ngControlState.errors() : [];
        return ngControlErrors.length > 0 ? [...ownErrors, ...ngControlErrors] : ownErrors;
    });
    const invalidState = computed(
        () =>
            options.invalid() ||
            errorsState().length > 0 ||
            Boolean(options.ngControlState?.connected() && options.ngControlState.invalid())
    );
    const pendingState = computed(
        () =>
            (options.pending?.() ?? false) ||
            Boolean(options.ngControlState?.connected() && options.ngControlState.pending())
    );
    const validState = computed<boolean | null>(() => {
        if (pendingState()) {
            return null;
        }
        if (invalidState()) {
            return false;
        }
        if (options.ngControlState?.connected() && options.ngControlState.disabled()) {
            return null;
        }
        return true;
    });

    return {
        invalidState,
        pendingState,
        validState,
        errorsState,
        touchedState: computed(() =>
            options.ngControlState?.connected() ? options.ngControlState.touched() : options.touched()
        ),
        dirtyState: computed(() =>
            options.ngControlState?.connected() ? options.ngControlState.dirty() : options.dirty() || dirtyValue()
        ),
        markDirty: () => dirtyValue.set(true),
        markAsTouched: () => {
            options.cva?.markAsTouched();
            options.touched.set(true);
            options.touch.emit();
        },
        resetInteractionState: () => {
            options.touched.set(false);
            dirtyValue.set(false);
        },
        resetDirtyState: () => dirtyValue.set(false)
    };
}

/**
 * The subset of a compound primitive's context that surfaces the shared form-UI state to its child
 * parts (so a trigger/button/input can reflect `data-invalid`/`data-touched`/`data-dirty` and call
 * `markAsTouched()`). Compound-control context interfaces should `extends` this.
 */
export interface RdxFormUiStateContext {
    invalidState: Signal<boolean>;
    pendingState: Signal<boolean>;
    validState: Signal<boolean | null>;
    touchedState: Signal<boolean>;
    dirtyState: Signal<boolean>;
    markAsTouched: () => void;
}

/** Spread helper to wire {@link RdxFormUiStateContext} fields from an {@link RdxFormUiState} into a context factory. */
export function formUiStateContext(state: RdxFormUiState): RdxFormUiStateContext {
    return {
        invalidState: state.invalidState,
        pendingState: state.pendingState,
        validState: state.validState,
        touchedState: state.touchedState,
        dirtyState: state.dirtyState,
        markAsTouched: () => state.markAsTouched()
    };
}

/** DI token holding the control's {@link RdxFormUiState}, read by {@link RdxFormUiStateHost}. */
export const RDX_FORM_UI_STATE = new InjectionToken<RdxFormUiState>('RdxFormUiState');

/**
 * Tri-state *displayed* validity (`true` valid / `false` invalid / `null` neutral) an enclosing `Field`
 * exposes so a control can reflect the field's single, gated display-state instead of its own eager
 * invalid. A control inside a `rdxFieldRoot` reads this for its `data-valid` / `data-invalid` /
 * `aria-invalid`; standalone (token absent) it falls back to its own binary invalidity. This keeps the
 * field root, the control, and any trigger/group part on one display-state (Base UI's `valid: boolean |
 * null`). `Field` provides it (`useFactory` over the root's `validState`).
 */
export const RDX_FIELD_VALIDITY = new InjectionToken<Signal<boolean | null>>('RdxFieldValidity');

/**
 * Tri-state display validity: when inside a `Field` the field's gated `validState` is the **single
 * source** (the control reflects it, including its `validationMode` neutral state); standalone, the
 * control's own tri-state validity (pending is neutral).
 *
 * **Contract:** inside a `Field` a control's own `invalid` / `errors` inputs are **not** displayed — the
 * Field owns displayed validity. Drive validity through the Field instead: bind `rdxSignalField`
 * (Signal Forms), or set `[invalid]` on `rdxFieldRoot`. The control's own `invalid`/`errors` are for
 * standalone use.
 */
export function resolveDisplayValid(
    fieldValidity: Signal<boolean | null> | null,
    ownInvalid: Signal<boolean>,
    ownPending?: Signal<boolean>
): boolean | null {
    if (fieldValidity) {
        return fieldValidity();
    }
    if (ownPending?.()) {
        return null;
    }
    return ownInvalid() ? false : true;
}

/**
 * Provide a control's {@link RdxFormUiState} on its host element so {@link RdxFormUiStateHost} can
 * reflect it. Pair with `hostDirectives: [RdxFormUiStateHost]`:
 *
 * ```ts
 * providers: [provideFormUiState(() => inject(MyControl).formUi)],
 * hostDirectives: [RdxFormUiStateHost]
 * ```
 */
export function provideFormUiState(state: () => RdxFormUiState): Provider {
    return { provide: RDX_FORM_UI_STATE, useFactory: state };
}

/**
 * Host directive that reflects a control's {@link RdxFormUiState} as the standard validation
 * `data-*`/`aria-invalid` attributes and marks the control touched on focus-out — the binding block
 * that was otherwise copy-pasted into every form control's `host`.
 *
 * Compose it via `hostDirectives` on a control (or group root) whose host element is the one that
 * should carry the attributes, and provide the state with {@link provideFormUiState}. It reads the
 * state from DI, so the control does not need to expose `invalidState`/`touchedState`/`dirtyState`
 * or a `markAsTouched` method just for the host bindings.
 *
 * Note: the `focusout` listener marks touched for controls whose touched-trigger is blur/focus-out
 * (text inputs, groups). Controls that latch touched on interaction instead (e.g. checkbox) still do
 * so themselves; the extra focus-out call only ever sets `touched` to `true`, so it is harmless.
 *
 * Not for compound controls that surface state on a child part via context (e.g. select reflects on
 * its trigger) — those keep their own child-part bindings.
 */
@Directive({
    host: {
        // Tri-state via the enclosing Field when present (neutral → neither data-valid nor data-invalid),
        // else the control's own binary invalidity. `touched`/`dirty` always reflect the control.
        '[attr.aria-invalid]': 'displayValid() === false ? "true" : undefined',
        '[attr.data-invalid]': 'displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'formUi.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'formUi.dirtyState() ? "" : undefined',
        '(focusout)': 'formUi.markAsTouched()'
    }
})
export class RdxFormUiStateHost {
    /** @ignore The injected state the host bindings read. */
    protected readonly formUi = inject(RDX_FORM_UI_STATE);
    private readonly fieldValidity = inject(RDX_FIELD_VALIDITY, { optional: true });

    /** @ignore Tri-state display validity (enclosing Field's gated state, else own invalidity). */
    protected readonly displayValid = computed(() =>
        this.fieldValidity ? this.fieldValidity() : this.formUi.validState()
    );
}

/**
 * Abstract base that declares the optional `FormUiControl` state inputs
 * (`invalid`/`pending`/`errors`/`touched`/`dirty` + the `touch` output) once and builds the control's
 * {@link RdxFormUiState} from them, so a control directive can inherit the whole surface with a
 * single `extends` instead of re-declaring it.
 *
 * The declarations must live on a decorated **directive class** (Angular only discovers
 * `input()`/`model()`/`output()` as field initializers, and Signal Forms binds form-written state
 * onto the single directive carrying the `value`/`checked` model) — inheritance keeps them on that
 * directive, which a host directive could not. The control still declares its own `value`/`checked`
 * model (the type-parametric part) and, for `data-*` reflection, either composes
 * {@link RdxFormUiStateHost} or binds the attributes itself.
 *
 * Dual controls override {@link formUiTouchTarget} to bridge their `ControlValueAccessor` into
 * `markAsTouched`.
 */
@Directive()
export abstract class RdxFormUiControlBase {
    /** Whether the control is invalid. A non-empty {@link errors} list also marks it invalid. */
    readonly invalid = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether async validation is pending. Pending controls publish neither `data-valid` nor `data-invalid`. */
    readonly pending = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether the control has been touched. A `model()` so Signal Forms can write it; set on blur/focus-out. */
    readonly touched = model<boolean>(false);

    /** Whether the value changed from its initial value. Merged with internal tracking. */
    readonly dirty = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Validation errors for the control. A non-empty list marks it invalid. */
    readonly errors = input<readonly RdxValidationError[]>([]);

    /** Emits when the control is touched, notifying Signal Forms (stable Angular 22 contract). */
    readonly touch = output<void>();

    private readonly ngControlState = injectNgControlState();

    /** The shared form-UI state derived from the inputs above. Call `formUi.markDirty()` on value change. */
    readonly formUi: RdxFormUiState = createFormUiState({
        invalid: this.invalid,
        pending: this.pending,
        errors: this.errors,
        touched: this.touched,
        touch: this.touch,
        dirty: this.dirty,
        ngControlState: this.ngControlState,
        cva: this.formUiTouchTarget()
    });

    /** Validation errors from the control inputs and a same-host Reactive/template-driven form control. */
    readonly validationErrors = this.formUi.errorsState;

    constructor() {
        // Reactive/template-driven forms own their NgControl interaction state. Signal Forms instead
        // writes the public touched/dirty members, so standalone controls retain the existing fallback.
        effect(
            () => {
                if (this.ngControlState.connected()) {
                    this.touched.set(this.ngControlState.touched());
                    if (!this.ngControlState.dirty()) {
                        this.formUi.resetDirtyState?.();
                    }
                    return;
                }

                if (!this.dirty()) {
                    this.formUi.resetDirtyState?.();
                }
            },
            { debugName: 'RdxFormUiControlBase.syncInteractionState' }
        );
    }

    /** The enclosing Field's tri-state display validity, if any. `protected` so a control whose own
     * invalidity is richer than `formUi.invalidState` (e.g. date/time-field add a parse check) can build
     * its own `displayValid` from it. */
    protected readonly fieldValidity = inject(RDX_FIELD_VALIDITY, { optional: true });

    /**
     * Tri-state *displayed* validity for controls that bind their own host attributes (radio, switch,
     * number-field): the enclosing Field's gated state when inside a `rdxFieldRoot`, else this control's
     * own validity (`formUi.pendingState` is neutral; otherwise `formUi.invalidState` is binary). Bind
     * `data-valid`/`data-invalid`/`aria-invalid` to
     * this so a neutral field shows neither. Controls whose `invalidState` is richer than
     * `formUi.invalidState` override this with
     * `resolveDisplayValid(this.fieldValidity, this.invalidState, this.formUi.pendingState)`.
     */
    readonly displayValid: Signal<boolean | null> = computed(() =>
        this.fieldValidity ? this.fieldValidity() : this.formUi.validState()
    );

    /**
     * Override to bridge the control's `ControlValueAccessor` into `markAsTouched` (dual controls —
     * return `injectControlValueAccessor()` or a `{ markAsTouched }` adapter). Default: no CVA
     * (Signal-Forms-only controls such as date-field).
     */
    protected formUiTouchTarget(): RdxFormUiTouchTarget | null {
        return null;
    }

    /**
     * Reset control-owned interaction state. Angular Signal Forms calls this optional custom-control
     * hook from `FieldState.reset()` after restoring the field value.
     */
    reset(): void {
        this.formUi.resetInteractionState?.();
    }
}
