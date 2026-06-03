import { injectRdxDrawerRootContext } from './drawer-root';
import { buildSnapEntries, dismissUnitVector, resolveSnapTarget } from './drawer-snap';
import { RdxDrawerRelease, useDrawerSwipe } from './drawer-swipe';
import { computed, Directive, effect, ElementRef, inject, Injector } from '@angular/core';
import { elementSize } from '@radix-ng/primitives/core';
import { injectRdxDialogRootContext, RdxDialogPopup } from '@radix-ng/primitives/dialog';

/** Fraction of the drawer size a plain (no-snap) release must pass to dismiss. */
const DISMISS_FRACTION = 0.5;
/** Dismiss-axis velocity (px/ms) past which a plain release dismisses regardless of distance. */
const DISMISS_VELOCITY = 0.4;

/** Root font size (px) for resolving `rem` snap points; `16` (the CSS initial value) outside the browser. */
function rootFontSize(): number {
    if (typeof document === 'undefined') {
        return 16;
    }

    return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/**
 * A container for the drawer contents.
 *
 * Composes the dialog popup (focus trap, dismissal, scroll lock, a11y wiring) and owns the drawer
 * gesture on top of it: swipe-to-dismiss, snap-back, and movement between snap points. The gesture
 * publishes a CSS-variable / data-attribute contract (see {@link useDrawerSwipe}); the consumer
 * styles the actual transform and snap-back transition off it, keeping the primitive headless.
 */
@Directive({
    selector: '[rdxDrawerPopup]',
    exportAs: 'rdxDrawerPopup',
    hostDirectives: [
        {
            directive: RdxDialogPopup,
            outputs: [
                'escapeKeyDown',
                'pointerDownOutside',
                'focusOutside',
                'interactOutside',
                'openAutoFocus',
                'closeAutoFocus'
            ]
        }
    ],
    host: {
        '[attr.data-swipe-direction]': 'drawerContext.swipeDirection()',
        '[attr.data-expanded]': 'expanded() ? "" : undefined',
        '[attr.data-nested-drawer-open]': 'drawerContext.nestedDrawerOpen() ? "" : undefined',
        '[style.--nested-drawers]': 'drawerContext.nestedDrawerCount()',
        '[style.--drawer-frontmost-height]': 'frontmostHeightPx()'
    }
})
export class RdxDrawerPopup {
    protected readonly drawerContext = injectRdxDrawerRootContext();
    private readonly dialogContext = injectRdxDialogRootContext();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly element = this.elementRef.nativeElement;

    /** Live popup size (px); a ResizeObserver keeps it current so snap geometry never goes stale. */
    private readonly size = elementSize({ elementRef: this.elementRef, injector: inject(Injector) });

    /** Snap entries for the current size; built once and shared by the offset/expanded reads. */
    private readonly snapEntries = computed(() =>
        buildSnapEntries(this.drawerContext.snapPoints(), this.axisSize(), rootFontSize())
    );

    /** Resting translate magnitude (px) of the active snap point; `0` when fully open / no snaps. */
    readonly restingOffset = computed(() => {
        const active = this.drawerContext.activeSnapPoint();

        if (active === null || !this.drawerContext.hasSnapPoints()) {
            return 0;
        }

        return this.snapEntries().find((candidate) => candidate.value === active)?.offset ?? 0;
    });

    /** Whether the active snap point is the most open one. */
    protected readonly expanded = computed(() => {
        const active = this.drawerContext.activeSnapPoint();

        if (active === null || !this.drawerContext.hasSnapPoints()) {
            return false;
        }

        const entries = this.snapEntries();

        return entries.length > 0 && entries[0].value === active;
    });

    /** The frontmost nested drawer's height for `--drawer-frontmost-height`, or unset when none. */
    protected readonly frontmostHeightPx = computed(() => {
        const height = this.drawerContext.frontmostHeight();
        return this.drawerContext.nestedDrawerOpen() && height > 0 ? `${height}px` : null;
    });

    constructor() {
        useDrawerSwipe({
            element: () => this.element,
            boundary: () => this.swipeBoundary(),
            size: () => this.visibleAxisSize(),
            direction: this.drawerContext.swipeDirection,
            enabled: computed(() => this.dialogContext.isOpen() && !this.drawerContext.openingSwipeActive()),
            restingOffset: this.restingOffset,
            resolveRelease: (projected, velocity, canDismiss) => this.resolveRelease(projected, velocity, canDismiss),
            onDismiss: (event) => this.dialogContext.close('swipe', event),
            onProgress: (strength) => this.drawerContext.setSwipeProgress(strength)
        });

        // Publish informational snap variables and report the measured size to the provider.
        effect(() => {
            const offset = this.restingOffset();
            const size = this.axisSize();

            if (!this.dialogContext.isOpen()) {
                return;
            }

            this.element.style.setProperty('--drawer-height', `${size}px`);
            this.element.style.setProperty('--drawer-snap-point-offset', `${offset}px`);
            this.drawerContext.reportPopupHeight(size);
        });

        effect(() => {
            const active = this.drawerContext.openingSwipeActive();
            const distance = this.drawerContext.openingSwipeDistance();

            if (!active) {
                if (distance === Number.POSITIVE_INFINITY) {
                    this.element.style.setProperty('--drawer-swipe-movement-x', '0px');
                    this.element.style.setProperty('--drawer-swipe-movement-y', '0px');
                    this.element.style.setProperty('--drawer-swipe-strength', '0');
                    this.drawerContext.setSwipeProgress(0);
                }

                this.element.removeAttribute('data-swiping');
                return;
            }

            const size = this.axisSize() || this.axisElementSize();
            const movement = Math.max(0, size - distance);
            const strength = size > 0 ? movement / size : 1;
            const unit = dismissUnitVector(this.drawerContext.swipeDirection());

            this.element.setAttribute('data-swiping', '');
            this.element.style.setProperty('--drawer-swipe-movement-x', `${unit.x * movement}px`);
            this.element.style.setProperty('--drawer-swipe-movement-y', `${unit.y * movement}px`);
            this.element.style.setProperty('--drawer-swipe-strength', `${strength}`);
            this.drawerContext.setSwipeProgress(strength);
        });
    }

    private axisSize(): number {
        const direction = this.drawerContext.swipeDirection();
        const size = this.size();
        const measured = direction === 'up' || direction === 'down' ? size.height : size.width;
        return measured || this.axisElementSize();
    }

    private axisElementSize(): number {
        const direction = this.drawerContext.swipeDirection();
        return direction === 'up' || direction === 'down' ? this.element.offsetHeight : this.element.offsetWidth;
    }

    private swipeBoundary(): HTMLElement {
        return this.element.closest<HTMLElement>('[rdxDrawerViewport]') ?? this.element;
    }

    private visibleAxisSize(): number {
        const popupSize = this.axisSize();
        const boundary = this.swipeBoundary();

        if (boundary === this.element) {
            return popupSize;
        }

        const direction = this.drawerContext.swipeDirection();
        const boundarySize = direction === 'up' || direction === 'down' ? boundary.clientHeight : boundary.clientWidth;
        return boundarySize > 0 ? Math.min(popupSize, boundarySize) : popupSize;
    }

    private resolveRelease(projected: number, velocity: number, canDismiss: boolean): RdxDrawerRelease {
        const size = this.drawerContext.hasSnapPoints() ? this.axisSize() : this.visibleAxisSize();
        const dismissAllowed = canDismiss && !this.dialogContext.disablePointerDismissal();

        if (!this.drawerContext.hasSnapPoints()) {
            const strength = projected / (size || 1);

            return dismissAllowed && (strength >= DISMISS_FRACTION || velocity >= DISMISS_VELOCITY)
                ? { type: 'dismiss' }
                : { type: 'snap', offset: 0 };
        }

        const entries = this.snapEntries();
        const offsets = entries.map((entry) => entry.offset);
        const active = this.drawerContext.activeSnapPoint();
        const activeIndex = Math.max(
            0,
            entries.findIndex((entry) => entry.value === active)
        );

        const target = resolveSnapTarget({
            offsets,
            activeIndex,
            projected,
            velocity,
            size,
            sequential: this.drawerContext.sequentialSnap(),
            canDismiss: dismissAllowed
        });

        if ('dismiss' in target) {
            return { type: 'dismiss' };
        }

        const entry = entries[target.index];

        if (entry.value !== active) {
            this.drawerContext.setActiveSnapPoint(entry.value, true);
        }

        return { type: 'snap', offset: entry.offset };
    }
}
