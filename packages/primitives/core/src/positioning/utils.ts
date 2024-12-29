import { ConnectedPosition, ConnectionPositionPair } from '@angular/cdk/overlay';
import { RDX_POSITIONS } from './constants';
import {
    RdxAllPossibleConnectedPositions,
    RdxArrowPositionParams,
    RdxPositionAlign,
    RdxPositionSide,
    RdxPositionSideAndAlign,
    RdxPositionSideAndAlignOffsets
} from './types';

export function getContentPosition(
    sideAndAlignWithOffsets: RdxPositionSideAndAlign & RdxPositionSideAndAlignOffsets
): ConnectedPosition {
    const { side, align, sideOffset, alignOffset } = sideAndAlignWithOffsets;
    const position: ConnectedPosition = {
        ...(RDX_POSITIONS[side]?.[align] ?? RDX_POSITIONS[RdxPositionSide.Top][RdxPositionAlign.Center])
    };
    if (sideOffset || alignOffset) {
        if ([RdxPositionSide.Top, RdxPositionSide.Bottom].includes(side)) {
            if (sideOffset) {
                position.offsetY = side === RdxPositionSide.Top ? -sideOffset : sideOffset;
            }
            if (alignOffset) {
                position.offsetX = alignOffset;
            }
        } else {
            if (sideOffset) {
                position.offsetX = side === RdxPositionSide.Left ? -sideOffset : sideOffset;
            }
            if (alignOffset) {
                position.offsetY = alignOffset;
            }
        }
    }
    return position;
}

let allPossibleConnectedPositions: RdxAllPossibleConnectedPositions;
export function getAllPossibleConnectedPositions() {
    if (!allPossibleConnectedPositions) {
        allPossibleConnectedPositions = new Map();
    }
    if (allPossibleConnectedPositions.size < 1) {
        for (const [side, aligns] of Object.entries(RDX_POSITIONS)) {
            for (const [align, position] of Object.entries(aligns)) {
                (allPossibleConnectedPositions as Map<any, any>).set(`${side}|${align}`, position);
            }
        }
    }
    return allPossibleConnectedPositions;
}

export function getSideAndAlignFromAllPossibleConnectedPositions(
    position: ConnectionPositionPair
): RdxPositionSideAndAlign {
    const allPossibleConnectedPositions = getAllPossibleConnectedPositions();
    let sideAndAlign: RdxPositionSideAndAlign | undefined;
    allPossibleConnectedPositions.forEach((value, key) => {
        if (
            position.originX === value.originX &&
            position.originY === value.originY &&
            position.overlayX === value.overlayX &&
            position.overlayY === value.overlayY
        ) {
            const sideAndAlignArray = key.split('|');
            sideAndAlign = {
                side: sideAndAlignArray[0] as RdxPositionSide,
                align: sideAndAlignArray[1] as RdxPositionAlign
            };
        }
    });
    if (!sideAndAlign) {
        throw Error(
            `[Rdx positioning] cannot infer both side and align from the given position (${JSON.stringify(position)})`
        );
    }
    return sideAndAlign;
}

export function getArrowPositionParams(
    sideAndAlign: RdxPositionSideAndAlign,
    arrowWidthAndHeight: { width: number; height: number },
    triggerWidthAndHeight: { width: number; height: number }
): RdxArrowPositionParams {
    const posParams: RdxArrowPositionParams = {
        top: '',
        left: '',
        transform: '',
        transformOrigin: 'center center 0px'
    };

    if ([RdxPositionSide.Top, RdxPositionSide.Bottom].includes(sideAndAlign.side)) {
        if (sideAndAlign.side === RdxPositionSide.Top) {
            posParams.top = '100%';
        } else {
            posParams.top = `-${arrowWidthAndHeight.height}px`;
            posParams.transform = `rotate(180deg)`;
        }

        if (sideAndAlign.align === RdxPositionAlign.Start) {
            posParams.left = `${(triggerWidthAndHeight.width - arrowWidthAndHeight.width) / 2}px`;
        } else if (sideAndAlign.align === RdxPositionAlign.Center) {
            posParams.left = `calc(50% - ${arrowWidthAndHeight.width / 2}px)`;
        } else if (sideAndAlign.align === RdxPositionAlign.End) {
            posParams.left = `calc(100% - ${(triggerWidthAndHeight.width + arrowWidthAndHeight.width) / 2}px)`;
        }
    } else if ([RdxPositionSide.Left, RdxPositionSide.Right].includes(sideAndAlign.side)) {
        if (sideAndAlign.side === RdxPositionSide.Left) {
            posParams.left = `calc(100% - ${arrowWidthAndHeight.width}px)`;
            posParams.transform = `rotate(-90deg)`;
            posParams.transformOrigin = 'top right 0px';
        } else {
            posParams.left = `0`;
            posParams.transform = `rotate(90deg)`;
            posParams.transformOrigin = 'top left 0px';
        }

        if (sideAndAlign.align === RdxPositionAlign.Start) {
            posParams.top = `${(triggerWidthAndHeight.height - arrowWidthAndHeight.width) / 2}px`;
        } else if (sideAndAlign.align === RdxPositionAlign.Center) {
            posParams.top = `calc(50% - ${arrowWidthAndHeight.width / 2}px)`;
        } else if (sideAndAlign.align === RdxPositionAlign.End) {
            posParams.top = `calc(100% - ${(triggerWidthAndHeight.height + arrowWidthAndHeight.width) / 2}px)`;
        }
    }

    return posParams;
}
