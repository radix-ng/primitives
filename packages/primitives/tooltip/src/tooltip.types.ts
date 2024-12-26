export type RdxTooltipConfig = {
    delayDuration: number;
    skipDelayDuration: number;
    disableHoverableContent?: boolean;
    hideDelayDuration?: number;
};

export type RdxTooltipState = 'delayed-open' | 'instant-open' | 'closed';
