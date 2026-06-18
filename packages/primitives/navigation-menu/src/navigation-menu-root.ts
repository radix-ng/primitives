import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    numberAttribute,
    output,
    signal,
    untracked
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createFloatingRootContext,
    NumberInput,
    provideFloatingRootContext,
    provideFloatingTree,
    RDX_FLOATING_REGISTRATION,
    RdxFloatingNodeRegistration,
    RdxFloatingRootContext,
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { RdxPopper } from '@radix-ng/primitives/popper';
import {
    NavigationMenuDirection,
    NavigationMenuOrientation,
    provideNavigationMenuRootContext,
    RdxNavigationMenuContentEntry,
    RdxNavigationMenuOpenChange,
    RdxNavigationMenuOpenChangeEventDetails,
    RdxNavigationMenuOpenChangeReason,
    RdxNavigationMenuRootContext
} from './navigation-menu-root-context';
import { generateId } from './utils';

const context = () => contextFor(inject(RdxNavigationMenuRoot));

/**
 * Groups all parts of the navigation menu.
 *
 * Holds the shared open state: `value` identifies the currently open item, and the menu is open
 * whenever `value` is non-null. A single popup (Portal → Positioner → Popup → Viewport) is shared
 * between every item and anchored to the active trigger.
 */
@Directive({
    selector: '[rdxNavigationMenuRoot]',
    exportAs: 'rdxNavigationMenuRoot',
    providers: [
        provideNavigationMenuRootContext(context),
        // Base UI wraps every NavigationMenu.Root in a FloatingNode and only creates FloatingTree at the
        // top boundary. `provideFloatingTree()` is inherit-or-create, so nested navigation menus join the
        // parent's tree while the top-level menu starts the coordination store.
        provideFloatingTree(),
        // New floating foundation (ADR 0015/0017) — dismissal reads this shared root context, while the
        // root-level node above gives nested navigation menus real parent/child ownership.
        provideFloatingRootContext(() => inject(RdxNavigationMenuRoot).floatingContext)
    ],
    hostDirectives: [RdxPopper, RdxFloatingNodeRegistration],
    host: {
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-nested]': 'nested ? "" : undefined',
        '[attr.dir]': 'dir()'
    }
})
export class RdxNavigationMenuRoot {
    private readonly popper = inject(RdxPopper);
    private readonly destroyRef = inject(DestroyRef);
    private readonly parentRoot = inject(RdxNavigationMenuRoot, { optional: true, skipSelf: true });
    private readonly registration = inject(RDX_FLOATING_REGISTRATION, { optional: true });

    /** Per-popup floating root context (ADR 0015) — `open` / `triggers` / reference for the dismissal engine. */
    readonly floatingContext: RdxFloatingRootContext = createFloatingRootContext({
        ownerDocument: inject(ElementRef).nativeElement.ownerDocument,
        open: () => this.isOpen()
    });

    /** Whether this root is nested inside another navigation menu's content. */
    readonly nested = !!this.parentRoot;
    readonly baseId = `rdx-nav-menu-${generateId()}`;

    /**
     * The value of the navigation menu item that should be currently open.
     */
    readonly value = model<string | null>(null);

    /**
     * The uncontrolled value of the item that should be initially open.
     */
    readonly defaultValue = input<string | null>(null);

    /**
     * The orientation of the navigation menu.
     */
    readonly orientation = input<NavigationMenuOrientation>('horizontal');

    /**
     * The reading direction of the navigation menu.
     */
    readonly dirInput = input<NavigationMenuDirection | undefined>(undefined, { alias: 'dir' });
    readonly dir = injectDirection(this.dirInput);

    /**
     * Whether keyboard navigation loops from the last item back to the first and vice versa.
     */
    readonly loop = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * How long to wait before opening the menu on hover, in milliseconds.
     */
    readonly delay = input<number, NumberInput>(50, { transform: numberAttribute });

    /**
     * How long to wait before closing the menu after the pointer leaves, in milliseconds.
     */
    readonly closeDelay = input<number, NumberInput>(50, { transform: numberAttribute });

    /**
     * Emits when the open item changes.
     */
    readonly onValueChange = output<string | null>();

    /**
     * Emits whenever the menu opens or closes.
     */
    readonly onOpenChange = output<RdxNavigationMenuOpenChange>();

    /**
     * Emits after any enter/exit transition completes.
     */
    readonly onOpenChangeComplete = output<boolean>();

    private hasAppliedDefaultValue = false;
    private openTimer: ReturnType<typeof setTimeout> | undefined;
    private closeTimer: ReturnType<typeof setTimeout> | undefined;
    private instantFrame: number | undefined;

    private readonly transition = useTransitionStatus((open) => {
        this.instant.set(false);
        this.onOpenChangeComplete.emit(open);
    });

    readonly instant = signal(false);
    readonly transitionStatus = this.transition.status;
    readonly previousValue = signal<string | null>(null);
    readonly isOpen = computed(() => this.value() !== null);
    private readonly preventUnmountOnClose = signal(false);
    readonly present = computed(() => this.isOpen() || this.preventUnmountOnClose());
    readonly trigger = signal<HTMLElement | undefined>(undefined);
    readonly triggers = signal<HTMLElement[]>([]);
    readonly list = signal<HTMLElement | undefined>(undefined);
    readonly contents = signal<Map<string, RdxNavigationMenuContentEntry>>(new Map());
    readonly popup = signal<HTMLElement | undefined>(undefined);
    readonly size = signal<{ width: number; height: number } | null>(null);

    readonly activeContent = computed(() => {
        const value = this.value() ?? this.previousValue();
        return value ? this.contents().get(value) : undefined;
    });

    private readonly registeredTriggers = new Map<string, HTMLElement>();
    private readonly viewportTriggerChange = new Set<(previous: HTMLElement, next: HTMLElement) => void>();

    constructor() {
        let previousOpen = this.isOpen();

        effect(() => {
            const defaultValue = this.defaultValue();

            if (!this.hasAppliedDefaultValue && defaultValue !== null) {
                this.hasAppliedDefaultValue = true;
                this.value.set(defaultValue);
            }
        });

        effect(() => {
            const open = this.isOpen();

            if (open !== previousOpen) {
                previousOpen = open;
                untracked(() => this.transition.start(open));
            }
        });

        // Anchor the shared popper to the active trigger.
        effect(() => this.popper.anchorOverride.set(this.trigger()));

        // Keep the dismissal reference in sync with the active trigger (the anchor) so a press / focus on
        // it counts as "inside" (ADR 0015). The full trigger registry is maintained in `registerTrigger`.
        effect(() => this.floatingContext.setReferenceElement(this.trigger() ?? null));

        this.destroyRef.onDestroy(() => {
            this.clearHoverTimers();

            if (this.instantFrame !== undefined) {
                cancelAnimationFrame(this.instantFrame);
            }
        });
    }

    contentId(value: string) {
        return `${this.baseId}-content-${value}`;
    }

    triggerId(value: string) {
        return `${this.baseId}-trigger-${value}`;
    }

    setValue(
        value: string | null,
        reason: RdxNavigationMenuOpenChangeReason = 'none',
        event = new Event('navigation-menu.value-change')
    ) {
        const previous = this.value();

        if (previous === value) {
            return;
        }

        const previousTrigger = this.trigger();
        const nextTrigger = value ? this.registeredTriggers.get(value) : undefined;
        const changedTriggerWhileOpen = previous !== null && value !== null && previousTrigger !== nextTrigger;

        const change = this.createOpenChangeEvent(value, reason, event, nextTrigger ?? previousTrigger);
        this.onOpenChange.emit(change.payload);

        if (change.eventDetails.isCanceled()) {
            return;
        }

        this.instant.set(changedTriggerWhileOpen || reason === 'trigger-focus');

        if (changedTriggerWhileOpen) {
            this.scheduleInstantReset();

            if (previousTrigger && nextTrigger) {
                this.viewportTriggerChange.forEach((notify) => notify(previousTrigger, nextTrigger));
            }
        }

        if (nextTrigger) {
            this.trigger.set(nextTrigger);
        }

        this.previousValue.set(previous);
        this.preventUnmountOnClose.set(value === null ? change.shouldPreventUnmountOnClose() : false);
        this.value.set(value);
        this.onValueChange.emit(value);

        if (this.nested && value === null && reason === 'link-select') {
            this.parentRoot?.close(reason, event);
        }
    }

    open(value: string, trigger: HTMLElement, reason: RdxNavigationMenuOpenChangeReason = 'none', event?: Event) {
        this.clearHoverTimers();
        // Register the anchor in case this value hasn't been seen yet, but DON'T set `this.trigger`
        // here: setValue must still read the *previous* trigger to detect a trigger switch and drive
        // the viewport morph. It sets `this.trigger` from the registry after that comparison.
        if (!this.registeredTriggers.has(value)) {
            this.registeredTriggers.set(value, trigger);
        }

        this.setValue(value, reason, event);
    }

    close(reason: RdxNavigationMenuOpenChangeReason = 'none', event?: Event) {
        this.clearHoverTimers();

        if (!this.isOpen()) {
            return;
        }

        this.instant.set(reason !== 'none' && reason !== 'trigger-hover' && reason !== 'list-leave');
        this.setValue(null, reason, event);
    }

    toggle(value: string, trigger: HTMLElement, event?: Event) {
        this.clearHoverTimers();

        if (this.value() === value) {
            this.close('trigger-press', event);
            return;
        }

        this.open(value, trigger, 'trigger-press', event);
    }

    openOnHover(value: string, trigger: HTMLElement, event: PointerEvent) {
        this.clearHoverTimers();

        // Switching between already-open items happens instantly.
        if (this.isOpen()) {
            this.open(value, trigger, 'trigger-hover', event);
            return;
        }

        this.openTimer = setTimeout(() => this.open(value, trigger, 'trigger-hover', event), this.delay());
    }

    closeOnHover(event?: PointerEvent) {
        if (event && this.isInsideOpenChild(event.relatedTarget)) {
            this.cancelHoverClose();
            return;
        }

        this.clearOpenTimer();
        this.clearCloseTimer();
        this.closeTimer = setTimeout(
            () => this.close('list-leave', new Event('navigation-menu.hover-close')),
            this.closeDelay()
        );
    }

    cancelHoverOpen() {
        this.clearOpenTimer();
    }

    cancelHoverClose() {
        this.clearCloseTimer();
    }

    registerTrigger(value: string, trigger: HTMLElement) {
        this.registeredTriggers.set(value, trigger);
        this.triggers.update((triggers) => (triggers.includes(trigger) ? triggers : [...triggers, trigger]));
        // Mark every trigger as "inside" the floating layer (ADR 0015): a press / focus on a sibling
        // trigger (to switch items) or back on the active trigger must not count as an outside dismissal.
        this.floatingContext.triggers.add(trigger);

        if (this.value() === value) {
            this.trigger.set(trigger);
        }

        return () => {
            if (this.registeredTriggers.get(value) === trigger) {
                this.registeredTriggers.delete(value);
            }

            this.triggers.update((triggers) => triggers.filter((candidate) => candidate !== trigger));
            this.floatingContext.triggers.delete(trigger);

            if (this.destroyRef.destroyed || this.value() !== value) {
                return;
            }

            // Defer the close: when an item's `value` changes, the trigger's registration effect
            // unregisters the old value and synchronously re-registers the same element under the new
            // value. Closing immediately would collapse the menu mid-rename, so only close if the
            // element is truly gone (not re-registered under any value) on the next microtask.
            queueMicrotask(() => {
                if (this.destroyRef.destroyed || this.value() !== value) {
                    return;
                }

                const stillRegistered = [...this.registeredTriggers.values()].includes(trigger);

                if (!stillRegistered) {
                    this.close();
                }
            });
        };
    }

    registerList(list: HTMLElement) {
        this.list.set(list);

        return () => {
            if (this.list() === list) {
                this.list.set(undefined);
            }
        };
    }

    registerContent(entry: RdxNavigationMenuContentEntry) {
        this.contents.update((contents) => new Map(contents).set(entry.value, entry));

        return () => {
            this.contents.update((contents) => {
                if (contents.get(entry.value) !== entry) {
                    return contents;
                }

                const next = new Map(contents);
                next.delete(entry.value);
                return next;
            });
        };
    }

    registerPopup(element: HTMLElement) {
        this.popup.set(element);

        return () => {
            if (this.popup() === element) {
                this.popup.set(undefined);
            }
        };
    }

    setSize(size: { width: number; height: number } | null) {
        this.size.set(size);
    }

    registerTransitionElement(element: HTMLElement) {
        return this.transition.registerElement(element);
    }

    registerViewport(onTriggerChange: (previous: HTMLElement, next: HTMLElement) => void) {
        this.viewportTriggerChange.add(onTriggerChange);
        return () => this.viewportTriggerChange.delete(onTriggerChange);
    }

    private createOpenChangeEvent(
        value: string | null,
        reason: RdxNavigationMenuOpenChangeReason,
        event: Event,
        trigger?: HTMLElement
    ): RdxNavigationMenuOpenChangeTransaction {
        return createNavigationMenuOpenChangeEvent(value, reason, event, trigger);
    }

    private scheduleInstantReset() {
        if (this.instantFrame !== undefined) {
            cancelAnimationFrame(this.instantFrame);
        }

        this.instantFrame = requestAnimationFrame(() => {
            this.instantFrame = undefined;

            if (!this.destroyRef.destroyed && this.isOpen()) {
                this.instant.set(false);
            }
        });
    }

    private clearHoverTimers() {
        this.clearOpenTimer();
        this.clearCloseTimer();
    }

    private clearOpenTimer() {
        if (this.openTimer !== undefined) {
            clearTimeout(this.openTimer);
            this.openTimer = undefined;
        }
    }

    private clearCloseTimer() {
        if (this.closeTimer !== undefined) {
            clearTimeout(this.closeTimer);
            this.closeTimer = undefined;
        }
    }

    private isInsideOpenChild(target: EventTarget | null): boolean {
        if (!(target instanceof Node)) {
            return false;
        }

        const node = this.registration?.node();

        if (!node) {
            return false;
        }

        return node.tree.children(node, { onlyOpen: true }).some((child) => {
            const context = child.context;
            const floating = context?.floatingElement;

            return !!floating && floating.contains(target);
        });
    }
}

function contextFor(root: RdxNavigationMenuRoot): RdxNavigationMenuRootContext {
    return {
        nested: root.nested,
        baseId: root.baseId,
        orientation: root.orientation,
        dir: root.dir,
        loop: root.loop,
        value: root.value,
        previousValue: root.previousValue.asReadonly(),
        isOpen: root.isOpen,
        present: root.present,
        instant: root.instant.asReadonly(),
        transitionStatus: root.transitionStatus,
        trigger: root.trigger.asReadonly(),
        triggers: root.triggers.asReadonly(),
        list: root.list.asReadonly(),
        contents: root.contents.asReadonly(),
        activeContent: root.activeContent,
        popup: root.popup.asReadonly(),
        size: root.size.asReadonly(),
        contentId: (value) => root.contentId(value),
        triggerId: (value) => root.triggerId(value),
        setValue: (value, reason, event) => root.setValue(value, reason, event),
        open: (value, trigger, reason, event) => root.open(value, trigger, reason, event),
        close: (reason, event) => root.close(reason, event),
        toggle: (value, trigger, event) => root.toggle(value, trigger, event),
        openOnHover: (value, trigger, event) => root.openOnHover(value, trigger, event),
        closeOnHover: (event) => root.closeOnHover(event),
        cancelHoverOpen: () => root.cancelHoverOpen(),
        cancelHoverClose: () => root.cancelHoverClose(),
        setSize: (size) => root.setSize(size),
        registerTrigger: (value, trigger) => root.registerTrigger(value, trigger),
        registerList: (list) => root.registerList(list),
        registerContent: (entry) => root.registerContent(entry),
        registerPopup: (element) => root.registerPopup(element),
        registerTransitionElement: (element) => root.registerTransitionElement(element),
        registerViewport: (onTriggerChange) => root.registerViewport(onTriggerChange)
    };
}

interface RdxNavigationMenuOpenChangeTransaction {
    payload: RdxNavigationMenuOpenChange;
    eventDetails: RdxNavigationMenuOpenChangeEventDetails;
    shouldPreventUnmountOnClose: () => boolean;
}

function createNavigationMenuOpenChangeEvent(
    value: string | null,
    reason: RdxNavigationMenuOpenChangeReason,
    event: Event,
    trigger?: HTMLElement
): RdxNavigationMenuOpenChangeTransaction {
    const change = createCancelableChangeEventDetails(reason, event, trigger);

    return {
        payload: {
            value,
            open: value !== null,
            reason,
            event: change.eventDetails.event,
            trigger,
            eventDetails: change.eventDetails
        },
        eventDetails: change.eventDetails,
        shouldPreventUnmountOnClose: change.shouldPreventUnmountOnClose
    };
}
