import { usePointerDrag } from './drawer-pointer';
import { injectRdxDrawerRootContext } from './drawer-root';
import { RdxDrawerSwipeDirection } from './drawer-swipe';
import { booleanAttribute, computed, Directive, input, signal } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectRdxDialogRootContext } from '@radix-ng/primitives/dialog';

/** Pointer travel (px) inward past which releasing the swipe keeps the drawer open. */
const OPEN_THRESHOLD = 30;

/** Pointer travel in a given direction. */
function directionalDistance(direction: RdxDrawerSwipeDirection, dx: number, dy: number) {
    switch (direction) {
        case 'down':
            return dy;
        case 'up':
            return -dy;
        case 'left':
            return -dx;
        case 'right':
            return dx;
    }
}

const oppositeDirection: Record<RdxDrawerSwipeDirection, RdxDrawerSwipeDirection> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
};

const touchAction = (direction: RdxDrawerSwipeDirection) =>
    direction === 'left' || direction === 'right' ? 'pan-y' : 'pan-x';

/**
 * An off-canvas region (typically pinned to a screen edge) that opens the drawer when swiped inward.
 *
 * Opens the drawer at the start of a drag so its popup can follow the pointer live. Releasing past
 * the threshold settles open; releasing before it or cancelling animates the drawer back out.
 */
@Directive({
    selector: '[rdxDrawerSwipeArea]',
    exportAs: 'rdxDrawerSwipeArea',
    host: {
        '[attr.data-open]': 'isOpen() ? "" : undefined',
        '[attr.data-closed]': 'isOpen() ? undefined : ""',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-swiping]': 'swiping() ? "" : undefined',
        '[attr.data-swipe-direction]': 'direction()',
        '[style.pointer-events]': 'disabled() || isOpen() ? "none" : undefined',
        '[style.touch-action]': 'resolvedTouchAction()',
        role: 'presentation',
        'aria-hidden': 'true'
    }
})
export class RdxDrawerSwipeArea {
    private readonly drawerContext = injectRdxDrawerRootContext();
    private readonly dialogContext = injectRdxDialogRootContext();

    /** Direction the opening gesture travels; defaults to the opposite of the root's dismiss direction. */
    readonly swipeDirection = input<RdxDrawerSwipeDirection>();

    /** Whether the swipe area should ignore user interaction. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly isOpen = computed(() => this.dialogContext.isOpen());
    protected readonly direction = computed(
        () => this.swipeDirection() ?? oppositeDirection[this.drawerContext.swipeDirection()]
    );
    protected readonly resolvedTouchAction = computed(() => touchAction(this.direction()));
    protected readonly swiping = signal(false);

    private startX = 0;
    private startY = 0;
    private distance = 0;

    constructor() {
        usePointerDrag({
            canStart: () => !this.disabled() && !this.isOpen(),
            onStart: (event) => {
                this.startX = event.clientX;
                this.startY = event.clientY;
                this.distance = 0;
                this.swiping.set(true);
                this.drawerContext.setOpeningSwipe(true, 0);
                this.dialogContext.open(undefined, undefined, undefined, 'swipe', event);
            },
            onMove: (event) => {
                if (this.disabled()) {
                    return false;
                }

                this.distance = Math.max(
                    0,
                    directionalDistance(this.direction(), event.clientX - this.startX, event.clientY - this.startY)
                );

                this.drawerContext.setOpeningSwipe(true, this.distance);
                return true;
            },
            onEnd: (event, committed) => {
                const keepOpen = committed && this.distance >= OPEN_THRESHOLD;

                this.drawerContext.setOpeningSwipe(false, keepOpen ? Number.POSITIVE_INFINITY : this.distance);

                if (!keepOpen) {
                    this.dialogContext.close('swipe', event);
                }

                this.swiping.set(false);
            }
        });
    }
}
