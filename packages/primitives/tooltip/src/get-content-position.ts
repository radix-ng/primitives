import { ConnectedPosition } from '@angular/cdk/overlay';
import { TOOLTIP_POSITIONS } from './tooltip.constants';
import { RdxTooltipAlign, RdxTooltipSide } from './tooltip.types';

export function getContentPosition(
    side: RdxTooltipSide,
    align: RdxTooltipAlign,
    sideOffset: number,
    alignOffset: number
): ConnectedPosition {
    const position = TOOLTIP_POSITIONS[side][align] ?? TOOLTIP_POSITIONS[RdxTooltipSide.Top][RdxTooltipAlign.Center];

    if (sideOffset > 0) {
        let xFactor = 0;
        let yFactor = 0;

        switch (side) {
            case RdxTooltipSide.Top:
                yFactor = -1;
                break;
            case RdxTooltipSide.Bottom:
                yFactor = 1;
                break;
            case RdxTooltipSide.Left:
                xFactor = -1;
                break;
            case RdxTooltipSide.Right:
                xFactor = 1;
                break;
        }

        position.offsetX = xFactor * sideOffset;
        position.offsetY = yFactor * sideOffset;
    }

    if ([RdxTooltipAlign.Start, RdxTooltipAlign.End].includes(align) && alignOffset) {
        const alignOffsetFactor = align === RdxTooltipAlign.End ? -1 : 1;

        position.offsetX = alignOffsetFactor * alignOffset;
    }

    return position;
}
