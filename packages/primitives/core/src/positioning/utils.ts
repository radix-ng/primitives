import { ConnectedPosition, ConnectionPositionPair } from '@angular/cdk/overlay';
import { RDX_POSITIONS } from './constants';
import {
    RdxAlign,
    RdxAllPossibleConnectedPositions,
    RdxArrowPositionParams,
    RdxSide,
    RdxSideAndAlign,
    RdxSideAndAlignOffsets
} from './types';

export function getContentPosition(
    sideAndAlignWithOffsets: RdxSideAndAlign & RdxSideAndAlignOffsets
): ConnectedPosition {
    const { side, align, sideOffset, alignOffset } = sideAndAlignWithOffsets;
    const position = {
        ...(RDX_POSITIONS[side]?.[align] ?? RDX_POSITIONS[RdxSide.Top][RdxAlign.Center])
    };
    if (sideOffset || alignOffset) {
        if ([RdxSide.Top, RdxSide.Bottom].includes(side)) {
            if (sideOffset) {
                position.offsetY = side === RdxSide.Top ? -sideOffset : sideOffset;
            }
            if (alignOffset) {
                position.offsetX = alignOffset;
            }
        } else {
            if (sideOffset) {
                position.offsetX = side === RdxSide.Left ? -sideOffset : sideOffset;
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
        Object.keys(RDX_POSITIONS).forEach((side) => {
            Object.keys(RDX_POSITIONS[side as RdxSide] ?? {}).forEach((align) => {
                (allPossibleConnectedPositions as Map<any, any>).set(
                    `${side as RdxSide}|${align as RdxAlign}`,
                    RDX_POSITIONS[side as RdxSide][align as RdxAlign]
                );
            });
        });
    }
    return allPossibleConnectedPositions;
}

export function getSideAndAlignFromAllPossibleConnectedPositions(position: ConnectionPositionPair): RdxSideAndAlign {
    const allPossibleConnectedPositions = getAllPossibleConnectedPositions();
    let sideAndAlign: RdxSideAndAlign | undefined;
    allPossibleConnectedPositions.forEach((value, key) => {
        if (
            position.originX === value.originX &&
            position.originY === value.originY &&
            position.overlayX === value.overlayX &&
            position.overlayY === value.overlayY
        ) {
            const sideAndAlignArray = key.split('|');
            sideAndAlign = {
                side: sideAndAlignArray[0] as RdxSide,
                align: sideAndAlignArray[1] as RdxAlign
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
    sideAndAlign: RdxSideAndAlign,
    arrowWidthAndHeight: { width: number; height: number },
    triggerWidthAndHeight: { width: number; height: number }
): RdxArrowPositionParams {
    const posParams: RdxArrowPositionParams = {
        top: '',
        left: '',
        transform: ''
    };

    if ([RdxSide.Top, RdxSide.Bottom].includes(sideAndAlign.side)) {
        if (sideAndAlign.side === RdxSide.Top) {
            posParams.top = '100%';
        } else {
            posParams.top = `-${arrowWidthAndHeight.height}px`;
            posParams.transform = `rotate(180deg)`;
        }

        if (sideAndAlign.align === RdxAlign.Start) {
            posParams.left = `${(triggerWidthAndHeight.width - arrowWidthAndHeight.width) / 2}px`;
        } else if (sideAndAlign.align === RdxAlign.Center) {
            posParams.left = `calc(50% - ${arrowWidthAndHeight.width / 2}px)`;
        } else if (sideAndAlign.align === RdxAlign.End) {
            posParams.left = `calc(100% - ${(triggerWidthAndHeight.width + arrowWidthAndHeight.width) / 2}px)`;
        }
    } else if ([RdxSide.Left, RdxSide.Right].includes(sideAndAlign.side)) {
        if (sideAndAlign.side === RdxSide.Left) {
            posParams.left = `100%`;
            posParams.transform = `rotate(-90deg) translate(0, -50%)`;
        } else {
            posParams.left = `-${arrowWidthAndHeight.width}px`;
            posParams.transform = `rotate(90deg) translate(0, -50%)`;
        }

        if (sideAndAlign.align === RdxAlign.Start) {
            posParams.top = `${(triggerWidthAndHeight.height - arrowWidthAndHeight.height) / 2}px`;
        } else if (sideAndAlign.align === RdxAlign.Center) {
            posParams.top = `calc(50% - ${arrowWidthAndHeight.height / 2}px)`;
        } else if (sideAndAlign.align === RdxAlign.End) {
            posParams.top = `calc(100% - ${(triggerWidthAndHeight.height + arrowWidthAndHeight.height) / 2}px)`;
        }
    }

    return posParams;
}
