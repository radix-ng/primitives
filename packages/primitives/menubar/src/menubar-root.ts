import {
    booleanAttribute,
    computed,
    contentChildren,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    Signal,
    signal
} from '@angular/core';
import { RdxCompositeList, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { BooleanInput, createContext, provideFloatingTree } from '@radix-ng/primitives/core';
import { RDX_MENU_AMBIENT_MODAL, RdxMenuRoot, RdxMenuTriggerInteraction } from '@radix-ng/primitives/menu';

export type RdxMenubarOrientation = 'horizontal' | 'vertical';

interface RdxMenubarItem {
    id: string;
    el: HTMLElement;
    root?: RdxMenuRoot;
    open: () => void;
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
        open: () => void,
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
        { provide: RDX_MENU_AMBIENT_MODAL, useFactory: () => inject(RdxMenubarRoot).modal }
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

    /** Whether every menubar trigger is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether the child menus block outside interaction and lock scroll while open (Base UI default `true`). */
    readonly modal = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** Whether arrow-key navigation wraps at the first/last trigger. */
    readonly loopFocus = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** The menubar orientation. */
    readonly orientation = input<RdxMenubarOrientation>('horizontal');

    readonly activeId = signal<string | null>(null);
    readonly isAnyOpen = computed(() => this.activeId() !== null);
    /** Whether a **nested submenu** is currently open (Base UI `data-has-submenu-open` — not top-level menus). */
    readonly hasSubmenuOpen = computed(() => this.menuRoots().some((root) => root.isSubmenu() && root.open()));

    constructor() {
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

                if (!trigger || trigger.closest('[rdxMenuPopup]')) {
                    return;
                }

                registered.push(this.registerMenuRoot(root, trigger));
            });

            onCleanup(() => {
                registered.forEach((cleanup) => cleanup());
            });
        });

        effect(() => {
            const activeId = this.activeId();

            if (!activeId) {
                return;
            }

            this.menuRoots().forEach((root) => {
                const trigger = root.trigger();

                if (!trigger || trigger.closest('[rdxMenuPopup]')) {
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
        open: () => void,
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
        const unregisterPopupArrowNavigation = root.registerPopupArrowNavigationHandler((offset) => {
            if (this.disabled()) {
                return false;
            }

            this.focusAdjacent(id, offset, true);
            return true;
        });
        const unregisterTriggerInteraction = root.registerTriggerInteractionHandler((interaction) =>
            this.handleTriggerInteraction(id, root, trigger, interaction)
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
            open: () => root.show(false),
            close: () => root.close(),
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
            case 'click': {
                if (root.open()) {
                    root.close();
                    this.deactivateAll();
                } else {
                    root.show();
                    this.activateItem(id);
                }
                return true;
            }
            case 'enter':
            case 'space': {
                interaction.event.preventDefault();
                interaction.event.stopPropagation();

                if (root.open()) {
                    root.close();
                    this.deactivateAll();
                } else {
                    root.show('first', 'trigger-press', interaction.event);
                    this.activateItem(id);
                }

                return true;
            }
            case 'pointerenter': {
                if (interaction.event.pointerType === 'touch' || !this.hasOpenMenu()) {
                    return false;
                }

                if (root.open()) {
                    return true;
                }

                trigger.focus({ preventScroll: true });
                root.show(false, 'trigger-hover');
                this.activateItem(id);
                return true;
            }
            case 'arrowdown': {
                interaction.event.preventDefault();
                root.show('first');
                this.activateItem(id);
                return true;
            }
            case 'arrowup': {
                interaction.event.preventDefault();
                root.show('last');
                this.activateItem(id);
                return true;
            }
            case 'arrowleft': {
                this.handleTriggerArrow(interaction.event, id, -1, root.open());
                return true;
            }
            case 'arrowright': {
                this.handleTriggerArrow(interaction.event, id, 1, root.open());
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
                root.close();
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
        const enabled = this.enabledItems();
        const currentIndex = enabled.findIndex((item) => item.id === currentId);
        if (currentIndex === -1 || enabled.length === 0) return;

        const nextIndex = currentIndex + offset;
        if (!this.loopFocus() && (nextIndex < 0 || nextIndex >= enabled.length)) {
            return;
        }

        const next = enabled[(nextIndex + enabled.length) % enabled.length];
        this.focusItem(next, openOnMove);
    }

    private focusItem(item: RdxMenubarItem | undefined, openOnMove: boolean): void {
        if (!item || this.disabled()) return;

        this.highlightItem(item);
        item.el.focus({ preventScroll: true });
        if (openOnMove) {
            item.open();
            this.activateItem(item.id);
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

        if (this.hasOpenMenu() && this.activeId() !== focusedItem.id) {
            focusedItem.open();
            this.activateItem(focusedItem.id);
        }
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
        this.items.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        this.markItemsChanged();
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
            item.el.tabIndex = index === highlightedIndex && !item.disabled() ? 0 : -1;
        });
    }
}
