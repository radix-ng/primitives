import { computed, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';
import {
    ARROW_DOWN,
    ARROW_LEFT,
    ARROW_RIGHT,
    ARROW_UP,
    END,
    HOME,
    RDX_FLOATING_REGISTRATION,
    RDX_FLOATING_ROOT_CONTEXT,
    TAB
} from '@radix-ng/primitives/core';
import { RdxDismiss, RdxOutsidePressDomEvent } from '@radix-ng/primitives/dismissable-layer';
import { RdxPopperContent, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectNavigationMenuRootContext, RdxNavigationMenuOpenChangeReason } from './navigation-menu-root-context';
import { focusFirst, getTabbableCandidates } from './utils';

/**
 * The shared container for the active item's content.
 */
@Directive({
    selector: '[rdxNavigationMenuPopup]',
    hostDirectives: [RdxPopperContent],
    host: {
        tabindex: '-1',
        '[id]': 'id()',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-instant]': 'rootContext.instant() ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-side]': 'side()',
        '[attr.data-align]': 'align()',
        '[style.--popup-width.px]': 'rootContext.size()?.width',
        '[style.--popup-height.px]': 'rootContext.size()?.height',
        '(pointerenter)': 'rootContext.cancelHoverClose()',
        '(pointerleave)': 'onPointerLeave($event)',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxNavigationMenuPopup {
    protected readonly rootContext = injectNavigationMenuRootContext();
    private readonly floatingContext = inject(RDX_FLOATING_ROOT_CONTEXT);
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly side = computed(() => this.wrapper?.placedSide());
    protected readonly align = computed(() => this.wrapper?.placedAlign());

    protected readonly id = computed(() => {
        const value = this.rootContext.value() ?? this.rootContext.previousValue();
        return value ? `${this.rootContext.baseId}-popup-${value}` : `${this.rootContext.baseId}-popup`;
    });

    /**
     * Event handler called when the escape key is down. Can be prevented.
     */
    readonly escapeKeyDown = output<KeyboardEvent>();

    /**
     * Event handler called when a pointerdown event happens outside the popup. Can be prevented.
     */
    readonly pointerDownOutside = output<RdxOutsidePressDomEvent>();

    /**
     * Event handler called when focus moves outside the popup. Can be prevented.
     */
    readonly focusOutside = output<FocusEvent>();

    constructor() {
        const destroyRef = inject(DestroyRef);
        const unregisterTransitionElement = this.rootContext.registerTransitionElement(this.elementRef.nativeElement);
        const unregisterPopup = this.rootContext.registerPopup(this.elementRef.nativeElement);

        destroyRef.onDestroy(unregisterTransitionElement);
        destroyRef.onDestroy(unregisterPopup);

        // The popup is this layer's floating element (the inside surface for containment checks). The
        // triggers are registered as "inside" on the shared root context (in `registerTrigger`), so a
        // press / focus on a sibling trigger to switch items — or back on the active trigger — never
        // counts as an outside dismissal. This replaces the legacy dismissable-layer `branches` registry.
        this.floatingContext.setFloatingElement(this.elementRef.nativeElement);

        // Dismissal (ADR 0015): Escape, an outside press, or focus moving outside closes the menu.
        // Navigation Menu registers its FloatingNode on the root, matching Base UI's
        // NavigationMenuRoot → FloatingNode wiring. This lets nested roots participate in parent/child
        // ownership even though each root has one shared popup.
        // It does not trap focus, so it closes on focus-out like a non-modal menu.
        new RdxDismiss(this.floatingContext, () => this.registration?.node() ?? null, {
            escapeKey: () => true,
            outsidePress: () => true,
            outsidePressEvent: () => 'intentional',
            focusOutside: () => true,
            onEscapeKeyDown: (event) => this.escapeKeyDown.emit(event),
            onPointerDownOutside: (event) => this.pointerDownOutside.emit(event),
            onFocusOutside: (event) => this.focusOutside.emit(event),
            onDismiss: (reason, event) => {
                const navReason: RdxNavigationMenuOpenChangeReason =
                    reason === 'escape-key' ? 'escape-key' : reason === 'focus-outside' ? 'focus-out' : 'outside-press';
                this.rootContext.close(navReason, event);

                // Return focus to the trigger after an Escape dismissal.
                if (reason === 'escape-key') {
                    this.rootContext.trigger()?.focus();
                }
            }
        });
    }

    protected onPointerLeave(event: PointerEvent) {
        if (event.pointerType === 'touch') {
            return;
        }

        this.rootContext.closeOnHover(event);
    }

    /**
     * Keyboard navigation inside the open panel mirrors Base UI's CompositeRoot-backed content:
     * arrow keys move between panel focusables in DOM order, Home/End jump to the first/last, Up from
     * the first item returns focus to the trigger, and Tab exits the portalled panel through the
     * logical top-level navigation order. Escape is handled by the dismissal capability.
     */
    protected onKeydown(event: KeyboardEvent) {
        if (
            event.key !== ARROW_DOWN &&
            event.key !== ARROW_UP &&
            event.key !== ARROW_LEFT &&
            event.key !== ARROW_RIGHT &&
            event.key !== TAB &&
            event.key !== HOME &&
            event.key !== END
        ) {
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

        const currentIndex = candidates.indexOf(document.activeElement as HTMLElement);

        if (event.key === TAB) {
            this.handleTabKey(event, candidates, currentIndex);
            return;
        }

        event.preventDefault();

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

        if (event.key === ARROW_RIGHT || event.key === ARROW_LEFT) {
            const moveNext = this.rootContext.dir() === 'rtl' ? event.key === ARROW_LEFT : event.key === ARROW_RIGHT;
            const next = moveNext
                ? currentIndex < candidates.length - 1
                    ? currentIndex + 1
                    : 0
                : currentIndex > 0
                  ? currentIndex - 1
                  : candidates.length - 1;
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

    private handleTabKey(event: KeyboardEvent, candidates: HTMLElement[], currentIndex: number) {
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        const isFirst = currentIndex <= 0;
        const isLast = currentIndex === candidates.length - 1;

        if (event.shiftKey) {
            if (!isFirst) {
                return;
            }

            event.preventDefault();
            this.rootContext.trigger()?.focus();
            return;
        }

        if (!isLast) {
            return;
        }

        const nextItem = this.getNextTopLevelItem();

        if (!nextItem) {
            return;
        }

        event.preventDefault();
        nextItem.focus();
    }

    private getNextTopLevelItem(): HTMLElement | undefined {
        const activeTrigger = this.rootContext.trigger();

        if (!activeTrigger) {
            return undefined;
        }

        const items = this.getTopLevelItems();
        const currentIndex = items.indexOf(activeTrigger);

        return currentIndex === -1 ? undefined : items[currentIndex + 1];
    }

    private getTopLevelItems(): HTMLElement[] {
        const list = this.rootContext.list();

        if (!list) {
            return this.rootContext.triggers();
        }

        return Array.from(list.querySelectorAll<HTMLElement>('[rdxNavigationMenuTrigger], [rdxNavigationMenuLink]'))
            .filter((item) => !item.hasAttribute('disabled'))
            .filter((item) => item.getAttribute('aria-hidden') !== 'true');
    }
}
