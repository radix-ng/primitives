import { inject, InjectionToken, Provider } from '@angular/core';

export type RdxTooltipConfig = {
    delayDuration: number;
    skipDelayDuration: number;
    disableHoverableContent?: boolean;
};

export const defaultTooltipConfig: RdxTooltipConfig = {
    delayDuration: 700,
    skipDelayDuration: 300
};

export const RdxTooltipConfigToken = new InjectionToken<RdxTooltipConfig>('RdxTooltipConfigToken');

export function provideRdxTooltipConfig(config: Partial<RdxTooltipConfig>): Provider[] {
    return [
        {
            provide: RdxTooltipConfigToken,
            useValue: { ...defaultTooltipConfig, ...config }
        }
    ];
}

export function injectTooltipConfig(): RdxTooltipConfig {
    return inject(RdxTooltipConfigToken, { optional: true }) ?? defaultTooltipConfig;
}
