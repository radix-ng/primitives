import { inject, InjectionToken, Provider } from '@angular/core';

export type RdxTrackCursorAxis = 'none' | 'x' | 'y' | 'both';

export type RdxTooltipConfig = {
    /**
     * How long to wait before opening the tooltip. Specified in milliseconds.
     * @defaultValue 600
     */
    delay?: number;
    /**
     * How long to wait before closing the tooltip. Specified in milliseconds.
     * @defaultValue 0
     */
    closeDelay?: number;
    /**
     * Another tooltip within the same provider opens instantly when this window
     * has not yet elapsed since the previous one closed. Specified in milliseconds.
     * @defaultValue 400
     */
    timeout?: number;
    /**
     * When `true`, the tooltip closes as the pointer leaves the trigger instead of
     * staying open while the pointer moves over the popup.
     * @defaultValue false
     */
    disableHoverablePopup?: boolean;
};

export const defaultTooltipConfig: Required<RdxTooltipConfig> = {
    delay: 600,
    closeDelay: 0,
    timeout: 400,
    disableHoverablePopup: false
};

export const RdxTooltipDefaultsToken = new InjectionToken<RdxTooltipConfig>('RdxTooltipDefaultsToken');

export function provideRdxTooltipConfig(config: Partial<RdxTooltipConfig>): Provider[] {
    return [
        {
            provide: RdxTooltipDefaultsToken,
            useValue: { ...defaultTooltipConfig, ...config }
        }
    ];
}

export function injectRdxTooltipConfig(): Required<RdxTooltipConfig> {
    return { ...defaultTooltipConfig, ...inject(RdxTooltipDefaultsToken, { optional: true }) };
}
