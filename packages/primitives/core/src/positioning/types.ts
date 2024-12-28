import { ConnectionPositionPair } from '@angular/cdk/overlay';

export enum RdxPositionSide {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left'
}

export enum RdxPositionAlign {
    Start = 'start',
    Center = 'center',
    End = 'end'
}

export type RdxPositionSideAndAlign = { side: RdxPositionSide; align: RdxPositionAlign };
export type RdxPositionSideAndAlignOffsets = { sideOffset: number; alignOffset: number };

export type RdxPositions = Readonly<{
    [key in RdxPositionSide]: Readonly<{
        [key in RdxPositionAlign]: Readonly<ConnectionPositionPair>;
    }>;
}>;

export type RdxPositioningDefaults = Readonly<{
    offsets: Readonly<{
        side: number;
        align: number;
    }>;
    arrow: Readonly<{
        width: number;
        height: number;
    }>;
}>;

export type RdxAllPossibleConnectedPositions = ReadonlyMap<
    `${RdxPositionSide}|${RdxPositionAlign}`,
    ConnectionPositionPair
>;
export type RdxArrowPositionParams = {
    top: string;
    left: string;
    transform: string;
    transformOrigin: string;
};
