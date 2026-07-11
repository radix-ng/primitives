import { InputSignal, InputSignalWithTransform, ModelSignal, OutputRef } from '@angular/core';

/**
 * Local mirror of Angular Signal Forms' control contracts
 * (`@angular/forms/signals`, stable in Angular 22).
 *
 * These interfaces intentionally do **not** import from `@angular/forms/signals`,
 * so control entries do not pull that optional integration into their public
 * dependency graph. Primitives can still declare `implements RdxFormValueControl<T>` /
 * `implements RdxFormCheckboxControl`; the mirror locks the public surface (the
 * required `value` / `checked` signal) and catches naming regressions on CI — e.g.
 * a rewrite renaming `value` → `modelValue` (as the slider once had) would no
 * longer type-check.
 *
 * Optional state types are widened only where Radix NG controls legitimately
 * differ from Angular's exact types (e.g. `input<string>()` produces
 * `string | undefined`, and boolean inputs carry a coercion transform).
 *
 * The real Angular types stay isolated in `@radix-ng/primitives/signal-forms`.
 * See ADR 0018 and `.claude/skills/project-knowledge/references/signal-forms-readiness.md`.
 */

/** An optional control-state member exposed as an Angular input signal (with or without a coercion transform). */
export type RdxFormStateInput<T> = InputSignal<T> | InputSignalWithTransform<T, any>;

/**
 * Minimal stand-in for Angular's `ValidationError`. The real type is a tagged
 * union (`RequiredValidationError`, `PatternValidationError`, …); this keeps a
 * shared shape until the v22 type is available.
 */
export interface RdxValidationError {
    readonly kind: string;
    readonly message?: string;
}

/** Optional state shared by value and checkbox controls (mirror of Angular's `FormUiControl`). */
export interface RdxFormUiControl {
    readonly disabled?: RdxFormStateInput<boolean>;
    readonly readonly?: RdxFormStateInput<boolean>;
    readonly required?: RdxFormStateInput<boolean>;
    readonly invalid?: RdxFormStateInput<boolean>;
    readonly hidden?: RdxFormStateInput<boolean>;
    readonly pending?: RdxFormStateInput<boolean>;
    /**
     * Touched status the form writes into the control.
     *
     * The two API generations disagree on the notification half: the 21.x
     * experimental implementation listens to a `touched` **model**'s
     * `touchedChange` output, while stable Angular 22 reverted to a plain
     * `touched` input plus a separate {@link touch} output. A `model()` set on
     * blur **plus** an emitted `touch` output satisfies both (`ModelSignal`
     * extends `InputSignalWithTransform`, so it type-checks as the 22 input).
     */
    readonly touched?: ModelSignal<boolean> | RdxFormStateInput<boolean> | OutputRef<boolean>;
    readonly dirty?: RdxFormStateInput<boolean>;
    readonly name?: RdxFormStateInput<string | undefined>;
    readonly errors?: RdxFormStateInput<readonly RdxValidationError[]>;
    readonly minLength?: RdxFormStateInput<number | undefined>;
    readonly maxLength?: RdxFormStateInput<number | undefined>;
    readonly pattern?: RdxFormStateInput<readonly RegExp[]>;
    /** Notifies the form the control was touched (stable Angular 22 contract; ignored by 21.x). */
    readonly touch?: OutputRef<void>;
    /** Resets the control's UI state (optional method added in stable Angular 22). */
    reset?(): void;
}

/**
 * Mirror of `FormValueControl<TValue>` — a control that edits a single value via
 * `value = model<TValue>()`. It must **not** expose `checked`.
 */
export interface RdxFormValueControl<TValue> extends RdxFormUiControl {
    readonly value: ModelSignal<TValue>;
    readonly checked?: undefined;
    readonly min?: RdxFormStateInput<NonNullable<TValue> | undefined>;
    readonly max?: RdxFormStateInput<NonNullable<TValue> | undefined>;
}

/**
 * Mirror of `FormCheckboxControl` — a control that toggles via
 * `checked = model<boolean>()`. It must **not** expose `value`.
 */
export interface RdxFormCheckboxControl extends RdxFormUiControl {
    readonly checked: ModelSignal<boolean>;
    readonly value?: undefined;
}
