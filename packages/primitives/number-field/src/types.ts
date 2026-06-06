/**
 * The software keyboard hint shown on touch devices, mapped to the input's `inputmode` attribute.
 */
export type InputMode = 'numeric' | 'decimal' | 'text';

/**
 * Direction of a step-based value change (`1` to increase, `-1` to decrease).
 */
export type Direction = 1 | -1;

/**
 * Why a value change happened. Mirrors Base UI's change reasons and is used
 * internally to decide whether a change should be clamped (step interactions
 * always clamp; direct text entry may go out of range when `allowOutOfRange`).
 *
 * @see https://base-ui.com/react/components/number-field
 */
export type NumberFieldChangeReason =
    | 'input-change'
    | 'input-clear'
    | 'input-blur'
    | 'input-paste'
    | 'keyboard'
    | 'increment-press'
    | 'decrement-press'
    | 'wheel'
    | 'scrub'
    | 'none';

export const REASONS = {
    inputChange: 'input-change',
    inputClear: 'input-clear',
    inputBlur: 'input-blur',
    inputPaste: 'input-paste',
    keyboard: 'keyboard',
    incrementPress: 'increment-press',
    decrementPress: 'decrement-press',
    wheel: 'wheel',
    scrub: 'scrub',
    none: 'none'
} as const;
