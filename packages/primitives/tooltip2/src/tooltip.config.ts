import { inject, InjectionToken, Provider } from '@angular/core';

export type RdxTooltipConfig = {
    /**
     * The duration from when the pointer enters the trigger until the tooltip gets opened.
     * @defaultValue 700
     */
    delayDuration?: number;
    /**
     * How much time a user has to enter another trigger without incurring a delay again.
     * @defaultValue 300
     */
    skipDelayDuration?: number;
    /**
     * When `true`, trying to hover the content will result in the tooltip closing as the pointer leaves the trigger.
     * @defaultValue false
     */
    disableHoverableContent?: boolean;
};

export const defaultTooltipConfig: RdxTooltipConfig = {
    delayDuration: 700,
    skipDelayDuration: 300,
    disableHoverableContent: false
};

export const RdxTooltipDefaultsToken = new InjectionToken<RdxTooltipConfig>('RdxTooltipDefaults Token');

export function provideRdxTooltipConfig(config: Partial<RdxTooltipConfig>): Provider[] {
    return [
        {
            provide: RdxTooltipDefaultsToken,
            useValue: { ...defaultTooltipConfig, ...config }
        }
    ];
}

export function injectRdxTooltipConfig(): RdxTooltipConfig {
    return inject(RdxTooltipDefaultsToken, { optional: true }) ?? defaultTooltipConfig;
}
