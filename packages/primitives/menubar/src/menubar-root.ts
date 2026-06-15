import {
    booleanAttribute,
    computed,
    contentChildren,
    Directive,
    effect,
    inject,
    input,
    signal,
    Signal
} from '@angular/core';
import { BooleanInput, createContext } from '@radix-ng/primitives/core';
import { RdxMenuRoot, RdxMenuTriggerInteraction } from '@radix-ng/primitives/menu';

export type RdxMenubarOrientation = 'horizontal' | 'vertical';

interface RdxMenubarItem {
    id: string;
    el: HTMLElement;
    root: RdxMenuRoot;
    open: () => void;
    close: () => void;
    disabled: () => boolean;
}

export interface RdxMenubarContext {
    activeId: Signal<string | null>;
    isAnyOpen: Signal<boolean>;
    disabled: Signal<boolean>;
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
    providers: [provideRdxMenubarContext(contextFactory)],
    host: {
        role: 'menubar',
        tabindex: '0',
        '[attr.aria-orientation]': 'orientation()',
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-has-submenu-open]': 'isAnyOpen() ? "" : undefined',
        '(keydown.arrowleft)': 'handleArrowLeft($event)',
        '(keydown.arrowright)': 'handleArrowRight($event)'
    }
})
export class RdxMenubarRoot {
    private readonly menuRoots = contentChildren(RdxMenuRoot);
    private readonly ids = new WeakMap<RdxMenuRoot, string>();
    private items: RdxMenubarItem[] = [];

    /** Whether every menubar trigger is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether arrow-key navigation wraps at the first/last trigger. */
    readonly loopFocus = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** The menubar orientation. */
    readonly orientation = input<RdxMenubarOrientation>('horizontal');

    readonly activeId = signal<string | null>(null);
    readonly isAnyOpen = computed(() => this.activeId() !== null);

    constructor() {
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
        this.items.push({ id, el, root: undefined as never, open, close, disabled });
        // Keep items in DOM order
        this.items.sort((a, b) => (a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1));
        return () => {
            this.items = this.items.filter((item) => item.id !== id);
            if (this.activeId() === id) this.activeId.set(null);
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
        const unregisterItem = this.registerResolvedItem(id, trigger, root);

        return () => {
            unregisterItem();
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
            disabled: () => this.disabled() || root.disabled() || el.hasAttribute('disabled')
        });
        this.items.sort((a, b) => (a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1));
        this.updateTriggerTabStops();

        return () => {
            this.items = this.items.filter((item) => item.id !== id);
            if (this.activeId() === id) this.activeId.set(null);
            this.updateTriggerTabStops();
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

    protected handleArrowLeft(event: Event): void {
        this.handleOpenMenuNavigation(event, -1);
    }

    protected handleArrowRight(event: Event): void {
        this.handleOpenMenuNavigation(event, 1);
    }

    private handleOpenMenuNavigation(event: Event, offset: 1 | -1): void {
        const activeId = this.activeId();

        if (!activeId || this.disabled() || !this.hasOpenMenu()) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        (event as KeyboardEvent).stopImmediatePropagation();
        this.focusAdjacent(activeId, offset, true);
    }

    private focusItem(item: RdxMenubarItem | undefined, openOnMove: boolean): void {
        if (!item || this.disabled()) return;

        item.el.focus();
        if (openOnMove) {
            item.open();
            this.activateItem(item.id);
        }
    }

    private updateTriggerTabStops(): void {
        this.items.forEach((item) => item.el.setAttribute('tabindex', '-1'));
    }

    private enabledItems(): RdxMenubarItem[] {
        return this.items.filter((item) => !item.disabled());
    }

    private hasOpenMenu(): boolean {
        return this.items.some((item) => item.root?.open());
    }
}
