import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    signal,
    untracked
} from '@angular/core';
import { createContext, elementSize, getActiveElement, injectId, waitForAnimations } from '@radix-ng/primitives/core';
import { composedContains } from '@radix-ng/primitives/focus-scope';
import { RdxToastManager } from './toast-provider';
import { RdxToastSwipeDirection, useToastSwipe } from './toast-swipe';
import { RdxToastViewport } from './toast-viewport';
import { RdxToastObject } from './toast.types';

export interface RdxToastRootContext {
    /** The toast model this part tree renders. */
    readonly toast: () => RdxToastObject;
    readonly expanded: () => boolean;
    readonly behind: () => boolean;
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

export const [injectRdxToastRootContext, provideRdxToastRootContext] = createContext<RdxToastRootContext>(
    'RdxToastRootContext',
    'components/toast'
);

const rootContext = (): RdxToastRootContext => {
    const instance = inject(RdxToastRoot);
    return {
        toast: () => instance.toast(),
        expanded: instance.expanded,
        behind: instance.behind,
        titleId: instance.titleId,
        descriptionId: instance.descriptionId,
        setTitlePresent: (present) => instance.titlePresent.set(present),
        setDescriptionPresent: (present) => instance.descriptionPresent.set(present),
        close: () => instance.close()
    };
};

/**
 * A single toast. Bind the toast model from the viewport's `@for` to expose its stacking, motion,
 * swipe and accessibility state on the host.
 *
 * Stacking / styling contract written to the host (no transform is applied for you):
 * - `--toast-index` — position from the front (`0` = frontmost).
 * - `--toast-height` — this toast's measured height (px).
 * - `--toast-offset-y` — combined height (px) of the toasts stacked in front, for expanded layout.
 * - `--toast-swipe-movement-x` / `--toast-swipe-movement-y` — live swipe offset (px).
 * - `[data-expanded]` — present while the viewport is hovered/focused.
 * - `[data-limited]` — present while the toast is beyond the visible limit.
 * - `[data-starting-style]` / `[data-ending-style]` — enter and exit styling hooks.
 * - `[data-swiping]` / `[data-swipe-direction]` / `[data-swipe-dismiss]` — gesture state.
 *
 * The toast leaves the queue after finite CSS animations and transitions on the Root finish.
 * Without motion, it is removed after the closed state has rendered.
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
        '[style.touch-action]': 'swipeEnabled() ? "none" : undefined',
        '[style.user-select]': 'swipeEnabled() ? "none" : undefined',
        '[style.-webkit-user-select]': 'swipeEnabled() ? "none" : undefined',
        '[attr.role]': 'role()',
        tabindex: '0',
        'aria-modal': 'false',
        '[attr.aria-hidden]': 'hideFromLiveRegion() ? "true" : undefined',
        '[attr.aria-labelledby]': 'titlePresent() ? titleId : undefined',
        '[attr.aria-describedby]': 'descriptionPresent() ? descriptionId : undefined',
        '[attr.data-starting-style]': 'toast().transitionStatus === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'toast().transitionStatus === "ending" ? "" : undefined',
        '[attr.data-type]': 'toast().type ?? undefined',
        '[attr.data-limited]': 'toast().limited ? "" : undefined',
        '[attr.inert]': 'toast().limited ? "" : undefined',
        '[attr.data-expanded]': 'expanded() ? "" : undefined',
        '[style.--toast-index]': 'index()',
        '[style.--toast-height.px]': 'height()',
        '[style.--toast-offset-y.px]': 'offsetY()',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class RdxToastRoot {
    protected readonly manager = inject(RdxToastManager);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly viewport = inject(RdxToastViewport, { optional: true });

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
    readonly height = computed(() => this.size().height ?? 0);

    /** Position from the front of the stack — `0` is the newest/frontmost toast. */
    readonly index = computed(() => this.manager.layout()[this.toast().id]?.index ?? 0);

    /** Combined height (px) of the toasts stacked in front of this one (for expanded layout). */
    readonly offsetY = computed(() => this.manager.layout()[this.toast().id]?.offsetY ?? 0);

    readonly expanded = this.manager.expanded;
    readonly behind = computed(() => this.toast().transitionStatus !== 'ending' && this.index() > 0);
    readonly role = computed(() => (this.toast().priority === 'high' ? 'alertdialog' : 'dialog'));
    protected readonly hideFromLiveRegion = computed(
        () => this.toast().priority === 'high' && this.viewport?.keyboardFocused() === false
    );

    private readonly directions = computed<RdxToastSwipeDirection[]>(() => {
        const value = this.swipeDirection();
        return Array.isArray(value) ? value : [value];
    });

    protected readonly swipeEnabled = computed(
        () => this.toast().positionerProps?.anchor === undefined && this.directions().length > 0
    );

    constructor() {
        const destroyRef = inject(DestroyRef);

        // Mirror the measured height into the manager for the expanded-stack offset math.
        const id = computed(() => this.toast().id);
        effect(() => this.manager.setHeight(id(), this.height()));
        effect((onCleanup) => {
            const unregister = this.viewport?.registerRoot(id(), this.elementRef.nativeElement);
            if (unregister) onCleanup(unregister);
        });

        useToastSwipe({
            element: () => this.elementRef.nativeElement,
            directions: () => this.directions(),
            enabled: () => this.swipeEnabled() && !this.toast().limited && this.toast().transitionStatus !== 'ending',
            onDismiss: () => this.close(),
            onPress: () => this.manager.pauseAll(),
            onRelease: () => this.manager.resumeAll()
        });

        effect((onCleanup) => {
            const model = this.toast();
            if (!model.transitionStatus) return;

            const owner = untracked(() => this.manager.toasts().find((toast) => toast.id === model.id));
            if (!owner || owner.transitionStatus !== model.transitionStatus) return;

            const controller = new AbortController();
            const node = this.elementRef.nativeElement;
            const win = node.ownerDocument.defaultView;
            let frame: number | undefined;
            const render = afterNextRender(
                {
                    read: () => {
                        if (model.transitionStatus === 'starting') {
                            node.removeAttribute('data-swipe-direction');
                            node.removeAttribute('data-swipe-dismiss');
                            node.style.removeProperty('--toast-swipe-movement-x');
                            node.style.removeProperty('--toast-swipe-movement-y');
                            // Commit the starting style before removing it for CSS transitions.
                            void node.offsetHeight;
                            frame = win?.requestAnimationFrame(() => this.manager.completeTransition(owner));
                        } else {
                            waitForAnimations([node], () => this.manager.completeTransition(owner), controller.signal);
                        }
                    }
                },
                { injector: this.injector }
            );
            onCleanup(() => {
                render.destroy();
                controller.abort();
                if (frame !== undefined) win?.cancelAnimationFrame(frame);
            });
        });

        // Replay the enter animation on an upsert that bumps `updateKey`. The toast keeps the same
        // DOM node (tracked by id), so restart the running animation by clearing and re-reading it.
        const updateKey = computed(() => this.toast().updateKey);
        let firstKey = true;
        effect(() => {
            updateKey();
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

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key !== 'Escape' || event.defaultPrevented || this.toast().transitionStatus === 'ending') return;
        const host = this.elementRef.nativeElement;
        if (composedContains(host, getActiveElement(host.ownerDocument))) {
            event.preventDefault();
            this.close();
        }
    }
}
