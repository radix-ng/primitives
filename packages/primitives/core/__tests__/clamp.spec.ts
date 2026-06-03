import { clamp, roundToStepPrecision, snapValueToStep } from '../src/clamp';
import { describe, expect, it } from 'vitest';

describe('clamp', () => {
    it('returns the value when it is within range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(0, 0, 10)).toBe(0);
        expect(clamp(10, 0, 10)).toBe(10);
    });

    it('clamps to the boundaries when out of range', () => {
        expect(clamp(-1, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
    });

    it('defaults to an unbounded range', () => {
        expect(clamp(5)).toBe(5);
        expect(clamp(-1e9)).toBe(-1e9);
        // only a lower bound
        expect(clamp(-5, 0)).toBe(0);
        expect(clamp(5, 0)).toBe(5);
        // only an upper bound (min defaults to -Infinity)
        expect(clamp(5, undefined, 3)).toBe(3);
    });

    it('lets max win when min > max', () => {
        expect(clamp(5, 10, 0)).toBe(0);
    });
});

describe('roundToStepPrecision', () => {
    it('leaves the value unchanged for an integer step', () => {
        expect(roundToStepPrecision(5, 1)).toBe(5);
        expect(roundToStepPrecision(123.456, 5)).toBe(123.456);
    });

    it('rounds to the precision implied by a decimal step', () => {
        expect(roundToStepPrecision(1.23456, 0.1)).toBe(1.23);
        expect(roundToStepPrecision(2.345, 0.01)).toBe(2.345);
    });

    it('corrects floating point drift', () => {
        expect(roundToStepPrecision(0.1 + 0.2, 0.1)).toBe(0.3);
    });
});

describe('snapValueToStep', () => {
    it('snaps to the nearest multiple of the step', () => {
        expect(snapValueToStep(3, 0, 100, 5)).toBe(5);
        expect(snapValueToStep(2, 0, 100, 5)).toBe(0);
        expect(snapValueToStep(7, 0, 100, 5)).toBe(5);
    });

    it('rounds halves up away from zero', () => {
        expect(snapValueToStep(2.5, 0, 10, 1)).toBe(3);
    });

    it('snaps relative to an offset min, with no bounds', () => {
        expect(snapValueToStep(-3, undefined, undefined, 5)).toBe(-5);
    });

    it('clamps the snapped value to min', () => {
        expect(snapValueToStep(-10, 0, 100, 5)).toBe(0);
    });

    it('clamps to the largest in-range multiple when above max', () => {
        expect(snapValueToStep(1000, 0, 10, 3)).toBe(9);
        // same behavior when only a max is provided
        expect(snapValueToStep(1000, undefined, 10, 3)).toBe(9);
    });
});
