import { computed, InjectionToken, Provider, Signal, signal } from '@angular/core';
import { RdxDismissibleLayer } from './dismissible-layer';

export const RdxDismissibleLayersContextToken = new InjectionToken('RdxDismissibleLayersContextToken', {
    factory() {
        const layersRoot = signal<RdxDismissibleLayer[]>([]);

        return {
            layersRoot,
            layersWithOutsidePointerEventsDisabled: computed(() =>
                layersRoot().filter((i) => i.disableOutsidePointerEvents())
            ),
            branches: signal<HTMLElement[]>([])
        };
    }
});

export type RdxDismissibleLayerConfig = {
    /**
     * When `true`, hover/focus/click interactions will be disabled on elements outside
     * the `DismissableLayer`. Users will need to click twice on outside elements to
     * interact with them: once to close the `DismissableLayer`, and again to trigger the element.
     */
    disableOutsidePointerEvents: Signal<boolean>;
};

export const RdxDismissibleLayerConfigToken = new InjectionToken<RdxDismissibleLayerConfig>(
    'RdxDismissibleLayerConfig',
    {
        factory: () => ({
            disableOutsidePointerEvents: signal(false)
        })
    }
);

export function provideRdxDismissibleLayerConfig(factory: () => RdxDismissibleLayerConfig): Provider {
    return { provide: RdxDismissibleLayerConfigToken, useFactory: factory };
}
