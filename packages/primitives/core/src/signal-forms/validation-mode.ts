/**
 * When a `Field` reveals its validity (the `data-valid` / `data-invalid` styling and the error message)
 * — the form-system-agnostic equivalent of Base UI's `validationMode` and Angular Material's
 * `ErrorStateMatcher`. The control/adapter always reports the **actual** state (`invalid` / `errors` /
 * `touched` / `dirty`); the Field decides **when** to surface it from this mode.
 *
 * - `'always'` — reflect validity immediately (an empty required field shows its error on first render).
 * - `'onChange'` — reveal once the user has changed the value (dirty), or the form submitted. A blur
 *   alone does not reveal — that is `'onBlur'`'s behavior.
 * - `'onBlur'` — reveal once the field has been touched (blurred), or the form submitted (the default).
 * - `'onSubmit'` — reveal only after a submit has been attempted.
 *
 * Server/external errors are **not** gated by this mode — they surface immediately (they were set
 * explicitly, e.g. from a submit response).
 */
export type RdxValidationMode = 'always' | 'onChange' | 'onBlur' | 'onSubmit';

/** The default validation-display mode when neither `rdxFieldRoot` nor `rdxFormRoot` sets one. */
export const RDX_DEFAULT_VALIDATION_MODE: RdxValidationMode = 'onBlur';

/** The field interaction state {@link isValidationRevealed} reads to decide whether to reveal validity. */
export interface RdxValidationInteraction {
    touched: boolean;
    dirty: boolean;
    submitAttempted: boolean;
}

/**
 * Whether a Field should reveal its (client-side) validity given the {@link RdxValidationMode} and the
 * field's interaction state. `false` means stay neutral (neither `data-valid` nor `data-invalid`, error
 * hidden); `true` means reflect the actual validity.
 */
export function isValidationRevealed(mode: RdxValidationMode, interaction: RdxValidationInteraction): boolean {
    const { touched, dirty, submitAttempted } = interaction;
    switch (mode) {
        case 'always':
            return true;
        case 'onChange':
            return dirty || submitAttempted;
        case 'onBlur':
            return touched || submitAttempted;
        case 'onSubmit':
            return submitAttempted;
    }
}
