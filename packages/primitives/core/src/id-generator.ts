import { APP_ID, inject, Injectable } from '@angular/core';

/**
 * Per-prefix counters, kept module-global so generated IDs stay deterministic within a run.
 * Determinism keeps server and client renders in sync, which matters for hydration.
 */
const counters = new Map<string, number>();

/**
 * Generates unique, SSR-stable IDs for DOM nodes.
 *
 * IDs are deterministic per prefix (a monotonic counter) so the server and the client produce the
 * same sequence and hydration does not mismatch. The application's `APP_ID` is folded into the
 * prefix so multiple Angular apps on one page don't collide; the default `ng` app id is omitted to
 * keep IDs short for the common single-app case.
 *
 * Prefer the {@link injectId} hook at call sites; inject this service directly only when you need to
 * generate IDs lazily outside an injection context.
 */
@Injectable({ providedIn: 'root' })
export class RdxIdGenerator {
    private readonly appId = inject(APP_ID);

    /** Generates a unique ID with the given prefix. */
    getId(prefix: string): string {
        const key = this.appId === 'ng' ? prefix : prefix + this.appId;
        const next = counters.get(key) ?? 0;
        counters.set(key, next + 1);

        return `${key}${next}`;
    }
}

/**
 * Returns a unique, SSR-stable ID for the given prefix — the Angular counterpart of React's
 * `useId`. Must be called in an injection context (e.g. a field initializer or constructor).
 *
 * @example
 * readonly contentId = injectId('rdx-dialog-content-');
 */
export function injectId(prefix: string): string {
    return inject(RdxIdGenerator).getId(prefix);
}
