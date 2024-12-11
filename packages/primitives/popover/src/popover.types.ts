import { ConnectionPositionPair } from '@angular/cdk/overlay';

export enum RdxPopoverSide {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left'
}

export enum RdxPopoverAlign {
    Start = 'start',
    Center = 'center',
    End = 'end'
}

export type RdxPopoverState = 'open' | 'closed';

export type RdxSideAndAlign = { side: RdxPopoverSide; align: RdxPopoverAlign };
export type RdxSideAndAlignOffsets = { sideOffset: number; alignOffset: number };

export type RdxPopoverPositions = {
    [key in RdxPopoverSide]: {
        [key in RdxPopoverAlign]: ConnectionPositionPair;
    };
};

export type RdxAllPossibleConnectedPositions = ReadonlyMap<
    `${RdxPopoverSide}|${RdxPopoverAlign}`,
    ConnectionPositionPair
>;

export type RdxArrowPositionParams = {
    top: string;
    bottom: string;
    left: string;
    right: string;
    transform: string;
};
