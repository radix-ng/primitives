import { NumberInput } from '@angular/cdk/coercion';
import { computed, DestroyRef, inject, numberAttribute, signal, Signal } from '@angular/core';
import { NumberFormatter, NumberParser } from '@internationalized/number';
import { clamp } from '@radix-ng/primitives/core';

/**
 * Coerces an optional numeric input, returning `undefined` for nullish/empty/non-numeric values.
 * Unlike `numberAttribute`, `numberOrUndefined(undefined)` is `undefined` (not `NaN`), so an unset
 * `[min]`/`[max]` does not poison clamping.
 */
export function numberOrUndefined(value: NumberInput): number | undefined {
    if (value == null || value === '') {
        return undefined;
    }
    const parsed = numberAttribute(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

/** Default step used when no `step` is provided. */
export const DEFAULT_STEP = 1;
/** Delay between auto-repeat ticks while holding an increment/decrement button. */
export const CHANGE_VALUE_TICK_DELAY = 60;
/** Delay before auto-repeat starts while holding an increment/decrement button. */
export const START_AUTO_CHANGE_DELAY = 400;
/** Pointer travel (px) that cancels a hold, treating the gesture as a scroll. */
export const SCROLLING_POINTER_MOVE_DISTANCE = 8;

const STEP_EPSILON_FACTOR = 1e-10;
// Matches Intl.NumberFormat's decimal maximumFractionDigits default.
const DEFAULT_DIGITS = 3;

/** Reactive `Intl`-backed formatter built from the current locale and format options. */
export function useNumberFormatter(
    locale: Signal<string>,
    options: Signal<Intl.NumberFormatOptions | undefined> = signal({})
): Signal<NumberFormatter> {
    return computed(() => new NumberFormatter(locale(), options() ?? {}));
}

/** Reactive `Intl`-backed parser built from the current locale and format options. */
export function useNumberParser(
    locale: Signal<string>,
    options: Signal<Intl.NumberFormatOptions | undefined> = signal({})
): Signal<NumberParser> {
    return computed(() => new NumberParser(locale(), options() ?? {}));
}

/** Whether the format options would cause `Intl.NumberFormat` to round the value. */
export function hasNumberFormatRoundingOptions(format?: Intl.NumberFormatOptions): boolean {
    const opts = format as (Intl.NumberFormatOptions & Record<string, unknown>) | undefined;
    return !!(
        opts &&
        (opts.maximumFractionDigits != null ||
            opts.minimumFractionDigits != null ||
            opts.maximumSignificantDigits != null ||
            opts.minimumSignificantDigits != null ||
            opts['roundingIncrement'] != null ||
            opts['roundingMode'] != null ||
            opts['roundingPriority'] != null)
    );
}

/**
 * Strips floating-point representation errors (e.g. `0.1 + 0.2`) using the format's
 * rounding options when present, otherwise rounding to {@link DEFAULT_DIGITS} digits.
 */
export function removeFloatingPointErrors(value: number, locale: string, format?: Intl.NumberFormatOptions): number {
    if (!Number.isFinite(value)) {
        return value;
    }

    if (!hasNumberFormatRoundingOptions(format)) {
        return Number(value.toFixed(DEFAULT_DIGITS));
    }

    const formatter = new NumberFormatter('en-US', {
        ...format,
        // These options alter only display decoration, not numeric rounding.
        signDisplay: 'auto',
        currencySign: 'standard',
        notation: format!.notation === 'compact' ? 'standard' : format!.notation,
        useGrouping: false
    });
    const roundedText = formatter.format(value);
    const roundedValue = new NumberParser('en-US', format ?? {}).parse(roundedText);

    if (Number.isNaN(roundedValue)) {
        return value;
    }

    return formatter.format(roundedValue) === roundedText ? roundedValue : value;
}

function snapToStep(
    value: number,
    base: number,
    step: number,
    mode: 'directional' | 'nearest' = 'directional'
): number {
    const stepSize = Math.abs(step);
    const direction = Math.sign(step);
    const tolerance = stepSize * STEP_EPSILON_FACTOR * direction;
    const rawSteps = value - base + tolerance;

    if (mode === 'nearest') {
        return base + Math.round(rawSteps / step) * step;
    }

    const snappedSteps = direction > 0 ? Math.floor(rawSteps / stepSize) : Math.ceil(rawSteps / stepSize);
    return base + snappedSteps * stepSize;
}

export interface ValidateOptions {
    step: number | undefined;
    minWithDefault: number;
    maxWithDefault: number;
    minWithZeroDefault: number;
    format: Intl.NumberFormatOptions | undefined;
    locale: string;
    snapOnStep: boolean;
    small: boolean;
    clamp: boolean;
}

/**
 * Snaps (optionally), clamps (optionally) and rounds an unvalidated value, mirroring
 * Base UI's `toValidatedNumber`. Snapping happens before clamping so non-step-aligned
 * boundaries stay reachable.
 */
export function toValidatedNumber(value: number | null, options: ValidateOptions): number | null {
    if (value === null) {
        return value;
    }

    const { step, minWithDefault, maxWithDefault, minWithZeroDefault, format, locale, snapOnStep, small } = options;

    let nextValue = value;

    if (step != null && snapOnStep && step !== 0) {
        const base = small || minWithDefault === Number.MIN_SAFE_INTEGER ? minWithZeroDefault : minWithDefault;
        nextValue = snapToStep(nextValue, base, step, small ? 'nearest' : 'directional');
    }

    if (options.clamp) {
        nextValue = clamp(nextValue, minWithDefault, maxWithDefault);
    }

    const roundedValue = removeFloatingPointErrors(nextValue, locale, format);
    return options.clamp ? clamp(roundedValue, minWithDefault, maxWithDefault) : roundedValue;
}

export interface PressAndHoldOptions {
    /** Whether interaction is currently blocked (disabled or read-only). */
    disabled: () => boolean;
    /** Delay before the first auto-repeat tick. */
    startDelay: number;
    /** Delay between subsequent auto-repeat ticks. */
    tickDelay: number;
    /** Pointer travel (px) that cancels the hold as a scroll. */
    scrollDistance: number;
    /** Runs on each tick; return `false` to stop auto-repeating (e.g. a bound was hit). */
    tick: (event: PointerEvent) => boolean | void;
    /** Runs once when the press ends (pointerup / cancel / scroll). */
    onStop?: (event: PointerEvent) => void;
}

export interface PressAndHold {
    readonly isPressing: Signal<boolean>;
    onPointerDown(event: PointerEvent): void;
    /** Whether the following synthetic `click` should be ignored (a hold already ticked). */
    shouldSkipClick(): boolean;
}

/**
 * Pointer press-and-hold with auto-repeat, modelled on Base UI's `usePressAndHold`.
 * Must be called in an injection context — it registers cleanup via `DestroyRef`.
 */
export function createPressAndHold(options: PressAndHoldOptions): PressAndHold {
    const destroyRef = inject(DestroyRef);
    const isPressing = signal(false);

    let startEvent: PointerEvent | null = null;
    let startX = 0;
    let startY = 0;
    let didTick = false;
    let tickTimer: ReturnType<typeof setTimeout> | undefined;

    const clearTick = () => {
        if (tickTimer !== undefined) {
            clearTimeout(tickTimer);
            tickTimer = undefined;
        }
    };

    const scheduleTick = (delay: number) => {
        tickTimer = setTimeout(() => {
            if (options.disabled() || !startEvent) {
                stop(startEvent);
                return;
            }
            didTick = true;
            const shouldContinue = options.tick(startEvent);
            if (shouldContinue === false) {
                clearTick();
                return;
            }
            scheduleTick(options.tickDelay);
        }, delay);
    };

    const onPointerMove = (event: PointerEvent) => {
        // Treat a moving touch/pen gesture as a scroll and cancel the hold.
        if (startEvent && startEvent.pointerType !== 'mouse') {
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            if (Math.hypot(dx, dy) > options.scrollDistance) {
                stop(event);
            }
        }
    };

    const stop = (event: PointerEvent | null) => {
        if (!isPressing()) {
            return;
        }
        clearTick();
        window.removeEventListener('pointerup', stop, true);
        window.removeEventListener('pointercancel', stop, true);
        window.removeEventListener('pointermove', onPointerMove, true);
        isPressing.set(false);
        if (event) {
            options.onStop?.(event);
        }
    };

    destroyRef.onDestroy(() => stop(null));

    return {
        isPressing: isPressing.asReadonly(),
        shouldSkipClick: () => didTick,
        onPointerDown(event: PointerEvent) {
            if (options.disabled() || isPressing()) {
                return;
            }
            startEvent = event;
            startX = event.clientX;
            startY = event.clientY;
            didTick = false;
            isPressing.set(true);
            window.addEventListener('pointerup', stop, true);
            window.addEventListener('pointercancel', stop, true);
            window.addEventListener('pointermove', onPointerMove, true);
            scheduleTick(options.startDelay);
        }
    };
}
