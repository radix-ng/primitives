import { ConnectedPosition } from '@angular/cdk/overlay';
import { POPOVER_POSITIONS } from './popover.constants';
import { RdxPopoverAlign, RdxPopoverSide } from './popover.types';

export type SideAndAlign = { side: RdxPopoverSide; align: RdxPopoverAlign };

export function getContentPosition(
    sideAndAlign: SideAndAlign,
    sideOffset: number,
    alignOffset: number
): ConnectedPosition {
    const position =
        POPOVER_POSITIONS[sideAndAlign.side]?.[sideAndAlign.align] ??
        POPOVER_POSITIONS[RdxPopoverSide.Top][RdxPopoverAlign.Center];

    const { side, align } = sideAndAlign;

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
