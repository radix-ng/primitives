import { computed, Directive, effect, inject, Injectable, input, Provider, signal } from '@angular/core';
import { RdxIdGenerator } from '@radix-ng/primitives/core';
import { RdxToastAddOptions, RdxToastObject, RdxToastPromiseOptions } from './toast.types';

/** Default auto-dismiss delay (ms) applied when a toast omits `timeout`. */
const DEFAULT_TIMEOUT = 5000;
/** Max number of toasts kept in the queue; the oldest is dropped past this. */
const DEFAULT_LIMIT = 3;

interface TimerState {
    /** Active `setTimeout` handle, or `null` while paused / not scheduled. */
    handle: ReturnType<typeof setTimeout> | null;
    /** Remaining time (ms) when paused. */
    remaining: number;
    /** Timestamp (ms) the current run started, for computing `remaining` on pause. */
    start: number;
}

/**
 * App-level coordinator and imperative API for toasts — the Angular counterpart of Base UI's
 * `<Toast.Provider>` plus `useToastManager()`. Holds the queue as a signal that `RdxToastViewport`
 * renders, owns each toast's auto-dismiss timer (pausable while the viewport is hovered/focused),
 * and exposes `add` / `update` / `close` / `promise`.
 *
 * Provide it once near the app root with {@link provideRdxToastManager} or the `[rdxToastProvider]`
 * directive, then inject `RdxToastManager` anywhere to push toasts.
 */
@Injectable()
export class RdxToastManager {
    private readonly idGenerator = inject(RdxIdGenerator);

    private readonly _toasts = signal<RdxToastObject[]>([]);
    /** The live queue, oldest first. Render it in `RdxToastViewport` (e.g. via `@for`). */
    readonly toasts = this._toasts.asReadonly();

    /** Whether any toast is currently in the queue. */
    readonly hasToasts = computed(() => this._toasts().length > 0);

    private readonly _expanded = signal(false);
    /** Whether the stack is expanded (viewport hovered or focused) — drives `data-expanded`. */
    readonly expanded = this._expanded.asReadonly();

    private readonly _heights = signal<Record<string, number>>({});
    /** Measured heights (px) per toast id, reported by each `RdxToastRoot` for expanded-stack offsets. */
    readonly heights = this._heights.asReadonly();

    /**
     * Per-toast stacking metrics, computed once for the whole queue (front = newest, index `0`):
     * `index` is the distance from the front and `offsetY` is the combined height of the toasts
     * stacked in front. Roots read this by id instead of each rescanning the queue (O(n) vs O(n²)).
     */
    readonly layout = computed<Record<string, { index: number; offsetY: number }>>(() => {
        const list = this._toasts();
        const heights = this._heights();
        const result: Record<string, { index: number; offsetY: number }> = {};
        let offsetInFront = 0;
        for (let i = list.length - 1; i >= 0; i--) {
            const toast = list[i];
            result[toast.id] = { index: list.length - 1 - i, offsetY: offsetInFront };
            offsetInFront += heights[toast.id] ?? 0;
        }
        return result;
    });

    /** Max number of simultaneously visible toasts. Configurable via `[rdxToastProvider]`. */
    limit = DEFAULT_LIMIT;

    /** Default auto-dismiss delay (ms) for toasts that omit `timeout`. Set via `[rdxToastProvider]`. */
    defaultTimeout = DEFAULT_TIMEOUT;

    private readonly timers = new Map<string, TimerState>();
    /** Nested-pause depth so overlapping holds (hover + swipe) resume only when all release. */
    private pauseDepth = 0;

    /** Queue a new toast. Returns its id (generated when not supplied). */
    add<Data = unknown>(options: RdxToastAddOptions<Data>): string {
        const id = options.id ?? this.idGenerator.getId('rdx-toast-');
        const toast: RdxToastObject<Data> = {
            ...options,
            id,
            priority: options.priority ?? 'low',
            transitionStatus: 'starting'
        };

        // Re-adding an id that is mid-dismissal resurrects it rather than updating it: finish the
        // abandoned dismissal so its leave handler can't later remove the replacement, and its
        // `onRemove` still fires. (A same-id toast that is still open is a normal update — left alone.)
        const existing = this._toasts().find((t) => t.id === id);
        if (existing?.transitionStatus === 'ending') {
            this.clearTimer(id);
            existing.onRemove?.();
        }

        let evicted: RdxToastObject[] = [];
        this._toasts.update((toasts) => {
            const next = [...toasts.filter((t) => t.id !== id), toast as RdxToastObject];
            // Enforce the limit by dropping the oldest entries.
            const overflow = next.length - this.limit;
            if (overflow > 0) {
                evicted = next.slice(0, overflow);
                return next.slice(overflow);
            }
            return next;
        });

        // Fully retire evicted toasts (timer + height + callback), not just their timers.
        evicted.forEach((dropped) => {
            this.clearTimer(dropped.id);
            this.clearHeight(dropped.id);
            dropped.onRemove?.();
        });

        this.scheduleTimeout(toast);
        return id;
    }

    /** Merge new options into an existing toast (no-op if the id is unknown). */
    update<Data = unknown>(id: string, options: Partial<RdxToastAddOptions<Data>>): void {
        this._toasts.update((toasts) =>
            toasts.map((toast) => (toast.id === id ? { ...toast, ...options, id } : toast))
        );
        const toast = this._toasts().find((t) => t.id === id);
        if (toast) {
            this.scheduleTimeout(toast);
        }
    }

    /**
     * Begin dismissing a toast: fire `onClose`, then remove it after the leave animation.
     * Omit `id` to dismiss every toast at once (mirrors Base UI's `close()`).
     */
    close(id?: string): void {
        if (id === undefined) {
            this._toasts().forEach((toast) => this.close(toast.id));
            return;
        }

        const toast = this._toasts().find((t) => t.id === id);
        if (!toast) {
            return;
        }

        this.clearTimer(id);
        toast.onClose?.();

        this._toasts.update((toasts) => toasts.map((t) => (t.id === id ? { ...t, transitionStatus: 'ending' } : t)));
    }

    /**
     * Remove a toast from the queue immediately. `RdxToastRoot` calls this once its leave animation
     * has finished; call it directly only when there is no exit animation.
     */
    remove(id: string): void {
        const toast = this._toasts().find((t) => t.id === id);
        this.clearTimer(id);
        this._toasts.update((toasts) => toasts.filter((t) => t.id !== id));
        this.clearHeight(id);
        toast?.onRemove?.();
    }

    /** Toggle the expanded (hover/focus) state of the stack. Called by the viewport. */
    setExpanded(expanded: boolean): void {
        this._expanded.set(expanded);
    }

    /** Record a toast's measured height (px) for expanded-stack offset math. Called by each root. */
    setHeight(id: string, height: number): void {
        this._heights.update((heights) => (heights[id] === height ? heights : { ...heights, [id]: height }));
    }

    /** Pause every auto-dismiss timer (e.g. while the viewport is hovered, focused, or being swiped). */
    pauseAll(): void {
        if (this.pauseDepth++ > 0) {
            return;
        }
        const now = Date.now();
        this.timers.forEach((timer) => {
            if (timer.handle !== null) {
                clearTimeout(timer.handle);
                timer.remaining -= now - timer.start;
                timer.handle = null;
            }
        });
    }

    /** Release one pause; auto-dismiss timers resume only once every hold has released. */
    resumeAll(): void {
        if (this.pauseDepth === 0 || --this.pauseDepth > 0) {
            return;
        }
        const now = Date.now();
        this.timers.forEach((timer, id) => {
            if (timer.handle === null && timer.remaining > 0) {
                timer.start = now;
                timer.handle = setTimeout(() => this.close(id), timer.remaining);
            }
        });
    }

    /**
     * Drive a toast through a promise's lifecycle: show `loading`, then swap to `success` or
     * `error` copy when it settles. Returns the original promise for chaining.
     */
    async promise<Value, Data = unknown>(
        promise: Promise<Value>,
        options: RdxToastPromiseOptions<Value, Data>
    ): Promise<Value> {
        const id = this.add<Data>({ ...resolveCopy(options.loading), timeout: 0, loading: true });

        try {
            const value = await promise;
            this.update<Data>(id, { ...resolveCopy(options.success, value), loading: false, timeout: DEFAULT_TIMEOUT });
            return value;
        } catch (error) {
            this.update<Data>(id, { ...resolveCopy(options.error, error), loading: false, timeout: DEFAULT_TIMEOUT });
            throw error;
        }
    }

    private scheduleTimeout(toast: RdxToastObject): void {
        this.clearTimer(toast.id);

        const timeout = toast.timeout ?? this.defaultTimeout;
        if (timeout <= 0 || toast.loading) {
            return;
        }

        const timer: TimerState = { handle: null, remaining: timeout, start: Date.now() };
        if (this.pauseDepth === 0) {
            timer.handle = setTimeout(() => this.close(toast.id), timeout);
        }
        this.timers.set(toast.id, timer);
    }

    private clearTimer(id: string): void {
        const timer = this.timers.get(id);
        if (timer?.handle != null) {
            clearTimeout(timer.handle);
        }
        this.timers.delete(id);
    }

    private clearHeight(id: string): void {
        this._heights.update((heights) => {
            if (!(id in heights)) {
                return heights;
            }
            const next = { ...heights };
            delete next[id];
            return next;
        });
    }
}

/** Normalize a string-or-options promise-copy entry (optionally derived from the settled value). */
function resolveCopy<Value, Data>(
    entry: RdxToastAddOptions<Data> | string | ((value: Value) => RdxToastAddOptions<Data> | string),
    value?: Value
): RdxToastAddOptions<Data> {
    const resolved = typeof entry === 'function' ? entry(value as Value) : entry;
    return typeof resolved === 'string' ? { title: resolved } : resolved;
}

/** Provide a {@link RdxToastManager} for an app (e.g. in `app.config.ts`). */
export function provideRdxToastManager(): Provider[] {
    return [RdxToastManager];
}

/**
 * Hosts a {@link RdxToastManager} for its subtree. Put it on a wrapping element (or the app root)
 * so descendant viewports and components share one queue. `limit` caps simultaneously visible toasts.
 */
@Directive({
    selector: '[rdxToastProvider]',
    exportAs: 'rdxToastProvider',
    providers: [RdxToastManager]
})
export class RdxToastProvider {
    private readonly manager = inject(RdxToastManager);

    /** Max number of toasts shown at once. */
    readonly limit = input<number>(DEFAULT_LIMIT);

    /** Default auto-dismiss delay (ms) for toasts that omit their own `timeout`. `0` disables it. */
    readonly timeout = input<number>(DEFAULT_TIMEOUT);

    constructor() {
        // `limit` / `defaultTimeout` are plain fields on the manager; keep them in sync with inputs.
        effect(() => {
            this.manager.limit = this.limit();
            this.manager.defaultTimeout = this.timeout();
        });
    }
}
