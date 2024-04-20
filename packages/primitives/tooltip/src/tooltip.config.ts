import { inject, InjectionToken, Provider } from '@angular/core';

import { Placement } from '@floating-ui/dom';

export const TooltipConfigToken = new InjectionToken<TooltipConfig>('TooltipConfig');

export interface TooltipConfig {
    /**
     * Define the offset of the tooltip relative to the trigger.
     * @default 4
     */
    offset: number;

    /**
     * Define the placement of the tooltip relative to the trigger.
     * @default 'top'
     */
    placement: Placement;

    /**
     * Define the delay before the tooltip is shown.
     * @default 0
     */
    showDelay: number;

    /**
     * Define the delay before the tooltip is hidden.
     * @default 0
     */
    hideDelay: number;

    /**
     * Define whether the tooltip should flip when there is not enough space for the tooltip.
     * @default true
     */
    flip: boolean;

    /**
     * Define the container in to which the tooltip should be attached.
     * @default document.body
     */
    container: HTMLElement;
}

const defaultTooltipConfig: TooltipConfig = {
    offset: 4,
    placement: 'top',
    showDelay: 0,
    hideDelay: 0,
    flip: true,
    container: document.body
};

/**
 * Provide the default Tooltip configuration
 * @param config The Tooltip configuration
 * @returns The provider
 */
export function provideTooltipConfig(config: Partial<TooltipConfig>): Provider[] {
    return [
        {
            provide: TooltipConfigToken,
            useValue: { ...defaultTooltipConfig, ...config }
        }
    ];
}

/**
 * Inject the Tooltip configuration
 * @returns The global Tooltip configuration
 */
export function injectTooltipConfig(): TooltipConfig {
    return inject(TooltipConfigToken, { optional: true }) ?? defaultTooltipConfig;
}
