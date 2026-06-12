import { computed, Directive, Injectable, Provider, signal, Signal } from '@angular/core';

/** A single open drawer's registration with the {@link RdxDrawerProvider}. */
export interface RdxDrawerRegistration {
    /** Stable id of the registered drawer root. */
    id: string;
    /** The drawer popup's measured size (px) along its dismiss axis. */
    height: Signal<number>;
    /** 0..1 live dismiss progress of this drawer. */
    swipeProgress: Signal<number>;
}

/**
 * App-level coordinator that tracks every open drawer so background content can react to them
 * (the page-scale / indent effect). Provide it once near the app root with
 * {@link provideRdxDrawerProvider} or the `[rdxDrawerProvider]` directive; drawers that find it in
 * their injector register while open. It is optional — drawers work without it.
 */
@Injectable()
export class RdxDrawerProvider {
    private readonly stack = signal<RdxDrawerRegistration[]>([]);

    /** Number of open drawers. */
    readonly count = computed(() => this.stack().length);

    /** Whether any drawer is open. */
    readonly active = computed(() => this.count() > 0);

    /** The most recently opened (frontmost) drawer, or `null`. */
    readonly frontmost = computed<RdxDrawerRegistration | null>(() => this.stack().at(-1) ?? null);

    /** The frontmost drawer's measured size (px), or `0` when none is open. */
    readonly frontmostHeight = computed(() => this.frontmost()?.height() ?? 0);
    /** The frontmost drawer's live dismiss progress, or `0` when none is open. */
    readonly swipeProgress = computed(() => this.frontmost()?.swipeProgress() ?? 0);

    /** Register an open drawer; returns a disposer that removes it. */
    register(registration: RdxDrawerRegistration): () => void {
        this.stack.update((stack) => [...stack, registration]);

        return () => this.stack.update((stack) => stack.filter((entry) => entry !== registration));
    }
}

/** Provide a {@link RdxDrawerProvider} for an app (e.g. in `app.config.ts`). */
export function provideRdxDrawerProvider(): Provider[] {
    return [RdxDrawerProvider];
}

/**
 * Hosts a {@link RdxDrawerProvider} for its subtree. Put it on a wrapping element so descendant
 * drawer roots and `rdxDrawerIndent*` parts share one coordinator.
 */
@Directive({
    selector: '[rdxDrawerProvider]',
    exportAs: 'rdxDrawerProvider',
    providers: [RdxDrawerProvider]
})
export class RdxDrawerProviderDirective {}
