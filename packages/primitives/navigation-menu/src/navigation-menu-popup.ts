import { computed, DestroyRef, Directive, effect, ElementRef, inject, untracked } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { ARROW_DOWN, ARROW_UP, END, HOME } from '@radix-ng/primitives/core';
import { RdxDismissableLayer, RdxDismissableLayersContextToken } from '@radix-ng/primitives/dismissable-layer';
import { RdxPopperContent, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectNavigationMenuRootContext, RdxNavigationMenuOpenChangeReason } from './navigation-menu-root-context';
import { focusFirst, getTabbableCandidates } from './utils';

/**
 * The shared container for the active item's content.
 */
@Directive({
    selector: '[rdxNavigationMenuPopup]',
    hostDirectives: [RdxPopperContent, RdxDismissableLayer],
    host: {
        role: 'menu',
        tabindex: '-1',
        '[attr.aria-labelledby]': 'labelledBy()',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()',
        '(pointerenter)': 'rootContext.cancelHoverClose()',
        '(pointerleave)': 'onPointerLeave($event)',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxNavigationMenuPopup {
    protected readonly rootContext = injectNavigationMenuRootContext()!;
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });
    private readonly layersContext = inject(RdxDismissableLayersContextToken);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());

    /** Names the menu after the active trigger so the `role="menu"` element has an accessible name. */
    protected readonly labelledBy = computed(() => {
        const value = this.rootContext.value() ?? this.rootContext.previousValue();
        return value ? this.rootContext.triggerId(value) : undefined;
    });

    private dismissReason: RdxNavigationMenuOpenChangeReason = 'none';
    private dismissEvent: Event = new Event('navigation-menu.dismiss');

    /**
     * Event handler called when the escape key is down. Can be prevented.
     */
    readonly escapeKeyDown = outputFromObservable(outputToObservable(this.dismissableLayer.escapeKeyDown));

    /**
     * Event handler called when a pointerdown event happens outside the popup. Can be prevented.
     */
    readonly pointerDownOutside = outputFromObservable(outputToObservable(this.dismissableLayer.pointerDownOutside));

    /**
     * Event handler called when focus moves outside the popup. Can be prevented.
     */
    readonly focusOutside = outputFromObservable(outputToObservable(this.dismissableLayer.focusOutside));

    constructor() {
        const destroyRef = inject(DestroyRef);
        const unregisterTransitionElement = this.rootContext.registerTransitionElement(this.elementRef.nativeElement);

        destroyRef.onDestroy(unregisterTransitionElement);

        // Register the triggers as dismissable-layer branches so a pointer-down or (async) focus move
        // onto a trigger counts as "inside" — otherwise focusing a sibling trigger to switch items,
        // or returning focus to the trigger, would dismiss the menu. See dismissable-layer gotcha.
        effect(() => {
            const triggers = this.rootContext.triggers();

            untracked(() =>
                this.layersContext.branches.update((branches) => {
                    const next = new Set(branches);
                    triggers.forEach((trigger) => next.add(trigger));
                    return [...next];
                })
            );
        });

        destroyRef.onDestroy(() => {
            const triggers = this.rootContext.triggers();
            this.layersContext.branches.update((branches) => branches.filter((el) => !triggers.includes(el)));
        });

        this.dismissableLayer.escapeKeyDown.subscribe((event) => {
            this.dismissReason = 'escape-key';
            this.dismissEvent = event;
        });

        this.dismissableLayer.pointerDownOutside.subscribe((event) => {
            this.dismissReason = 'outside-press';
            this.dismissEvent = event;
        });

        this.dismissableLayer.focusOutside.subscribe((event) => {
            this.dismissReason = 'focus-out';
            this.dismissEvent = event;
        });

        this.dismissableLayer.dismiss.subscribe(() => {
            const reason = this.dismissReason;
            const event = this.dismissEvent;
            this.dismissReason = 'none';
            this.dismissEvent = new Event('navigation-menu.dismiss');

            this.rootContext.close(reason, event);

            // Return focus to the trigger after an Escape dismissal.
            if (reason === 'escape-key') {
                this.rootContext.trigger()?.focus();
            }
        });
    }

    protected onPointerLeave(event: PointerEvent) {
        if (event.pointerType === 'touch') {
            return;
        }

        this.rootContext.closeOnHover();
    }

    /**
     * Keyboard navigation inside the open panel: Down/Up move between the panel's focusable items in
     * DOM order, Home/End jump to the first/last, and Up from the first item returns focus to the
     * trigger. (Tab keeps working natively; Escape is handled by the dismissable layer.)
     */
    protected onKeydown(event: KeyboardEvent) {
        if (event.key !== ARROW_DOWN && event.key !== ARROW_UP && event.key !== HOME && event.key !== END) {
            return;
        }

        // If the key originates from a nested navigation menu rendered inside this popup, let that
        // menu's own roving group / popup handle it — otherwise both react and focus jumps/skips.
        const nestedRoot = (event.target as HTMLElement).closest('[rdxNavigationMenuRoot]');

        if (nestedRoot && this.elementRef.nativeElement.contains(nestedRoot)) {
            return;
        }

        const candidates = getTabbableCandidates(this.elementRef.nativeElement);

        if (candidates.length === 0) {
            return;
        }

        event.preventDefault();

        const currentIndex = candidates.indexOf(document.activeElement as HTMLElement);

        if (event.key === HOME) {
            focusFirst([candidates[0]]);
            return;
        }

        if (event.key === END) {
            focusFirst([candidates[candidates.length - 1]]);
            return;
        }

        if (event.key === ARROW_DOWN) {
            const next = currentIndex < candidates.length - 1 ? currentIndex + 1 : 0;
            focusFirst([candidates[next]]);
            return;
        }

        // ArrowUp: from the first item, return focus to the trigger; otherwise move to the previous.
        if (currentIndex <= 0) {
            this.rootContext.trigger()?.focus();
        } else {
            focusFirst([candidates[currentIndex - 1]]);
        }
    }
}
