import { inject, InjectionToken, Provider } from '@angular/core';

export const RdxAccordionConfigToken = new InjectionToken<RdxAccordionConfig>(
    'RdxAccordionConfiguration'
);

export interface RdxAccordionConfig {
    /**
     * Determines whether multiple items can be open simultaneously.
     * @default false
     */
    multiple: boolean;

    /**
     * The orientation of the accordion.
     * @default 'vertical'
     */
    orientation: 'horizontal' | 'vertical';
}

const defaultAccordionConfig: RdxAccordionConfig = {
    multiple: false,
    orientation: 'vertical'
};

/**
 * Provide the default accordion configuration
 * @param config The accordion configuration
 * @returns The provider
 */
export function provideAccordionConfig(config: Partial<RdxAccordionConfig>): Provider[] {
    return [
        {
            provide: RdxAccordionConfigToken,
            useValue: { ...defaultAccordionConfig, ...config }
        }
    ];
}

/**
 * Inject the accordion configuration
 * @returns The global accordion configuration
 */
export function injectAccordionConfig(): RdxAccordionConfig {
    return inject(RdxAccordionConfigToken, { optional: true }) ?? defaultAccordionConfig;
}
