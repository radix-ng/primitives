import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { RdxTooltipAlign, RdxTooltipSide } from './tooltip.types';

type TooltipPositions = {
    [key in RdxTooltipSide]: {
        [key in RdxTooltipAlign]: ConnectionPositionPair;
    };
};

export const TOOLTIP_POSITIONS: TooltipPositions = {
    [RdxTooltipSide.Top]: {
        [RdxTooltipAlign.Center]: {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom'
        },
        [RdxTooltipAlign.Start]: {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom'
        },
        [RdxTooltipAlign.End]: {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom'
        }
    },
    [RdxTooltipSide.Right]: {
        [RdxTooltipAlign.Center]: {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center'
        },
        [RdxTooltipAlign.Start]: {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top'
        },
        [RdxTooltipAlign.End]: {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'bottom'
        }
    },
    [RdxTooltipSide.Bottom]: {
        [RdxTooltipAlign.Center]: {
            originX: 'center',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top'
        },
        [RdxTooltipAlign.Start]: {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
        },
        [RdxTooltipAlign.End]: {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top'
        }
    },
    [RdxTooltipSide.Left]: {
        [RdxTooltipAlign.Center]: {
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center'
        },
        [RdxTooltipAlign.Start]: {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top'
        },
        [RdxTooltipAlign.End]: {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'bottom'
        }
    }
};
