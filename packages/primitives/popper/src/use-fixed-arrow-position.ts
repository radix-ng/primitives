import { afterRenderEffect, computed, OutputRef, signal } from '@angular/core';
import { arrow, autoUpdate, computePosition, Placement } from '@floating-ui/dom';
import type { RdxPopperArrowGeometry } from './popper-arrow';
import type { Align, Side } from './utils';

/**
 * @internal Positions only an arrow for an already placed popup. Floating UI owns the arrow math;
 * the owning positioner retains its popup coordinates and emits `placed` after changing them.
 */
export function useFixedArrowPosition(options: {
    enabled: () => boolean;
    anchor: () => HTMLElement | null;
    floating: () => HTMLElement | undefined;
    arrow: HTMLElement;
    side: Side;
    align: Align;
    placed: OutputRef<void>;
}): RdxPopperArrowGeometry {
    const data = signal<{ x?: number; y?: number; centerOffset?: number }>({});

    afterRenderEffect((onCleanup) => {
        const anchor = options.anchor();
        const floating = options.floating();
        if (!options.enabled() || !anchor || !floating) {
            return;
        }

        let active = true;
        let sequence = 0;
        const update = async () => {
            const current = ++sequence;
            const rect = floating.getBoundingClientRect();
            const position = await computePosition(anchor, floating, {
                strategy: 'fixed',
                placement: (options.side + (options.align === 'center' ? '' : `-${options.align}`)) as Placement,
                middleware: [
                    { name: 'fixedPosition', fn: () => ({ x: rect.left, y: rect.top }) },
                    arrow({ element: options.arrow })
                ]
            });
            if (active && current === sequence) {
                data.set(position.middlewareData.arrow ?? {});
            }
        };
        const stop = autoUpdate(anchor, floating, update);
        const subscription = options.placed.subscribe(update);
        const observer = new ResizeObserver(update);
        observer.observe(options.arrow);
        onCleanup(() => {
            active = false;
            stop();
            subscription.unsubscribe();
            observer.disconnect();
        });
    });

    return {
        physicalPlacedSide: computed(() => options.side),
        arrowX: computed(() => data().x),
        arrowY: computed(() => data().y),
        arrowUncentered: computed(() => (data().centerOffset ?? 0) !== 0)
    };
}
