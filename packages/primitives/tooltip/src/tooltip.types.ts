export enum RdxTooltipSide {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left'
}

export enum RdxTooltipAlign {
    Start = 'start',
    Center = 'center',
    End = 'end'
}

export type RdxTooltipConfig = {
    delayDuration: number;
    skipDelayDuration: number;
    disableHoverableContent?: boolean;
    hideDelayDuration?: number;
};

export type RdxTooltipState = 'delayed-open' | 'instant-open' | 'closed';
