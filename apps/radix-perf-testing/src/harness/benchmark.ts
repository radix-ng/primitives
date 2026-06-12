import { Type } from '@angular/core';
import { appendSentinel, computeStats, mode, nextPaint, observePaint, Stats } from './metrics';
import { createMount } from './mount';

export interface BenchmarkOptions {
    /** Measured iterations (default 20). */
    runs?: number;
    /** Warmup iterations discarded before measuring (default 10). */
    warmupRuns?: number;
}

/**
 * One benchmark scenario.
 *
 * - No `interact`  → the harness measures the **mount** (create N components + tick + paint).
 * - With `interact` → the harness mounts untimed, then measures the **interaction** (mutate signals
 *   + tick + paint). Use for re-render scenarios like "toggle 500 checkboxes" or "open the popup".
 */
export interface BenchScenario<T> {
    /** Standalone root component mounted once per iteration. */
    component: Type<T>;
    /** Configure the instance before the mount tick (e.g. set item count). Untimed for mount runs. */
    prepare?: (instance: T) => void;
    /** Mutate the instance to trigger the measured re-render. Presence switches to interaction mode. */
    interact?: (instance: T) => void;
}

export type BenchSetup<T> = () => BenchScenario<T>;

export interface BenchmarkResult {
    name: string;
    /** Synchronous CPU cost of the measured section (ms). */
    duration: Stats;
    /** Deterministic CD-cycle count for the measured section. */
    renders: number;
    /** Time from section start until the sentinel paints (ms), or null if Element Timing never fired. */
    paint: Stats | null;
}

interface Sample {
    duration: number;
    paint: number | null;
    renders: number;
}

let sentinelSeq = 0;

async function runIteration<T>(scenario: BenchScenario<T>): Promise<Sample> {
    const handle = await createMount(scenario.component);
    const id = `bench-sentinel-${sentinelSeq++}`;
    // Captured so it can be removed in the finally: sentinels left in document.body accumulate
    // across iterations, inflating later paint/layout samples (the metric corrupts itself).
    let sentinel: HTMLElement | undefined;

    try {
        if (scenario.interact) {
            // Mount fully and let it paint — this work is NOT part of the interaction sample.
            scenario.prepare?.(handle.instance);
            handle.attach();
            handle.tick();
            await nextPaint();

            const rendersBefore = handle.renderCount();
            const paintPromise = observePaint(id);
            const t0 = performance.now();
            sentinel = appendSentinel(id);
            scenario.interact(handle.instance);
            handle.tick();
            const t1 = performance.now();
            const paintAbs = await paintPromise;

            return {
                duration: t1 - t0,
                paint: paintAbs === null ? null : paintAbs - t0,
                renders: handle.renderCount() - rendersBefore
            };
        }

        // Mount mode: time create-view-attach + tick + paint.
        scenario.prepare?.(handle.instance);
        const paintPromise = observePaint(id);
        const t0 = performance.now();
        sentinel = appendSentinel(id);
        handle.attach();
        handle.tick();
        const t1 = performance.now();
        const paintAbs = await paintPromise;

        return {
            duration: t1 - t0,
            paint: paintAbs === null ? null : paintAbs - t0,
            renders: handle.renderCount()
        };
    } finally {
        sentinel?.remove();
        handle.destroy();
    }
}

/**
 * Run a scenario warmup + measured times, IQR-filter the samples, and return the result row.
 * The caller collects rows into a local array and flushes them via the reporter in afterAll —
 * NOTE: Vitest browser mode does not isolate module state between bench files, so the harness
 * deliberately keeps no shared results array (that leaked rows across files). One call = one row.
 */
export async function benchmark<T>(
    name: string,
    setup: BenchSetup<T>,
    options?: BenchmarkOptions
): Promise<BenchmarkResult> {
    const runs = options?.runs ?? 20;
    const warmupRuns = options?.warmupRuns ?? 10;

    const durations: number[] = [];
    const paints: number[] = [];
    const renderCounts: number[] = [];

    for (let i = 0; i < warmupRuns + runs; i++) {
        const sample = await runIteration(setup());
        if (i < warmupRuns) {
            continue;
        }
        durations.push(sample.duration);
        renderCounts.push(sample.renders);
        if (sample.paint !== null) {
            paints.push(sample.paint);
        }
    }

    const uniqueRenders = new Set(renderCounts);
    if (uniqueRenders.size > 1) {
        console.warn(`[bench] "${name}" render count is not deterministic: ${[...uniqueRenders].sort().join(', ')}`);
    }
    if (paints.length === 0) {
        console.warn(`[bench] "${name}" produced no Element Timing paint entries — paint metric omitted.`);
    }

    return {
        name,
        duration: computeStats(durations),
        renders: mode(renderCounts),
        paint: paints.length ? computeStats(paints) : null
    };
}
