import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    model,
    output,
    signal,
    Signal,
    untracked
} from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
import { RdxDialogRoot } from '@radix-ng/primitives/dialog';
import { RdxDrawerProvider } from './drawer-provider';
import { RdxDrawerSnapPoint } from './drawer-snap';
import { RdxDrawerSwipeDirection } from './drawer-swipe';

export interface RdxDrawerRootContext {
    /** Direction a swipe travels to dismiss the drawer. */
    swipeDirection: Signal<RdxDrawerSwipeDirection>;
    /** 0..1 progress of the active dismiss gesture; siblings (e.g. backdrop) react to it. */
    swipeProgress: Signal<number>;
    /** Reports gesture progress from the popup's swipe engine. */
    setSwipeProgress: (value: number) => void;
    /** Configured snap points (empty when the drawer has none). */
    snapPoints: Signal<readonly RdxDrawerSnapPoint[]>;
    /** Whether the drawer rests at discrete snap points. */
    hasSnapPoints: Signal<boolean>;
    /** The active snap point, or `null` when none is set / the drawer is closed. */
    activeSnapPoint: Signal<RdxDrawerSnapPoint | null>;
    /** Step at most one snap point per release instead of velocity-skipping. */
    sequentialSnap: Signal<boolean>;
    /** Sets the active snap point, optionally emitting `onSnapPointChange`. */
    setActiveSnapPoint: (value: RdxDrawerSnapPoint, emit: boolean) => void;
    /** Whether a drawer nested inside this one is open. */
    nestedDrawerOpen: Signal<boolean>;
    /** Number of drawers nested inside this one that are open. */
    nestedDrawerCount: Signal<number>;
    /** The app-wide frontmost drawer's measured size (px), via the optional provider. */
    frontmostHeight: Signal<number>;
    /** Reports the popup's measured size (px) so the provider can expose it. */
    reportPopupHeight: (height: number) => void;
}

export const [injectRdxDrawerRootContext, provideRdxDrawerRootContext] =
    createContext<RdxDrawerRootContext>('RdxDrawerRootContext');

const context = (): RdxDrawerRootContext => {
    const root = inject(RdxDrawerRoot);

    return {
        swipeDirection: root.swipeDirection,
        swipeProgress: root.swipeProgress.asReadonly(),
        setSwipeProgress: (value) => root.swipeProgress.set(value),
        snapPoints: root.normalizedSnapPoints,
        hasSnapPoints: root.hasSnapPoints,
        activeSnapPoint: root.snapPoint,
        sequentialSnap: root.snapToSequentialPoints,
        setActiveSnapPoint: (value, emit) => root.setActiveSnapPoint(value, emit),
        nestedDrawerOpen: root.nestedDrawerOpen,
        nestedDrawerCount: root.nestedDrawerCount,
        frontmostHeight: root.frontmostHeight,
        reportPopupHeight: (height) => root.popupHeight.set(height)
    };
};

/**
 * Groups all parts of the drawer.
 *
 * Composes the Dialog primitive directly (modal-by-default but user-overridable) and layers the
 * drawer-specific swipe and snap-point contract on top via {@link RdxDrawerRootContext}. Modality,
 * dismissal and detached-trigger handling are the dialog's: the `modal`, `disablePointerDismissal`
 * and `handle` inputs are proxied straight through, so a drawer is a modal dialog the user can make
 * non-modal.
 */
@Directive({
    selector: '[rdxDrawerRoot]',
    exportAs: 'rdxDrawerRoot',
    hostDirectives: [
        {
            directive: RdxDialogRoot,
            inputs: [
                'open',
                'defaultOpen',
                'triggerId',
                'defaultTriggerId',
                'handle',
                'modal',
                'disablePointerDismissal'
            ],
            outputs: ['openChange', 'triggerIdChange', 'onOpenChange', 'onOpenChangeComplete']
        }
    ],
    providers: [provideRdxDrawerRootContext(context)]
})
export class RdxDrawerRoot {
    private readonly dialog = inject(RdxDialogRoot);
    private readonly provider = inject(RdxDrawerProvider, { optional: true });

    /** The popup's measured size (px) along its dismiss axis, reported by the popup. */
    readonly popupHeight = signal(0);

    /**
     * Direction a swipe travels to dismiss the drawer. The visual side of the drawer is consumer
     * CSS; this controls the dismiss gesture and the `data-swipe-direction` styling hook.
     */
    readonly swipeDirection = input<RdxDrawerSwipeDirection>('down');

    /**
     * Resting positions the drawer snaps to along the dismiss axis. Order ascending by openness; the
     * last entry is the default the drawer opens to. Omit for a plain open/closed drawer.
     */
    readonly snapPoints = input<readonly RdxDrawerSnapPoint[]>();

    /** The active snap point (controlled / uncontrolled with `[(snapPoint)]`). */
    readonly snapPoint = model<RdxDrawerSnapPoint | null>(null);

    /** The snap point the drawer opens to when uncontrolled; defaults to the most open point. */
    readonly defaultSnapPoint = input<RdxDrawerSnapPoint>();

    /** Step at most one snap point per release instead of letting velocity skip points. */
    readonly snapToSequentialPoints = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Emits when the active snap point changes through a gesture. */
    readonly onSnapPointChange = output<RdxDrawerSnapPoint>();

    /** 0..1 progress of the active dismiss gesture, written by the popup's swipe engine. */
    readonly swipeProgress = signal(0);

    readonly normalizedSnapPoints = computed<readonly RdxDrawerSnapPoint[]>(() => this.snapPoints() ?? []);
    readonly hasSnapPoints = computed(() => this.normalizedSnapPoints().length > 0);

    /** Whether a drawer nested inside this one is open (reuses the dialog's nesting detection). */
    readonly nestedDrawerOpen = this.dialog.nestedDialogOpen;
    /** Number of open drawers nested inside this one. */
    readonly nestedDrawerCount = this.dialog.nestedOpenCount.asReadonly();
    /** The app-wide frontmost drawer's measured size (px); `0` without a provider. */
    readonly frontmostHeight = computed(() => this.provider?.frontmostHeight() ?? 0);

    /** Whether the drawer is open (read-only mirror of the composed dialog state). */
    readonly open = this.dialog.open;
    /** The active trigger's id. */
    readonly triggerId = this.dialog.triggerId;
    /** Payload of the active trigger. */
    readonly payload = this.dialog.payload;

    constructor() {
        // Apply the default snap point when opening without one set. The active snap point is left
        // untouched on close: clearing it would clobber a controlled `[(snapPoint)]` binding, and an
        // uncontrolled drawer simply reopens where it was left.
        effect(() => {
            const open = this.dialog.open();

            untracked(() => {
                const points = this.normalizedSnapPoints();

                if (open && this.snapPoint() === null && points.length > 0) {
                    this.snapPoint.set(this.defaultSnapPoint() ?? points[points.length - 1]);
                }
            });
        });

        // Reset live swipe progress when closed so a reopened drawer never starts mid-gesture.
        effect(() => {
            if (!this.dialog.open()) {
                untracked(() => this.swipeProgress.set(0));
            }
        });

        // Register with the optional app-level provider while open so background content can react.
        effect((onCleanup) => {
            if (this.dialog.open() && this.provider) {
                onCleanup(
                    untracked(() =>
                        this.provider!.register({ id: this.dialog.contentId, height: this.popupHeight.asReadonly() })
                    )
                );
            }
        });
    }

    setActiveSnapPoint(value: RdxDrawerSnapPoint, emit: boolean) {
        this.snapPoint.set(value);

        if (emit) {
            this.onSnapPointChange.emit(value);
        }
    }
}
