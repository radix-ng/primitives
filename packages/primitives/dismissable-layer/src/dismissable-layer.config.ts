import { computed, InjectionToken, Provider, Signal, signal } from '@angular/core';
import { RdxDismissableLayer } from './dismissable-layer';

export const RdxDismissableLayersContextToken = new InjectionToken('RdxDismissableLayersContextToken', {
    factory() {
        const layersRoot = signal<RdxDismissableLayer[]>([]);

        return {
            layersRoot,
            layersWithOutsidePointerEventsDisabled: computed(() =>
                layersRoot().filter((i) => i.disableOutsidePointerEvents())
            ),
            branches: signal<HTMLElement[]>([])
        };
    }
});

export type RdxDismissableLayerConfig = {
    /**
     * When `true`, hover/focus/click interactions will be disabled on elements outside
     * the `DismissableLayer`. Users will need to click twice on outside elements to
     * interact with them: once to close the `DismissableLayer`, and again to trigger the element.
     */
    disableOutsidePointerEvents: Signal<boolean>;
};

export const RdxDismissableLayerConfigToken = new InjectionToken<RdxDismissableLayerConfig>(
    'RdxDismissableLayerConfig',
    {
        factory: () => {
            return {
                disableOutsidePointerEvents: signal(false)
            };
        }
    }
);

export function provideRdxDismissableLayerConfig(factory: () => RdxDismissableLayerConfig): Provider {
    return { provide: RdxDismissableLayerConfigToken, useFactory: factory };
}
