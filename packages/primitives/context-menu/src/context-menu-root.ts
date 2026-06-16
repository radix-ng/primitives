import { Directive, inject, Signal } from '@angular/core';
import type { VirtualElement } from '@floating-ui/dom';
import { createContext } from '@radix-ng/primitives/core';
import { RdxMenuAutoFocusInput, RdxMenuRoot } from '@radix-ng/primitives/menu';
import { RdxPopper } from '@radix-ng/primitives/popper';

export interface RdxContextMenuRootContext {
    /** Whether the context menu is currently open. */
    isOpen: Signal<boolean>;
    /** Whether the whole menu is disabled. */
    disabled: Signal<boolean>;
    /** Open the menu anchored at the given viewport coordinates. */
    openAt: (clientX: number, clientY: number, autoFocus?: RdxMenuAutoFocusInput, event?: Event) => void;
    /** Close the menu. */
    close: () => void;
}

export const [injectRdxContextMenuRootContext, provideRdxContextMenuRootContext] =
    createContext<RdxContextMenuRootContext>('RdxContextMenuRootContext', 'components/context-menu');

const contextFactory = (): RdxContextMenuRootContext => {
    const root = inject(RdxContextMenuRoot);
    return {
        isOpen: root.menuRoot.open,
        disabled: root.menuRoot.disabled,
        openAt: (clientX, clientY, autoFocus, event) => root.openAt(clientX, clientY, autoFocus, event),
        close: () => root.menuRoot.close()
    };
};

/**
 * Groups all parts of a context menu. Composes the Menu primitive but, instead of anchoring the
 * popup to a trigger element, anchors it to the pointer position captured by `rdxContextMenuTrigger`.
 *
 * Reuse the Menu popup parts inside it — `rdxMenuPositioner`, `rdxMenuPopup`, `rdxMenuItem`,
 * `rdxMenuCheckboxItem`, `rdxMenuRadioGroup`, `rdxMenuSubTrigger`, `rdxMenuSeparator`, … all behave
 * identically here.
 */
@Directive({
    selector: '[rdxContextMenuRoot]',
    exportAs: 'rdxContextMenuRoot',
    hostDirectives: [
        {
            directive: RdxMenuRoot,
            inputs: ['open', 'modal', 'loopFocus', 'highlightItemOnHover'],
            outputs: ['openChange', 'onOpenChange', 'onOpenChangeComplete']
        }
    ],
    providers: [provideRdxContextMenuRootContext(contextFactory)]
})
export class RdxContextMenuRoot {
    readonly menuRoot = inject(RdxMenuRoot);
    private readonly popper = inject(RdxPopper);

    constructor() {
        // Tell the composed menu root it is a Context Menu, so its per-kind policy (modal focus trap,
        // backdrop, outside-press grace) differs from a plain dropdown (Base UI `MenuParent.type`).
        this.menuRoot.markAsContextMenu();
    }

    /**
     * Open the menu with the popup anchored at the given viewport coordinates.
     *
     * `autoFocus` defaults to `'popup'` so a right-click opens with the popup focused but no item
     * highlighted (matching Base UI's pointer behavior). Pass `'first'` for keyboard opening. `event` is
     * the originating pointer event (threaded to the menu so a touch long-press is recorded for the
     * anchored scroll-lock policy, ADR 0016 §3).
     */
    openAt(clientX: number, clientY: number, autoFocus: RdxMenuAutoFocusInput = 'popup', event?: Event): void {
        if (this.menuRoot.disabled()) {
            return;
        }

        const anchor: VirtualElement = {
            getBoundingClientRect: () =>
                ({
                    width: 0,
                    height: 0,
                    x: clientX,
                    y: clientY,
                    top: clientY,
                    left: clientX,
                    right: clientX,
                    bottom: clientY,
                    toJSON: () => ({})
                }) as DOMRect
        };

        this.popper.anchorOverride.set(anchor);
        // Move focus into the popup so keyboard navigation and outside-dismiss work immediately.
        this.menuRoot.show(autoFocus, 'trigger-press', event);
    }
}
