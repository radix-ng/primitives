import { computed, Directive, inject, InjectionToken, input, Provider, Signal } from '@angular/core';
import { Direction } from '@radix-ng/primitives/core';

export type RdxDirectionValue = Direction | Signal<Direction> | (() => Direction);

export const RDX_DIRECTION = new InjectionToken<Signal<Direction>>('RDX_DIRECTION', {
    providedIn: 'root',
    factory: () => computed(() => 'ltr')
});

function resolveDirection(value: RdxDirectionValue): Direction {
    return typeof value === 'function' ? value() : value;
}

/**
 * Provides a primitive behavior direction through Angular DI.
 */
export function provideDirection(direction: RdxDirectionValue): Provider {
    return {
        provide: RDX_DIRECTION,
        useFactory: () => computed(() => resolveDirection(direction))
    };
}

function directionProviderSignal(): Signal<Direction> {
    return inject(RdxDirectionProvider).direction;
}

/**
 * Provides a reading direction for descendant primitives.
 *
 * This controls primitive behavior only. Set the native `dir` attribute or CSS `direction`
 * separately when the DOM itself should render right-to-left.
 */
@Directive({
    selector: '[rdxDirectionProvider]',
    exportAs: 'rdxDirectionProvider',
    providers: [{ provide: RDX_DIRECTION, useFactory: directionProviderSignal }]
})
export class RdxDirectionProvider {
    private readonly parentDirection = inject(RDX_DIRECTION, { skipSelf: true });

    /**
     * The reading direction for descendant primitives.
     *
     * @defaultValue 'ltr'
     */
    readonly directionInput = input<Direction | undefined>(undefined, { alias: 'direction' });

    /** Alias for Angular templates that prefer `[dir]`. */
    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });

    readonly direction: Signal<Direction> = computed(
        () => this.directionInput() ?? this.dirInput() ?? this.parentDirection()
    );
}

/**
 * Reads the effective primitive direction.
 *
 * Priority: explicit local input, nearest DI direction provider, global `provideRadixNG({ dir })`.
 */
export function injectDirection(localDirection?: Signal<Direction | undefined>): Signal<Direction> {
    const direction = inject(RDX_DIRECTION);

    return computed(() => localDirection?.() ?? direction());
}
