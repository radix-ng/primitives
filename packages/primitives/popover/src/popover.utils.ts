import { ConnectedPosition, ConnectionPositionPair } from '@angular/cdk/overlay';
import { POPOVER_POSITIONS } from './popover.constants';
import {
    RdxAllPossibleConnectedPositions,
    RdxArrowPositionParams,
    RdxPopoverAlign,
    RdxPopoverSide,
    RdxSideAndAlign,
    RdxSideAndAlignOffsets
} from './popover.types';

let allPossibleConnectedPositions: RdxAllPossibleConnectedPositions;
export function getAllPossibleConnectedPositions() {
    if (!allPossibleConnectedPositions) {
        allPossibleConnectedPositions = new Map();
    }
    if (allPossibleConnectedPositions.size < 1) {
        Object.keys(POPOVER_POSITIONS).forEach((side) => {
            Object.keys(POPOVER_POSITIONS[side as RdxPopoverSide] ?? {}).forEach((align) => {
                (allPossibleConnectedPositions as Map<any, any>).set(
                    `${side as RdxPopoverSide}|${align as RdxPopoverAlign}`,
                    POPOVER_POSITIONS[side as RdxPopoverSide][align as RdxPopoverAlign]
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
                side: sideAndAlignArray[0] as RdxPopoverSide,
                align: sideAndAlignArray[1] as RdxPopoverAlign
            };
        }
    });
    if (!sideAndAlign) {
        throw Error(
            `[RdxPopover] cannot infer both side and align from the given position (${JSON.stringify(position)})`
        );
    }
    return sideAndAlign;
}

export function getContentPosition(
    sideAndAlignWithOffsets: RdxSideAndAlign & RdxSideAndAlignOffsets
): ConnectedPosition {
    const { side, align, sideOffset, alignOffset } = sideAndAlignWithOffsets;

    const position = {
        ...(POPOVER_POSITIONS[side]?.[align] ?? POPOVER_POSITIONS[RdxPopoverSide.Top][RdxPopoverAlign.Center])
    };

    if (sideOffset > 0) {
        let xFactor = 0;
        let yFactor = 0;

        switch (side) {
            case RdxPopoverSide.Top:
                yFactor = -1;
                break;
            case RdxPopoverSide.Bottom:
                yFactor = 1;
                break;
            case RdxPopoverSide.Left:
                xFactor = -1;
                break;
            case RdxPopoverSide.Right:
                xFactor = 1;
                break;
        }

        position.offsetX = xFactor * sideOffset;
        position.offsetY = yFactor * sideOffset;
    }

    if ([RdxPopoverAlign.Start, RdxPopoverAlign.End].includes(align) && alignOffset) {
        const alignOffsetFactor = align === RdxPopoverAlign.End ? -1 : 1;

        position.offsetX = alignOffsetFactor * alignOffset;
    }

    return position;
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

    if ([RdxPopoverSide.Top, RdxPopoverSide.Bottom].includes(sideAndAlign.side)) {
        if (sideAndAlign.side === RdxPopoverSide.Top) {
            posParams.top = '100%';
        } else {
            posParams.top = `-${arrowWidthAndHeight.height}px`;
            posParams.transform = `rotate(180deg)`;
        }

        if (sideAndAlign.align === RdxPopoverAlign.Start) {
            posParams.left = `${(triggerWidthAndHeight.width - arrowWidthAndHeight.width) / 2}px`;
        } else if (sideAndAlign.align === RdxPopoverAlign.Center) {
            posParams.left = `calc(50% - ${arrowWidthAndHeight.width / 2}px)`;
        } else if (sideAndAlign.align === RdxPopoverAlign.End) {
            posParams.left = `calc(100% - ${(triggerWidthAndHeight.width + arrowWidthAndHeight.width) / 2}px)`;
        }
    } else if ([RdxPopoverSide.Left, RdxPopoverSide.Right].includes(sideAndAlign.side)) {
        if (sideAndAlign.side === RdxPopoverSide.Left) {
            posParams.left = `100%`;
            posParams.transform = `rotate(-90deg) translate(0, -50%)`;
        } else {
            posParams.left = `-${arrowWidthAndHeight.width}px`;
            posParams.transform = `rotate(90deg) translate(0, -50%)`;
        }

        if (sideAndAlign.align === RdxPopoverAlign.Start) {
            posParams.top = `${(triggerWidthAndHeight.height - arrowWidthAndHeight.height) / 2}px`;
        } else if (sideAndAlign.align === RdxPopoverAlign.Center) {
            posParams.top = `calc(50% - ${arrowWidthAndHeight.height / 2}px)`;
        } else if (sideAndAlign.align === RdxPopoverAlign.End) {
            posParams.top = `calc(100% - ${(triggerWidthAndHeight.height + arrowWidthAndHeight.height) / 2}px)`;
        }
    }

    return posParams;
}
