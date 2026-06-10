import { computed, DestroyRef, Directive, effect, ElementRef, inject, Injector, input, signal } from '@angular/core';
import { createContext, elementSize, injectId } from '@radix-ng/primitives/core';
import { RdxToastManager } from './toast-provider';
import { RdxToastSwipeDirection, useToastSwipe } from './toast-swipe';
import { RdxToastObject } from './toast.types';

export interface RdxToastRootContext {
    /** The toast model this part tree renders. */
    readonly toast: () => RdxToastObject;
    /** `id` of the title element, wired to `aria-labelledby` once a title registers. */
    readonly titleId: string;
    /** `id` of the description element, wired to `aria-describedby` once a description registers. */
    readonly descriptionId: string;
    /** Register/unregister the title part so the root only points `aria-labelledby` at a real element. */
    readonly setTitlePresent: (present: boolean) => void;
    /** Register/unregister the description part so `aria-describedby` only targets a real element. */
    readonly setDescriptionPresent: (present: boolean) => void;
    /** Begin dismissing this toast. */
    readonly close: () => void;
}

export const [injectRdxToastRootContext, provideRdxToastRootContext] =
    createContext<RdxToastRootContext>('RdxToastRootContext');

const rootContext = (): RdxToastRootContext => {
    const instance = inject(RdxToastRoot);
    return {
        toast: () => instance.toast(),
        titleId: instance.titleId,
        descriptionId: instance.descriptionId,
        setTitlePresent: (present) => instance.titlePresent.set(present),
        setDescriptionPresent: (present) => instance.descriptionPresent.set(present),
        close: () => instance.close()
    };
};

/**
 * A single toast — the Angular counterpart of `<Toast.Root>`. Bind the toast model from the
 * viewport's `@for`; this directive owns the announcement `role`, the `data-state` enter/leave
 * contract, swipe-to-dismiss, and the stacking variables consumers style against.
 *
 * Stacking / styling contract written to the host (no transform is applied for you):
 * - `--toast-index` — position from the front (`0` = frontmost).
 * - `--toast-height` — this toast's measured height (px).
 * - `--toast-offset-y` — combined height (px) of the toasts stacked in front, for expanded layout.
 * - `--toast-swipe-movement-x` / `--toast-swipe-movement-y` — live swipe offset (px).
 * - `[data-front]` — present on the frontmost toast.
 * - `[data-expanded]` — present while the viewport is hovered/focused.
 * - `[data-state]` — `open` while visible, `closed` once dismissal begins.
 * - `[data-swiping]` / `[data-swipe-direction]` / `[data-swipe-dismiss]` — gesture state.
 *
 * When the leave animation (driven by `data-state="closed"`) ends, the toast leaves the queue.
 */
@Directive({
    selector: '[rdxToastRoot]',
    exportAs: 'rdxToastRoot',
    providers: [provideRdxToastRootContext(rootContext)],
    host: {
        // Own the swipe gesture's touch behavior on the element usePointerDrag binds to. Without
        // touch-action:none a touch-drag is claimed by native scrolling (pointercancel fires before
        // the gesture starts), so swipe-to-dismiss works with a mouse but not on touch devices. The
        // toast surface never scrolls, so disabling pan/zoom here is safe; user-select stops text
        // selection mid-swipe. Mirrors number-field's scrub area.
        '[style.touch-action]': '"none"',
        '[style.user-select]': '"none"',
        '[style.-webkit-user-select]': '"none"',
        '[attr.role]': 'role()',
        '[attr.aria-labelledby]': 'titlePresent() ? titleId : undefined',
        '[attr.aria-describedby]': 'descriptionPresent() ? descriptionId : undefined',
        '[attr.data-state]': 'dataState()',
        '[attr.data-type]': 'toast().type ?? undefined',
        '[attr.data-front]': 'index() === 0 ? "" : undefined',
        '[attr.data-expanded]': 'manager.expanded() ? "" : undefined',
        '[style.--toast-index]': 'index()',
        '[style.--toast-height]': 'height() + "px"',
        '[style.--toast-offset-y]': 'offsetY() + "px"',
        '(animationend)': 'onAnimationEnd()'
    }
})
export class RdxToastRoot {
    protected readonly manager = inject(RdxToastManager);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);

    /** The toast model to render — pass the item from the viewport's `@for`. */
    readonly toast = input.required<RdxToastObject>();

    /** Allowed swipe-to-dismiss directions. Accepts a single direction or a list. */
    readonly swipeDirection = input<RdxToastSwipeDirection | RdxToastSwipeDirection[]>(['down', 'right']);

    readonly titleId = injectId('rdx-toast-title-');
    readonly descriptionId = injectId('rdx-toast-description-');

    /** Whether a title / description part has registered, gating the aria-* references. */
    readonly titlePresent = signal(false);
    readonly descriptionPresent = signal(false);

    private readonly size = elementSize({ elementRef: this.elementRef, injector: this.injector });
    /** This toast's measured height (px). */
    readonly height = computed(() => this.size().height);

    /** Position from the front of the stack — `0` is the newest/frontmost toast. */
    readonly index = computed(() => this.manager.layout()[this.toast().id]?.index ?? 0);

    /** Combined height (px) of the toasts stacked in front of this one (for expanded layout). */
    readonly offsetY = computed(() => this.manager.layout()[this.toast().id]?.offsetY ?? 0);

    /** `alert` (assertive) for high-priority toasts, otherwise `status`. */
    readonly role = computed(() => (this.toast().priority === 'high' ? 'alert' : 'status'));

    /** `open` while visible, `closed` once dismissal begins — drives enter/leave animations. */
    readonly dataState = computed(() => (this.toast().transitionStatus === 'ending' ? 'closed' : 'open'));

    private readonly directions = computed<RdxToastSwipeDirection[]>(() => {
        const value = this.swipeDirection();
        return Array.isArray(value) ? value : [value];
    });

    constructor() {
        const destroyRef = inject(DestroyRef);

        // Mirror the measured height into the manager for the expanded-stack offset math.
        effect(() => {
            this.manager.setHeight(this.toast().id, this.size().height);
        });

        useToastSwipe({
            element: () => this.elementRef.nativeElement,
            directions: () => this.directions(),
            enabled: () => this.toast().transitionStatus !== 'ending',
            onDismiss: () => this.close(),
            onPress: () => this.manager.pauseAll(),
            onRelease: () => this.manager.resumeAll()
        });

        // Replay the enter animation on an upsert that bumps `updateKey`. The toast keeps the same
        // DOM node (tracked by id), so restart the running animation by clearing and re-reading it.
        let firstKey = true;
        effect(() => {
            this.toast().updateKey;
            if (firstKey) {
                firstKey = false;
                return;
            }
            const node = this.elementRef.nativeElement;
            node.style.animation = 'none';
            void node.offsetWidth; // force reflow so the animation can restart
            node.style.animation = '';
        });

        destroyRef.onDestroy(() => this.manager.setHeight(this.toast().id, 0));
    }

    close(): void {
        this.manager.close(this.toast().id);
    }

    protected onAnimationEnd(): void {
        // Remove from the queue only after the leave ("closed") animation completes.
        if (this.toast().transitionStatus === 'ending') {
            this.manager.remove(this.toast().id);
        }
    }
}
