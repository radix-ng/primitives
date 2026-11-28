import { computed, DestroyRef, Directive, effect, inject, Injectable, input, Provider, signal } from '@angular/core';
import { RdxIdGenerator } from '@radix-ng/primitives/core';
import { RdxToastAddOptions, RdxToastObject, RdxToastPromiseOptions } from './toast.types';

/** Default auto-dismiss delay (ms) applied when a toast omits `timeout`. */
const DEFAULT_TIMEOUT = 5000;
/** Max number of toasts shown in the stack. */
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
    private readonly closeListeners = new Set<(ids: ReadonlySet<string>) => void>();

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
        let visibleIndex = 0;
        let offsetInFront = 0;
        for (let i = list.length - 1; i >= 0; i--) {
            const toast = list[i];
            const visible = !toast.limited && toast.transitionStatus !== 'ending';
            result[toast.id] = { index: visible ? visibleIndex++ : list.length - 1 - i, offsetY: offsetInFront };
            if (visible) offsetInFront += heights[toast.id] ?? 0;
        }
        return result;
    });

    /** @internal The height of the newest visible toast, for the viewport's CSS variable. */
    readonly frontmostHeight = computed(() => {
        const toasts = this._toasts();
        for (let index = toasts.length - 1; index >= 0; index--) {
            const toast = toasts[index];
            if (!toast.limited && toast.transitionStatus !== 'ending') return this._heights()[toast.id];
        }
        return undefined;
    });

    private visibleLimit = DEFAULT_LIMIT;

    /** Max number of simultaneously visible toasts. Configurable via `[rdxToastProvider]`. */
    get limit(): number {
        return this.visibleLimit;
    }

    set limit(limit: number) {
        if (this.visibleLimit !== limit) {
            this.visibleLimit = limit;
            this.setToasts(this._toasts());
        }
    }

    /** Default auto-dismiss delay (ms) for toasts that omit `timeout`. Set via `[rdxToastProvider]`. */
    defaultTimeout = DEFAULT_TIMEOUT;

    private readonly timers = new Map<string, TimerState>();
    /** Nested-pause depth so overlapping holds (hover + swipe) resume only when all release. */
    private pauseDepth = 0;

    constructor() {
        inject(DestroyRef).onDestroy(() => {
            this.timers.forEach((_, id) => this.clearTimer(id));
            this.closeListeners.clear();
        });
    }

    /** Queue a new toast. Returns its id (generated when not supplied). */
    add<Data = unknown>(options: RdxToastAddOptions<Data>): string {
        const id = options.id ?? this.idGenerator.getId('rdx-toast-');
        const existing = this._toasts().find((toast) => toast.id === id);
        if (existing && existing.transitionStatus !== 'ending') {
            this.updateToast(existing, options, true);
            return id;
        }

        const toast: RdxToastObject<Data> = {
            ...options,
            id,
            priority: options.priority ?? 'low',
            transitionStatus: 'starting'
        };

        this.setToasts([...this._toasts().filter((item) => item.id !== id), toast]);
        this.scheduleTimeout(toast);
        return id;
    }

    /** Merge new options into a toast that has not started closing. */
    update<Data = unknown>(id: string, options: Partial<RdxToastAddOptions<Data>>): void {
        const toast = this._toasts().find((t) => t.id === id);
        if (toast && toast.transitionStatus !== 'ending') {
            this.updateToast(toast, options);
        }
    }

    /**
     * Begin dismissing a toast: fire `onClose`, then remove it after the leave animation.
     * Omit `id` to dismiss every toast at once (mirrors Base UI's `close()`).
     */
    close(id?: string): void {
        const toasts = this._toasts();
        const closing = toasts.filter(
            (toast) => (id === undefined || toast.id === id) && toast.transitionStatus !== 'ending'
        );
        if (closing.length === 0) return;

        const ids = new Set(closing.map((toast) => toast.id));
        ids.forEach((toastId) => this.clearTimer(toastId));
        this.setToasts(toasts.map((toast) => (ids.has(toast.id) ? { ...toast, transitionStatus: 'ending' } : toast)));
        closing.forEach((toast) => toast.onClose?.());
        this.closeListeners.forEach((listener) => listener(ids));
    }

    /**
     * Remove a toast from the queue immediately. `RdxToastRoot` calls this once its leave animation
     * has finished; call it directly only when there is no exit animation.
     */
    remove(id: string): void {
        const toast = this._toasts().find((t) => t.id === id);
        this.clearTimer(id);
        this.setToasts(this._toasts().filter((t) => t.id !== id));
        this.clearHeight(id);
        toast?.onRemove?.();
    }

    /** @internal Registers a viewport to recover focus after the queue commits a dismissal. */
    onClose(listener: (ids: ReadonlySet<string>) => void): () => void {
        this.closeListeners.add(listener);
        return () => this.closeListeners.delete(listener);
    }

    /** @internal Completes the phase only if its queue entry still owns this transition. */
    completeTransition(toast: RdxToastObject): void {
        const current = this._toasts();
        if (!current.includes(toast)) return;
        if (toast.transitionStatus === 'ending') {
            this.remove(toast.id);
        } else if (toast.transitionStatus === 'starting') {
            this._toasts.set(current.map((item) => (item === toast ? { ...item, transitionStatus: undefined } : item)));
        }
    }

    /** Toggle the expanded (hover/focus) state of the stack. Called by the viewport. */
    setExpanded(expanded: boolean): void {
        this._expanded.set(expanded);
    }

    /** Record a toast's measured height (px) for expanded-stack offset math. Called by each root. */
    setHeight(id: string, height: number): void {
        this._heights.update((heights) => ((heights[id] ?? 0) === height ? heights : { ...heights, [id]: height }));
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
            if (timer.handle === null) {
                timer.start = now;
                timer.handle = setTimeout(() => this.close(id), Math.max(timer.remaining, 0));
            }
        });
    }

    /**
     * Drive a toast through a promise's lifecycle: show `loading`, then swap to `success` or
     * `error` copy on the active toast with that ID when it settles. The returned promise
     * resolves with the operation's value or rejects with its error.
     */
    async promise<Value, Data = unknown>(
        promise: Promise<Value>,
        options: RdxToastPromiseOptions<Value, Data>
    ): Promise<Value> {
        const id = this.add<Data>({ ...resolveCopy(options.loading), type: 'loading', loading: true });
        const settle = (result: RdxToastAddOptions<Data>, type: 'success' | 'error') => {
            this.update<Data>(id, { ...result, type, loading: false, timeout: result.timeout });
        };

        try {
            const value = await promise;
            settle(resolveCopy(options.success, value), 'success');
            return value;
        } catch (error) {
            settle(resolveCopy(options.error, error), 'error');
            throw error;
        }
    }

    private setToasts(toasts: RdxToastObject[]): void {
        let active = 0;
        const next = toasts.slice();
        for (let i = next.length - 1; i >= 0; i--) {
            const toast = next[i];
            if (toast.transitionStatus !== 'ending') {
                const limited = active++ >= this.limit;
                if (Boolean(toast.limited) !== limited) next[i] = { ...toast, limited };
            }
        }
        this._toasts.set(next);
    }

    private updateToast<Data>(
        toast: RdxToastObject,
        options: Partial<RdxToastAddOptions<Data>>,
        resetTimer = false
    ): void {
        const next = { ...toast, ...options, id: toast.id };
        this._toasts.update((toasts) => toasts.map((item) => (item === toast ? next : item)));
        if (
            resetTimer ||
            !this.timers.has(toast.id) ||
            Object.hasOwn(options, 'timeout') ||
            this.isLoading(toast) !== this.isLoading(next)
        ) {
            this.scheduleTimeout(next);
        }
    }

    private scheduleTimeout(toast: RdxToastObject): void {
        this.clearTimer(toast.id);

        const timeout = toast.timeout ?? this.defaultTimeout;
        if (timeout <= 0 || this.isLoading(toast)) {
            return;
        }

        const timer: TimerState = { handle: null, remaining: timeout, start: Date.now() };
        if (this.pauseDepth === 0) {
            timer.handle = setTimeout(() => this.close(toast.id), timeout);
        }
        this.timers.set(toast.id, timer);
    }

    private isLoading(toast: RdxToastObject): boolean {
        return Boolean(toast.loading || toast.type === 'loading');
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
