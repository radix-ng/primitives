import { ConnectionPositionPair } from '@angular/cdk/overlay';

export enum RdxSide {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left'
}

export enum RdxAlign {
    Start = 'start',
    Center = 'center',
    End = 'end'
}

export type RdxSideAndAlign = { side: RdxSide; align: RdxAlign };
export type RdxSideAndAlignOffsets = { sideOffset: number; alignOffset: number };

export type RdxPositions = {
    [key in RdxSide]: {
        [key in RdxAlign]: ConnectionPositionPair;
    };
};

export type RdxAllPossibleConnectedPositions = ReadonlyMap<`${RdxSide}|${RdxAlign}`, ConnectionPositionPair>;
export type RdxArrowPositionParams = {
    top: string;
    left: string;
    transform: string;
};
