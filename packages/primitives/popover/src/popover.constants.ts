import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { RdxPopoverAlign, RdxPopoverSide } from './popover.types';

type PopoverPositions = {
    [key in RdxPopoverSide]: {
        [key in RdxPopoverAlign]: ConnectionPositionPair;
    };
};

export const POPOVER_POSITIONS: PopoverPositions = {
    [RdxPopoverSide.Top]: {
        [RdxPopoverAlign.Center]: {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom'
        },
        [RdxPopoverAlign.Start]: {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom'
        },
        [RdxPopoverAlign.End]: {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom'
        }
    },
    [RdxPopoverSide.Right]: {
        [RdxPopoverAlign.Center]: {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center'
        },
        [RdxPopoverAlign.Start]: {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top'
        },
        [RdxPopoverAlign.End]: {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'bottom'
        }
    },
    [RdxPopoverSide.Bottom]: {
        [RdxPopoverAlign.Center]: {
            originX: 'center',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top'
        },
        [RdxPopoverAlign.Start]: {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
        },
        [RdxPopoverAlign.End]: {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top'
        }
    },
    [RdxPopoverSide.Left]: {
        [RdxPopoverAlign.Center]: {
            originX: 'start',
            originY: 'center',
            overlayX: 'end',
            overlayY: 'center'
        },
        [RdxPopoverAlign.Start]: {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top'
        },
        [RdxPopoverAlign.End]: {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'bottom'
        }
    }
};
