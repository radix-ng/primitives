import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, signal } from '@angular/core';
import { injectRdxDialogRootContext } from '@radix-ng/primitives/dialog';
import { usePointerDrag } from './drawer-pointer';
import { injectRdxDrawerRootContext } from './drawer-root';
import { RdxDrawerSwipeDirection } from './drawer-swipe';

/** Pointer travel (px) inward past which the swipe area opens the drawer. */
const OPEN_THRESHOLD = 30;

/** Inward pointer travel (toward the open drawer) for a given direction and pointer delta. */
function inwardDistance(direction: RdxDrawerSwipeDirection, dx: number, dy: number) {
    switch (direction) {
        case 'down':
            return -dy;
        case 'up':
            return dy;
        case 'left':
            return dx;
        case 'right':
            return -dx;
    }
}

/**
 * An off-canvas region (typically pinned to a screen edge) that opens the drawer when swiped inward.
 *
 * Phase 1 opens on a threshold crossing rather than following the pointer live (the popup is not
 * mounted while closed); the live-follow open will land with snap points. Shares the drawer's
 * pointer-drag lifecycle so capture/cancel handling stays consistent with the popup gesture.
 */
@Directive({
    selector: '[rdxDrawerSwipeArea]',
    exportAs: 'rdxDrawerSwipeArea',
    host: {
        '[attr.data-open]': 'isOpen() ? "" : undefined',
        '[attr.data-closed]': 'isOpen() ? undefined : ""',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-swiping]': 'swiping() ? "" : undefined',
        '[attr.data-swipe-direction]': 'direction()'
    }
})
export class RdxDrawerSwipeArea {
    private readonly drawerContext = injectRdxDrawerRootContext()!;
    private readonly dialogContext = injectRdxDialogRootContext()!;

    /** Direction the swipe area opens from; defaults to the root's `swipeDirection`. */
    readonly swipeDirection = input<RdxDrawerSwipeDirection>();

    /** Whether the swipe area should ignore user interaction. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly isOpen = computed(() => this.dialogContext.isOpen());
    protected readonly direction = computed(() => this.swipeDirection() ?? this.drawerContext.swipeDirection());
    protected readonly swiping = signal(false);

    private startX = 0;
    private startY = 0;

    constructor() {
        usePointerDrag({
            canStart: () => !this.disabled() && !this.isOpen(),
            onStart: (event) => {
                this.startX = event.clientX;
                this.startY = event.clientY;
                this.swiping.set(true);
            },
            onMove: (event) => {
                if (this.disabled()) {
                    return false;
                }

                const distance = inwardDistance(
                    this.direction(),
                    event.clientX - this.startX,
                    event.clientY - this.startY
                );

                if (distance >= OPEN_THRESHOLD) {
                    this.dialogContext.open(undefined, undefined, undefined, 'swipe', event);
                    return false;
                }

                return true;
            },
            onEnd: () => this.swiping.set(false)
        });
    }
}
