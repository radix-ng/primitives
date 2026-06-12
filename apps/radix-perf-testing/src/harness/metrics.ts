/** IQR-filtered summary of a sample set (ms). Mirrors base-ui's mean ± stdDev report shape. */
export interface Stats {
    median: number;
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    samples: number;
    outliersRemoved: number;
}

/** Linear-interpolation quantile over an already-sorted ascending array. */
function quantile(sorted: number[], q: number): number {
    if (sorted.length === 1) {
        return sorted[0];
    }
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    const next = sorted[base + 1];
    return next !== undefined ? sorted[base] + rest * (next - sorted[base]) : sorted[base];
}

/**
 * Drop outliers outside the Tukey fence [Q1 - 1.5·IQR, Q3 + 1.5·IQR], then summarize. If filtering
 * would remove everything (degenerate input), fall back to the raw samples.
 */
export function computeStats(raw: number[]): Stats {
    const sorted = [...raw].sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr;
    const hi = q3 + 1.5 * iqr;
    const filtered = sorted.filter((v) => v >= lo && v <= hi);
    const use = filtered.length ? filtered : sorted;

    const mean = use.reduce((a, b) => a + b, 0) / use.length;
    const variance = use.reduce((a, b) => a + (b - mean) ** 2, 0) / use.length;

    return {
        median: quantile(use, 0.5),
        mean,
        stdDev: Math.sqrt(variance),
        min: use[0],
        max: use[use.length - 1],
        samples: use.length,
        outliersRemoved: raw.length - use.length
    };
}

/** Most frequent value in a list (used for the deterministic renders count). */
export function mode(values: number[]): number {
    const counts = new Map<number, number>();
    let best = values[0];
    let bestCount = 0;
    for (const v of values) {
        const c = (counts.get(v) ?? 0) + 1;
        counts.set(v, c);
        if (c > bestCount) {
            bestCount = c;
            best = v;
        }
    }
    return best;
}

const SENTINEL_STYLE = 'position:fixed;top:0;left:0;font-size:1px;opacity:0.01;pointer-events:none;';

/**
 * Append the harness's own Element Timing sentinel. Element Timing only reports an element that
 * intersects the viewport and carries text/image content (see docs/adr/0009 risk 2), hence the
 * tiny on-screen text node rather than a hidden/off-screen one. Returns the element for cleanup.
 */
export function appendSentinel(identifier: string): HTMLElement {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('elementtiming', identifier);
    sentinel.textContent = '.';
    sentinel.style.cssText = SENTINEL_STYLE;
    document.body.appendChild(sentinel);
    return sentinel;
}

/**
 * Resolve with the absolute paint time (from `performance.timeOrigin`, comparable to
 * `performance.now()`) of the sentinel with the given identifier, or null if no paint entry arrives
 * within `timeoutMs` (caller then falls back / records a missing paint).
 */
export function observePaint(identifier: string, timeoutMs = 2000): Promise<number | null> {
    return new Promise<number | null>((resolve) => {
        let settled = false;
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if ((entry as PerformanceEntry & { identifier?: string }).identifier === identifier) {
                    settled = true;
                    observer.disconnect();
                    resolve(entry.startTime);
                    return;
                }
            }
        });
        observer.observe({ type: 'element', buffered: true } as PerformanceObserverInit);

        setTimeout(() => {
            if (!settled) {
                observer.disconnect();
                resolve(null);
            }
        }, timeoutMs);
    });
}

/** Resolve after the browser has painted at least one frame (double rAF). */
export function nextPaint(): Promise<void> {
    return new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
}
