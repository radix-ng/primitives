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

export enum RdxPopoverState {
    OPEN = 'open',
    CLOSED = 'closed'
}

export enum RdxPopoverAttachDetachEvent {
    ATTACH = 'attach',
    DETACH = 'detach'
}

export enum AnimationType {
    START = 'animationstart',
    END = 'animationend'
}

export enum RdxPopoverAnimationStatus {
    OPEN_STARTED = 'open_started',
    OPEN_ENDED = 'open_ended',
    CLOSED_STARTED = 'closed_started',
    CLOSED_ENDED = 'closed_ended'
}

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
    left: string;
    transform: string;
};
