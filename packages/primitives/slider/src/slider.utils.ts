import { clamp } from '@radix-ng/primitives/core';

export { clamp };

export type SliderOrientation = 'horizontal' | 'vertical';
export type ThumbCollisionBehavior = 'push' | 'swap' | 'none';

/** Ascending comparator. */
export function asc(a: number, b: number): number {
    return a - b;
}

/** Maps a value within `[min, max]` to a 0–100 percentage. */
export function valueToPercent(value: number, min: number, max: number): number {
    return ((value - min) * 100) / (max - min);
}

/** Replaces the item at `index` then re-sorts the array ascending. */
export function replaceArrayItemAtIndex(array: readonly number[], index: number, newValue: number): number[] {
    const output = array.slice();
    output[index] = newValue;
    return output.sort(asc);
}

/** The center point of an element in client coordinates. */
export function getMidpoint(element: Element): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
}

/** Converts an array of values into clamped 0–100 percentages. */
export function valueArrayToPercentages(values: readonly number[], min: number, max: number): number[] {
    return values.map((value) => clamp(valueToPercent(value, min, max), 0, 100));
}

/** Number of decimal places in `num`, handling exponential notation for tiny values. */
export function getDecimalPrecision(num: number): number {
    if (num === 0) {
        return 0;
    }
    if (Math.abs(num) < 1) {
        const parts = num.toExponential().split('e-');
        const mantissaDecimalPart = parts[0].split('.')[1];
        return (mantissaDecimalPart ? mantissaDecimalPart.length : 0) + parseInt(parts[1], 10);
    }
    const decimalPart = num.toString().split('.')[1];
    return decimalPart ? decimalPart.length : 0;
}

/** Snaps `value` to the nearest step, using `min` as the origin of the step grid. */
export function roundValueToStep(value: number, step: number, min: number): number {
    const nearest = Math.round((value - min) / step) * step + min;
    return Number(nearest.toFixed(Math.max(getDecimalPrecision(step), getDecimalPrecision(min))));
}

/**
 * Resolves the value(s) for the keyboard / hidden-input path: clamps to the
 * bounds, and for range sliders also clamps to neighbouring thumbs and re-sorts.
 * Returns a `number` for single sliders and a sorted `number[]` for range sliders.
 */
export function getSliderValue(
    valueInput: number,
    index: number,
    min: number,
    max: number,
    range: boolean,
    values: readonly number[]
): number | number[] {
    let newValue = clamp(valueInput, min, max);
    if (range) {
        newValue = clamp(
            newValue,
            values[index - 1] ?? Number.NEGATIVE_INFINITY,
            values[index + 1] ?? Number.POSITIVE_INFINITY
        );
        return replaceArrayItemAtIndex(values, index, newValue);
    }
    return newValue;
}

/** Returns `false` if any adjacent pair of values is closer than the minimum distance. */
export function validateMinimumDistance(
    values: number | number[],
    step: number,
    minStepsBetweenValues: number
): boolean {
    if (!Array.isArray(values)) {
        return true;
    }
    const distances = values.reduce<number[]>((acc, val, index, vals) => {
        if (index === vals.length - 1) {
            return acc;
        }
        acc.push(Math.abs(val - vals[index + 1]));
        return acc;
    }, []);
    return Math.min(...distances) >= step * minStepsBetweenValues;
}

/** Keyboard step helper: increments/decrements `thumbValue` and clamps to bounds. */
export function getNewValue(
    thumbValue: number,
    increment: number,
    direction: 1 | -1,
    min: number,
    max: number
): number {
    const value = direction === 1 ? thumbValue + increment : thumbValue - increment;
    const roundedValue = Number(
        value.toFixed(
            Math.max(getDecimalPrecision(thumbValue), getDecimalPrecision(increment), getDecimalPrecision(min))
        )
    );
    return clamp(roundedValue, min, max);
}

interface GetPushedThumbValuesParams {
    values: readonly number[];
    index: number;
    nextValue: number;
    min: number;
    max: number;
    step: number;
    minStepsBetweenValues: number;
    initialValues?: readonly number[];
}

/**
 * The "push" collision algorithm: moves the pressed thumb and pushes its
 * neighbours only as far as needed, letting them spring back toward their
 * initial positions as the pressed thumb retreats.
 */
export function getPushedThumbValues(params: GetPushedThumbValuesParams): number[] {
    const { values, index, nextValue, min, max, step, minStepsBetweenValues, initialValues } = params;
    if (values.length === 0) {
        return [];
    }
    const nextValues = values.slice();
    const minValueDifference = step * minStepsBetweenValues;
    const lastIndex = nextValues.length - 1;
    const baseInitialValues = initialValues ?? values;

    const indexMin = min + index * minValueDifference;
    const indexMax = max - (lastIndex - index) * minValueDifference;
    nextValues[index] = clamp(nextValue, indexMin, indexMax);

    // push thumbs to the right
    for (let i = index + 1; i <= lastIndex; i += 1) {
        const minAllowed = nextValues[i - 1] + minValueDifference;
        const maxAllowed = max - (lastIndex - i) * minValueDifference;
        const initialValue = baseInitialValues[i] ?? nextValues[i];
        let candidate = Math.max(nextValues[i], minAllowed);
        if (initialValue < candidate) {
            candidate = Math.max(initialValue, minAllowed);
        }
        nextValues[i] = clamp(candidate, minAllowed, maxAllowed);
    }

    // push thumbs to the left
    for (let i = index - 1; i >= 0; i -= 1) {
        const maxAllowed = nextValues[i + 1] - minValueDifference;
        const minAllowed = min + i * minValueDifference;
        const initialValue = baseInitialValues[i] ?? nextValues[i];
        let candidate = Math.min(nextValues[i], maxAllowed);
        if (initialValue > candidate) {
            candidate = Math.min(initialValue, maxAllowed);
        }
        nextValues[i] = clamp(candidate, minAllowed, maxAllowed);
    }

    for (let i = 0; i <= lastIndex; i += 1) {
        nextValues[i] = Number(nextValues[i].toFixed(12));
    }
    return nextValues;
}

export interface ResolveThumbCollisionParams {
    behavior: ThumbCollisionBehavior;
    values: readonly number[];
    currentValues?: readonly number[];
    initialValues?: readonly number[] | null;
    pressedIndex: number;
    nextValue: number;
    min: number;
    max: number;
    step: number;
    minStepsBetweenValues: number;
}

export interface ResolveThumbCollisionResult {
    value: number | number[];
    thumbIndex: number;
    didSwap: boolean;
}

/** Dispatches the pressed thumb's new value through the configured collision behavior. */
export function resolveThumbCollision(params: ResolveThumbCollisionParams): ResolveThumbCollisionResult {
    const {
        behavior,
        values,
        currentValues,
        initialValues,
        pressedIndex,
        nextValue,
        min,
        max,
        step,
        minStepsBetweenValues
    } = params;

    const activeValues = (currentValues ?? values).slice();
    const baselineValues = initialValues ?? values;
    const range = activeValues.length > 1;
    const minValueDifference = step * minStepsBetweenValues;

    if (!range) {
        return { value: nextValue, thumbIndex: 0, didSwap: false };
    }

    if (behavior === 'push') {
        const value = getPushedThumbValues({
            values: activeValues,
            index: pressedIndex,
            nextValue,
            min,
            max,
            step,
            minStepsBetweenValues
        });
        return { value, thumbIndex: pressedIndex, didSwap: false };
    }

    if (behavior === 'swap') {
        const pressedInitialValue = activeValues[pressedIndex];
        const epsilon = 1e-7;
        const candidateValues = activeValues.slice();
        const previousNeighbor = candidateValues[pressedIndex - 1];
        const nextNeighbor = candidateValues[pressedIndex + 1];

        const lowerBound = previousNeighbor != null ? previousNeighbor + minValueDifference : min;
        const upperBound = nextNeighbor != null ? nextNeighbor - minValueDifference : max;

        const constrainedValue = clamp(nextValue, lowerBound, upperBound);
        const pressedValueAfterClamp = Number(constrainedValue.toFixed(12));
        candidateValues[pressedIndex] = pressedValueAfterClamp;

        const movingForward = nextValue > pressedInitialValue;
        const movingBackward = nextValue < pressedInitialValue;
        const shouldSwapForward = movingForward && nextNeighbor != null && nextValue >= nextNeighbor - epsilon;
        const shouldSwapBackward =
            movingBackward && previousNeighbor != null && nextValue <= previousNeighbor + epsilon;

        if (!shouldSwapForward && !shouldSwapBackward) {
            return { value: candidateValues, thumbIndex: pressedIndex, didSwap: false };
        }

        const targetIndex = shouldSwapForward ? pressedIndex + 1 : pressedIndex - 1;

        const initialValuesForPush = candidateValues.map((_, idx) => {
            if (idx === pressedIndex) {
                return pressedValueAfterClamp;
            }
            const baseline = baselineValues[idx];
            return baseline != null ? baseline : activeValues[idx];
        });

        const nextValueForTarget = shouldSwapForward
            ? Math.max(nextValue, candidateValues[targetIndex])
            : Math.min(nextValue, candidateValues[targetIndex]);

        const adjustedValues = getPushedThumbValues({
            values: candidateValues,
            index: targetIndex,
            nextValue: nextValueForTarget,
            min,
            max,
            step,
            minStepsBetweenValues,
            initialValues: initialValuesForPush
        });

        const neighborIndex = shouldSwapForward ? targetIndex - 1 : targetIndex + 1;
        if (neighborIndex >= 0 && neighborIndex < adjustedValues.length) {
            const previousValue = adjustedValues[neighborIndex - 1];
            const nextValueAfter = adjustedValues[neighborIndex + 1];
            let neighborLowerBound = previousValue != null ? previousValue + minValueDifference : min;
            neighborLowerBound = Math.max(neighborLowerBound, min + neighborIndex * minValueDifference);
            let neighborUpperBound = nextValueAfter != null ? nextValueAfter - minValueDifference : max;
            neighborUpperBound = Math.min(
                neighborUpperBound,
                max - (adjustedValues.length - 1 - neighborIndex) * minValueDifference
            );
            const restoredValue = clamp(pressedValueAfterClamp, neighborLowerBound, neighborUpperBound);
            adjustedValues[neighborIndex] = Number(restoredValue.toFixed(12));
        }

        return { value: adjustedValues, thumbIndex: targetIndex, didSwap: true };
    }

    // behavior === 'none' — clamp the pressed thumb between its neighbours; thumbs never cross.
    const previousNeighbor = activeValues[pressedIndex - 1];
    const nextNeighbor = activeValues[pressedIndex + 1];
    const lowerBound = previousNeighbor != null ? previousNeighbor + minValueDifference : min;
    const upperBound = nextNeighbor != null ? nextNeighbor - minValueDifference : max;
    const constrained = Number(clamp(nextValue, lowerBound, upperBound).toFixed(12));
    const value = activeValues.slice();
    value[pressedIndex] = constrained;
    return { value, thumbIndex: pressedIndex, didSwap: false };
}

/**
 * Border + padding on the leading/trailing edge of the control along the active
 * axis. Uses physical longhands (`left`/`right`/`top`/`bottom`) rather than
 * logical ones (`inline-start`/…) because `getComputedStyle` resolves the
 * physical properties in every browser, whereas logical longhands return an
 * empty string in some engines.
 */
export function getControlOffset(
    styles: CSSStyleDeclaration | null,
    vertical: boolean,
    rtl: boolean
): { start: number; end: number } {
    if (!styles) {
        return { start: 0, end: 0 };
    }
    const parseSize = (v: string): number => {
        const p = parseFloat(v);
        return Number.isNaN(p) ? 0 : p;
    };
    const sideOffset = (side: 'left' | 'right' | 'top' | 'bottom'): number =>
        parseSize(styles.getPropertyValue(`border-${side}-width`)) +
        parseSize(styles.getPropertyValue(`padding-${side}`));

    let startSide: 'left' | 'right' | 'top';
    let endSide: 'right' | 'left' | 'bottom';
    if (vertical) {
        startSide = 'top';
        endSide = 'bottom';
    } else if (rtl) {
        startSide = 'right';
        endSide = 'left';
    } else {
        startSide = 'left';
        endSide = 'right';
    }

    return { start: sideOffset(startSide), end: sideOffset(endSide) };
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string | undefined, options: Intl.NumberFormatOptions | undefined): Intl.NumberFormat {
    const key = JSON.stringify({ locale: locale ?? null, options: options ?? null });
    let formatter = formatterCache.get(key);
    if (!formatter) {
        formatter = new Intl.NumberFormat(locale, options);
        formatterCache.set(key, formatter);
    }
    return formatter;
}

/** Formats a number with a cached `Intl.NumberFormat` instance. */
export function formatNumber(
    value: number | null | undefined,
    locale: string | undefined,
    options: Intl.NumberFormatOptions | undefined
): string {
    if (value == null) {
        return '';
    }
    return getFormatter(locale, options).format(value);
}

/** Default `aria-valuetext` for a two-thumb range, or a formatted value when `format` is set. */
export function getDefaultAriaValueText(
    values: readonly number[],
    index: number,
    format: Intl.NumberFormatOptions | undefined,
    locale: string | undefined
): string | undefined {
    if (index < 0) {
        return undefined;
    }
    if (values.length === 2) {
        return index === 0
            ? `${formatNumber(values[index], locale, format)} start range`
            : `${formatNumber(values[index], locale, format)} end range`;
    }
    return format ? formatNumber(values[index], locale, format) : undefined;
}

export const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
export const COMPOSITE_KEYS = new Set([...ARROW_KEYS, 'Home', 'End']);
export const ALL_KEYS = new Set([...COMPOSITE_KEYS, 'PageUp', 'PageDown']);

export function areValuesEqual(a: number | number[], b: number | number[]): boolean {
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    return a === b;
}
