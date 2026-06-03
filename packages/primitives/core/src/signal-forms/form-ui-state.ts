import { BooleanInput } from '../types';
import { RdxValidationError } from './form-control';
import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    InjectionToken,
    input,
    model,
    ModelSignal,
    output,
    OutputEmitterRef,
    Provider,
    Signal,
    signal
} from '@angular/core';

/**
 * Optional form-control UI state derived from a control's `invalid`/`errors`/`touched`/`dirty`
 * inputs (the optional members of Signal Forms' `FormUiControl`), plus the two mutators every
 * control needs.
 *
 * @see createFormUiState
 */
export interface RdxFormUiState {
    /** Invalid when the `invalid` input is set or the `errors` list is non-empty. */
    readonly invalidState: Signal<boolean>;
    /** Whether the control has been touched (reflects the `touched` model). */
    readonly touchedState: Signal<boolean>;
    /** Whether the value changed from its initial value — external `dirty` OR internal tracking. */
    readonly dirtyState: Signal<boolean>;
    /** Mark the control touched: bridges the CVA (if any) + sets the `touched` model + emits `touch`. */
    markAsTouched(): void;
    /** Flag the control dirty after a value change (feeds {@link dirtyState}). */
    markDirty(): void;
}

/** Minimal `ControlValueAccessor` surface the form-UI state bridges for the dual (Reactive/template) path. */
export interface RdxFormUiTouchTarget {
    markAsTouched(): void;
}

/** Inputs a control passes to {@link createFormUiState} — its own `FormUiControl` signals. */
export interface RdxFormUiStateOptions {
    readonly invalid: Signal<boolean>;
    readonly errors: Signal<readonly RdxValidationError[]>;
    readonly touched: ModelSignal<boolean>;
    readonly touch: OutputEmitterRef<void>;
    readonly dirty: Signal<boolean>;
    /**
     * The control's `ControlValueAccessor`, if it has one (dual controls — switch, number-field, …).
     * Omit or pass `null` for Signal-Forms-only controls without a CVA (e.g. select).
     */
    readonly cva?: RdxFormUiTouchTarget | null;
}

/**
 * Builds the shared form-UI state and its mutators from a control's input signals, removing the
 * per-control copy-paste of the `invalidState`/`touchedState`/`dirtyState` computeds and the
 * `markAsTouched`/`markDirty` logic.
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

    return {
        invalidState: computed(() => options.invalid() || (options.errors()?.length ?? 0) > 0),
        touchedState: computed(() => options.touched()),
        dirtyState: computed(() => options.dirty() || dirtyValue()),
        markDirty: () => dirtyValue.set(true),
        markAsTouched: () => {
            options.cva?.markAsTouched();
            options.touched.set(true);
            options.touch.emit();
        }
    };
}

/**
 * The subset of a compound primitive's context that surfaces the shared form-UI state to its child
 * parts (so a trigger/button/input can reflect `data-invalid`/`data-touched`/`data-dirty` and call
 * `markAsTouched()`). Compound-control context interfaces should `extends` this.
 */
export interface RdxFormUiStateContext {
    invalidState: Signal<boolean>;
    touchedState: Signal<boolean>;
    dirtyState: Signal<boolean>;
    markAsTouched: () => void;
}

/** Spread helper to wire {@link RdxFormUiStateContext} fields from an {@link RdxFormUiState} into a context factory. */
export function formUiStateContext(state: RdxFormUiState): RdxFormUiStateContext {
    return {
        invalidState: state.invalidState,
        touchedState: state.touchedState,
        dirtyState: state.dirtyState,
        markAsTouched: () => state.markAsTouched()
    };
}

/** DI token holding the control's {@link RdxFormUiState}, read by {@link RdxFormUiStateHost}. */
export const RDX_FORM_UI_STATE = new InjectionToken<RdxFormUiState>('RdxFormUiState');

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
        '[attr.aria-invalid]': 'formUi.invalidState() ? "true" : undefined',
        '[attr.data-invalid]': 'formUi.invalidState() ? "" : undefined',
        '[attr.data-valid]': 'formUi.invalidState() ? undefined : ""',
        '[attr.data-touched]': 'formUi.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'formUi.dirtyState() ? "" : undefined',
        '(focusout)': 'formUi.markAsTouched()'
    }
})
export class RdxFormUiStateHost {
    /** @ignore The injected state the host bindings read. */
    protected readonly formUi = inject(RDX_FORM_UI_STATE);
}

/**
 * Abstract base that declares the optional `FormUiControl` state inputs
 * (`invalid`/`errors`/`touched`/`dirty` + the `touch` output) once and builds the control's
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

    /** Whether the control has been touched. A `model()` so Signal Forms can write it; set on blur/focus-out. */
    readonly touched = model<boolean>(false);

    /** Whether the value changed from its initial value. Merged with internal tracking. */
    readonly dirty = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Validation errors for the control. A non-empty list marks it invalid. */
    readonly errors = input<readonly RdxValidationError[]>([]);

    /** Emits when the control is touched, notifying Signal Forms (stable Angular 22 contract). */
    readonly touch = output<void>();

    /** The shared form-UI state derived from the inputs above. Call `formUi.markDirty()` on value change. */
    readonly formUi: RdxFormUiState = createFormUiState({
        invalid: this.invalid,
        errors: this.errors,
        touched: this.touched,
        touch: this.touch,
        dirty: this.dirty,
        cva: this.formUiTouchTarget()
    });

    /**
     * Override to bridge the control's `ControlValueAccessor` into `markAsTouched` (dual controls —
     * return `injectControlValueAccessor()` or a `{ markAsTouched }` adapter). Default: no CVA
     * (Signal-Forms-only controls such as select).
     */
    protected formUiTouchTarget(): RdxFormUiTouchTarget | null {
        return null;
    }
}
