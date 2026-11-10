import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    contentChildren,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    signal,
    Signal,
    untracked
} from '@angular/core';
import { findNonDisabledListIndex, RdxCompositeList, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { BooleanInput, createContext, getActiveElement, provideFloatingTree } from '@radix-ng/primitives/core';
import { observeFocusRecovery } from '@radix-ng/primitives/focus-scope';
import {
    RDX_MENU_AMBIENT_DISABLED,
    RDX_MENU_AMBIENT_MODAL,
    RdxMenuOpenChangeReason,
    RdxMenuRoot,
    RdxMenuTriggerInteraction,
    type RdxMenuAutoFocusInput
} from '@radix-ng/primitives/menu';

export type RdxMenubarOrientation = 'horizontal' | 'vertical';

interface RdxMenubarItem {
    id: string;
    el: HTMLElement;
    root?: RdxMenuRoot;
    open: (reason?: RdxMenuOpenChangeReason, event?: Event) => void;
    close: () => void;
    disabled: () => boolean;
}

export interface RdxMenubarContext {
    activeId: Signal<string | null>;
    isAnyOpen: Signal<boolean>;
    disabled: Signal<boolean>;
    modal: Signal<boolean>;
    orientation: Signal<RdxMenubarOrientation>;
    registerItem: (
        id: string,
        el: HTMLElement,
        open: (reason?: RdxMenuOpenChangeReason, event?: Event) => void,
        close: () => void,
        disabled: () => boolean
    ) => () => void;
    activateItem: (id: string) => void;
    deactivateAll: () => void;
    focusAdjacent: (currentId: string, offset: 1 | -1, openOnMove: boolean) => void;
    focusBoundary: (boundary: 'first' | 'last', openOnMove: boolean) => void;
}

export const [injectRdxMenubarContext, provideRdxMenubarContext] = createContext<RdxMenubarContext>(
    'RdxMenubarContext',
    'components/menubar'
);

const contextFactory = () => buildContext(inject(RdxMenubarRoot));

function buildContext(root: RdxMenubarRoot): RdxMenubarContext {
    return {
        activeId: root.activeId.asReadonly(),
        isAnyOpen: root.isAnyOpen,
        disabled: root.disabled,
        modal: root.modal,
        orientation: root.orientation,
        registerItem: (id, el, open, close, disabled) => root.registerItem(id, el, open, close, disabled),
        activateItem: (id) => root.activateItem(id),
        deactivateAll: () => root.deactivateAll(),
        focusAdjacent: (id, offset, open) => root.focusAdjacent(id, offset, open),
        focusBoundary: (boundary, open) => root.focusBoundary(boundary, open)
    };
}

let nextMenubarItemId = 0;

/**
 * Container for a horizontal application menu bar.
 * Coordinates open/close state across multiple menus and provides arrow-key navigation.
 */
@Directive({
    selector: '[rdxMenubarRoot]',
    exportAs: 'rdxMenubarRoot',
    providers: [
        provideRdxMenubarContext(contextFactory),
        // One shared floating tree for all child menus (Base UI `Menubar` wraps them in a single
        // `FloatingTree`). Each `RdxMenuRoot`'s own `provideFloatingTree()` inherits this via skipSelf, so
        // sibling menubar menus live in the same tree — the dismissal / focus engine can see their
        // relationships instead of each menu owning an isolated tree.
        provideFloatingTree(),
        // Thread the menubar's `modal` to every child menu (Base UI `Menubar` passes `modal` into each
        // `Menu.Root`). Child `RdxMenuRoot`s inherit it via the ambient token instead of each defaulting.
        { provide: RDX_MENU_AMBIENT_MODAL, useFactory: () => inject(RdxMenubarRoot).modal },
        { provide: RDX_MENU_AMBIENT_DISABLED, useFactory: () => inject(RdxMenubarRoot).disabled }
    ],
    host: {
        role: 'menubar',
        '[attr.aria-orientation]': 'orientation()',
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-modal]': 'modal() ? "" : undefined',
        '[attr.data-has-submenu-open]': 'hasSubmenuOpen() ? "" : undefined',
        '(focusin)': 'handleFocusIn($event)'
    },
    hostDirectives: [RdxCompositeRoot]
})
export class RdxMenubarRoot {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly compositeRoot = inject(RdxCompositeRoot, { self: true });
    private readonly compositeList = inject(RdxCompositeList, { self: true });
    private readonly menuRoots = contentChildren(RdxMenuRoot, { descendants: true });
    private readonly ids = new WeakMap<RdxMenuRoot, string>();
    private items: RdxMenubarItem[] = [];
    private readonly itemsVersion = signal(0);
    private readonly interactionMode = signal(false);
    private readonly observedOpenStates = new WeakMap<RdxMenuRoot, boolean>();
    // Capture Escape ownership before an earlier document listener closes/unmounts its menu.
    private readonly escapeOwners = new WeakMap<KeyboardEvent, string | undefined>();

    /** Whether every menubar trigger is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether the child menus block outside interaction and lock scroll while open (Base UI default `true`). */
    readonly modal = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** Whether arrow-key navigation wraps at the first/last trigger. */
    readonly loopFocus = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** The menubar orientation. */
    readonly orientation = input<RdxMenubarOrientation>('horizontal');

    readonly activeId = signal<string | null>(null);
    readonly isAnyOpen = computed(
        () => this.activeId() !== null || this.menuRoots().some((root) => !root.isSubmenu() && root.open())
    );
    /** Open-on-focus mode, retained while navigating between the bar and its menus. */
    readonly hasSubmenuOpen = this.interactionMode.asReadonly();

    constructor() {
        inject(DestroyRef).onDestroy(
            observeFocusRecovery({
                container: this.elementRef.nativeElement,
                enabled: () => !this.disabled() && !this.hasOpenMenu(),
                target: (previous, moved, visible) =>
                    moved && visible && this.items.some((item) => item.el === previous) ? previous : undefined
            })
        );
        effect(() => {
            this.compositeList.items();
            this.orderItems();
            const focused = getActiveElement(this.elementRef.nativeElement.ownerDocument);
            const item = this.items.find((item) => item.el === focused);
            if (item && !item.disabled()) this.highlightItem(item);
        });

        effect(() => {
            this.compositeRoot.setOrientation(this.orientation());
            this.compositeRoot.setLoopFocus(this.loopFocus());
            this.compositeRoot.setEnableHomeAndEndKeys(true);
        });

        effect(() => {
            this.itemsVersion();
            this.syncDisabledIndices();
            this.syncTabIndices();
        });

        effect(() => {
            this.compositeRoot.highlightedIndex();
            this.itemsVersion();
            this.syncTabIndices();
        });

        effect((onCleanup) => {
            const roots = this.menuRoots();
            const registered: Array<() => void> = [];

            roots.forEach((root) => {
                const trigger = root.trigger();

                if (!trigger || root.isSubmenu()) {
                    return;
                }

                registered.push(this.registerMenuRoot(root, trigger));
            });

            onCleanup(() => {
                registered.forEach((cleanup) => cleanup());
            });
        });

        afterRenderEffect(() => {
            const states = this.menuRoots()
                .filter((root) => !root.isSubmenu())
                .map((root) => ({ root, open: root.open() }));
            // Input/default changes need no imperative open request. Observe only changed Roots;
            // an unchanged open sibling must not reactivate a mode ended by another menu's close.
            untracked(() => {
                for (const { root, open } of states) {
                    const previous = this.observedOpenStates.get(root);
                    if (previous === open) continue;
                    this.observedOpenStates.set(root, open);
                    if (previous !== undefined || open) this.updateInteractionMode(open, root.lastOpenChangeReason());
                    if (open) {
                        // Input changes join sibling coordination once the new popup view exists.
                        this.activateItem(this.idFor(root));
                    }
                }
            });
        });

        effect(() => {
            const activeId = this.activeId();

            if (!activeId) {
                return;
            }

            this.menuRoots().forEach((root) => {
                const trigger = root.trigger();

                if (!trigger || root.isSubmenu()) {
                    return;
                }

                if (this.idFor(root) === activeId && !root.open()) {
                    this.deactivateAll();
                }
            });
        });
    }

    registerItem(
        id: string,
        el: HTMLElement,
        open: (reason?: RdxMenuOpenChangeReason, event?: Event) => void,
        close: () => void,
        disabled: () => boolean
    ): () => void {
        this.items.push({ id, el, open, close, disabled });
        this.sortItems();
        return () => {
            this.items = this.items.filter((item) => item.id !== id);
            if (this.activeId() === id) this.activeId.set(null);
            this.markItemsChanged();
        };
    }

    activateItem(id: string): void {
        if (this.disabled()) {
            return;
        }

        // Close every other open menu
        this.items.forEach((item) => {
            if (item.id !== id) item.close();
        });
        this.activeId.set(id);
    }

    deactivateAll(): void {
        this.activeId.set(null);
    }

    focusBoundary(boundary: 'first' | 'last', openOnMove: boolean): void {
        const enabled = this.enabledItems();
        this.focusItem(boundary === 'first' ? enabled[0] : enabled[enabled.length - 1], openOnMove);
    }

    generateId(): string {
        return `rdx-menubar-item-${nextMenubarItemId++}`;
    }

    private idFor(root: RdxMenuRoot): string {
        let id = this.ids.get(root);

        if (!id) {
            id = this.generateId();
            this.ids.set(root, id);
        }

        return id;
    }

    private registerMenuRoot(root: RdxMenuRoot, trigger: HTMLElement): () => void {
        const id = this.idFor(root);
        const handleOpenChange = ({ open, reason }: { open: boolean; reason?: string }) => {
            this.observedOpenStates.set(root, open);
            this.updateInteractionMode(open, reason);
        };
        // Observe accepted requests synchronously: returning native focus after a navigation close
        // must still see open-on-focus mode. Nested Roots have their own return-focus policy.
        root.floatingContext.events.on('openchange', handleOpenChange);
        const unregisterPopupArrowNavigation = root.registerPopupArrowNavigationHandler((offset, event) => {
            if (this.disabled()) {
                return false;
            }

            const vertical = this.orientation() === 'vertical';
            const returnsToTrigger = !root.effectiveDisabled() && offset === (root.dir() === 'rtl' ? 1 : -1);
            // Return before the parent bar navigates, as for an ordinary nested list. Horizontal
            // navigation consumes the key after its close callbacks; vertical return consumes it now.
            if (returnsToTrigger) root.closeForNavigation(event, vertical);
            if (vertical) return returnsToTrigger;
            this.focusAdjacent(id, root.dir() === 'rtl' ? (offset === 1 ? -1 : 1) : offset, true);
            return true;
        });
        const unregisterTriggerInteraction = root.registerTriggerInteractionHandler(
            (interaction) => this.handleTriggerInteraction(id, root, trigger, interaction),
            this.elementRef.nativeElement,
            {
                insideElements: () =>
                    this.menuRoots()
                        .filter((menu) => menu.open())
                        .map((menu) => menu.popupElement()),
                ownsEscape: (event) => {
                    if (!this.escapeOwners.has(event)) {
                        const target = (event.composedPath()[0] ?? event.target) as Node;
                        const owner = this.menuRoots().find(
                            (menu) =>
                                menu.open() &&
                                (menu.trigger()?.contains(target) || menu.popupElement()?.contains(target))
                        );
                        this.escapeOwners.set(event, owner?.ownerId());
                    }
                    const owner = this.escapeOwners.get(event);
                    return owner === undefined || owner === root.ownerId();
                }
            }
        );
        const unregisterCompositeItem = this.compositeList.registerItem({
            element: trigger,
            metadata: computed(() => ({
                disabled:
                    this.disabled() ||
                    root.disabled() ||
                    trigger.hasAttribute('disabled') ||
                    trigger.getAttribute('aria-disabled') === 'true'
            }))
        });
        const unregisterItem = this.registerResolvedItem(id, trigger, root);

        return () => {
            root.floatingContext.events.off('openchange', handleOpenChange);
            unregisterItem();
            unregisterCompositeItem();
            unregisterTriggerInteraction();
            unregisterPopupArrowNavigation();
        };
    }

    private registerResolvedItem(id: string, el: HTMLElement, root: RdxMenuRoot): () => void {
        this.items.push({
            id,
            el,
            root,
            open: (reason = 'trigger-focus', event?: Event) => this.openMenu(id, root, 'popup', reason, event),
            close: () => root.close('sibling-open'),
            disabled: () =>
                this.disabled() ||
                root.disabled() ||
                el.hasAttribute('disabled') ||
                el.getAttribute('aria-disabled') === 'true'
        });
        this.sortItems();

        return () => {
            this.items = this.items.filter((item) => item.id !== id);
            if (this.activeId() === id) this.activeId.set(null);
            this.markItemsChanged();
        };
    }

    private updateInteractionMode(open: boolean, reason?: string): void {
        if (open) this.interactionMode.set(true);
        else if (reason !== 'sibling-open' && reason !== 'list-navigation') this.interactionMode.set(false);
    }

    private handleTriggerInteraction(
        id: string,
        root: RdxMenuRoot,
        trigger: HTMLElement,
        interaction: RdxMenuTriggerInteraction
    ): boolean {
        if (this.disabled()) {
            return false;
        }

        switch (interaction.type) {
            case 'mousedown': {
                if (root.open()) return false;
                root.show('popup', 'trigger-press', interaction.event);
                if (root.open()) this.activateItem(id);
                return true;
            }
            case 'click': {
                if (root.open()) {
                    root.close('trigger-press', interaction.event);
                    if (!root.open()) this.deactivateAll();
                } else {
                    root.show(interaction.event?.detail === 0 ? 'first' : 'popup', 'trigger-press', interaction.event);
                    if (root.open()) this.activateItem(id);
                }
                return true;
            }
            case 'enter':
            case 'space': {
                interaction.event.preventDefault();
                interaction.event.stopPropagation();

                if (root.open()) {
                    root.close('none');
                    this.deactivateAll();
                } else {
                    root.show('first', 'trigger-press', interaction.event);
                    this.activateItem(id);
                }

                return true;
            }
            case 'pointerenter': {
                if (interaction.event.pointerType === 'touch' || !this.hasSubmenuOpen()) {
                    return false;
                }

                if (root.open()) {
                    return true;
                }

                this.openMenu(id, root, 'popup', 'trigger-hover', interaction.event);
                trigger.focus({ preventScroll: true });
                return true;
            }
            case 'arrowdown': {
                if (this.orientation() === 'vertical') {
                    this.handleTriggerArrow(interaction.event, id, 1, root.open());
                    return true;
                }
                interaction.event.preventDefault();
                this.openMenu(id, root, 'first', 'list-navigation', interaction.event);
                return true;
            }
            case 'arrowup': {
                if (this.orientation() === 'vertical') {
                    this.handleTriggerArrow(interaction.event, id, -1, root.open());
                    return true;
                }
                interaction.event.preventDefault();
                this.openMenu(id, root, 'last', 'list-navigation', interaction.event);
                return true;
            }
            case 'arrowleft': {
                if (this.orientation() === 'vertical') {
                    if (root.dir() === 'rtl') {
                        interaction.event.preventDefault();
                        this.openMenu(id, root, 'first', 'list-navigation', interaction.event);
                    }
                } else this.handleTriggerArrow(interaction.event, id, root.dir() === 'rtl' ? 1 : -1, root.open());
                return true;
            }
            case 'arrowright': {
                if (this.orientation() === 'vertical') {
                    if (root.dir() !== 'rtl') {
                        interaction.event.preventDefault();
                        this.openMenu(id, root, 'first', 'list-navigation', interaction.event);
                    }
                } else this.handleTriggerArrow(interaction.event, id, root.dir() === 'rtl' ? -1 : 1, root.open());
                return true;
            }
            case 'home': {
                this.handleTriggerBoundary(interaction.event, 'first', root.open());
                return true;
            }
            case 'end': {
                this.handleTriggerBoundary(interaction.event, 'last', root.open());
                return true;
            }
            case 'escape': {
                interaction.event.preventDefault();
                interaction.event.stopPropagation();
                root.close('none');
                this.deactivateAll();
                trigger.focus({ preventScroll: true });
                return true;
            }
            default:
                return false;
        }
    }

    private handleTriggerArrow(event: Event, id: string, offset: 1 | -1, openOnMove: boolean): void {
        event.preventDefault();
        event.stopPropagation();
        (event as KeyboardEvent).stopImmediatePropagation();
        this.focusAdjacent(id, offset, openOnMove);
    }

    private handleTriggerBoundary(event: Event, boundary: 'first' | 'last', openOnMove: boolean): void {
        event.preventDefault();
        event.stopPropagation();
        (event as KeyboardEvent).stopImmediatePropagation();
        this.focusBoundary(boundary, openOnMove);
    }

    focusAdjacent(currentId: string, offset: 1 | -1, openOnMove: boolean): void {
        // The current menu may have become disabled while its popup still owns focus.
        // Keep its DOM position as the origin, then skip unavailable destinations.
        const currentIndex = this.items.findIndex((item) => item.id === currentId);
        if (currentIndex === -1) return;
        const elements = this.items.map((item) => item.el);
        const options = {
            decrement: offset < 0,
            disabledIndices: this.items.flatMap((item, index) => (item.disabled() ? [index] : []))
        };
        let next = findNonDisabledListIndex(elements, { ...options, startingIndex: currentIndex });
        if (next === -1 && this.loopFocus()) {
            next = findNonDisabledListIndex(elements, {
                ...options,
                startingIndex: offset > 0 ? -1 : elements.length
            });
        }
        // Wrapping to the same trigger is not a sibling transition.
        if (next !== -1 && next !== currentIndex) this.focusItem(this.items[next], openOnMove);
    }

    private focusItem(item: RdxMenubarItem | undefined, openOnMove: boolean): void {
        if (!item || this.disabled()) return;

        this.highlightItem(item);
        item.el.focus({ preventScroll: true });
        if (openOnMove && !this.hasOpenMenu()) {
            item.open();
            if (!item.root) this.activateItem(item.id);
        }
    }

    protected handleFocusIn(event: FocusEvent): void {
        const target = event.target;

        if (target === this.elementRef.nativeElement) {
            this.focusItem(this.enabledItems()[0], false);
            return;
        }

        const focusedItem = target instanceof HTMLElement ? this.items.find((item) => item.el === target) : undefined;
        if (!focusedItem || focusedItem.disabled()) {
            return;
        }

        this.highlightItem(focusedItem);

        if (this.hasSubmenuOpen() && (this.activeId() !== focusedItem.id || !focusedItem.root?.open())) {
            if (
                focusedItem.root &&
                this.activeId() === focusedItem.id &&
                focusedItem.root.lastOpenChangeReason() === 'list-navigation'
            ) {
                // A navigation return keeps focus on its trigger and the mounted popup's highlight.
                this.openMenu(focusedItem.id, focusedItem.root, false, 'trigger-focus', event);
            } else focusedItem.open('trigger-focus', event);
            if (!focusedItem.root) this.activateItem(focusedItem.id);
        } else if (
            this.hasSubmenuOpen() &&
            focusedItem.root?.open() &&
            focusedItem.root.lastOpenChangeReason() === 'trigger-hover'
        ) {
            focusedItem.open('trigger-focus', event);
        }
    }

    private openMenu(
        id: string,
        root: RdxMenuRoot,
        autoFocus: RdxMenuAutoFocusInput,
        reason: RdxMenuOpenChangeReason,
        event?: Event
    ): void {
        const wasOpen = root.open();
        root.show(autoFocus, reason, event);
        if (!root.open()) return;
        if (wasOpen) this.activeId.set(id);
        else this.activateItem(id);
    }

    private highlightItem(item: RdxMenubarItem): void {
        const index = this.items.findIndex((candidate) => candidate.id === item.id);
        if (index !== -1) {
            this.compositeRoot.setHighlightedIndex(index, true);
        }
    }

    private enabledItems(): RdxMenubarItem[] {
        return this.items.filter((item) => !item.disabled());
    }

    private hasOpenMenu(): boolean {
        return this.items.some((item) => item.root?.open());
    }

    private sortItems(): void {
        this.orderItems();
        this.markItemsChanged();
    }

    private orderItems(): void {
        this.items.sort((a, b) =>
            a === b ? 0 : a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
        );
    }

    private markItemsChanged(): void {
        this.itemsVersion.update((value) => value + 1);
    }

    private syncDisabledIndices(): void {
        const disabledIndices = this.items
            .map((item, index) => (item.disabled() ? index : -1))
            .filter((index) => index !== -1);

        this.compositeRoot.setDisabledIndices(disabledIndices.length ? disabledIndices : undefined);
    }

    private syncTabIndices(): void {
        const highlightedIndex = this.compositeRoot.highlightedIndex();

        this.items.forEach((item, index) => {
            item.el.tabIndex = this.disabled()
                ? index === 0
                    ? 0
                    : -1
                : index === highlightedIndex && !item.disabled()
                  ? 0
                  : -1;
        });
    }
}
