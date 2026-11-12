import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    signal,
    untracked
} from '@angular/core';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, injectDocument, TAB } from '@radix-ng/primitives/core';
import { provideNavigationMenuCompositeItemOwner } from './navigation-menu-composite-item-owner';
import { RdxNavigationMenuItem } from './navigation-menu-item';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';
import { focusFirst, getTabbableCandidates } from './utils';

/**
 * A button that opens its item's content in the shared popup.
 */
@Directive({
    selector: 'button[rdxNavigationMenuTrigger]',
    hostDirectives: [RdxCompositeItem],
    providers: [provideNavigationMenuCompositeItemOwner()],
    host: {
        type: 'button',
        '[id]': 'item.triggerId()',
        '[attr.aria-controls]': 'open() ? rootContext.popup()?.id : undefined',
        '[attr.aria-expanded]': 'open()',
        '[attr.data-popup-open]': 'open() ? "" : undefined',
        '[attr.data-pressed]': 'pressed() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        // Base UI keeps a disabled nav-menu trigger focusable (`focusableWhenDisabled`): it uses
        // `aria-disabled` (not the native `disabled` attribute) so the trigger stays in the tab order,
        // while the click / keydown handlers below already no-op when disabled.
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '(click)': 'onClick($event)',
        '(pointerdown)': 'pressed.set(true)',
        '(pointerup)': 'pressed.set(false)',
        '(pointercancel)': 'pressed.set(false)',
        '(pointerenter)': 'onPointerEnter($event)',
        '(pointerleave)': 'onPointerLeave($event)',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxNavigationMenuTrigger {
    protected readonly item = inject(RdxNavigationMenuItem);
    protected readonly rootContext = injectNavigationMenuRootContext();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly document = injectDocument();
    private readonly destroyRef = inject(DestroyRef);

    /**
     * Whether the trigger should ignore user interaction.
     */
    readonly disabled = input(false, { transform: booleanAttribute });

    /**
     * Whether the content should also open when the trigger is hovered.
     */
    readonly openOnHover = input(true, { transform: booleanAttribute });

    /** Whether the trigger is currently pressed (pointer down), for Base UI's `data-pressed`. */
    protected readonly pressed = signal(false);

    protected readonly open = computed(() => this.item.isOpen());

    constructor() {
        // Host element is available in the constructor; the trigger ref does not depend on inputs.
        this.item.triggerRef.set(this.elementRef.nativeElement);

        effect((onCleanup) => {
            const value = this.item.value();
            const element = this.elementRef.nativeElement;
            // Register untracked: registerTrigger reads root state internally, and we must not make
            // this effect re-run (and tear down the registration) when the open value changes.
            onCleanup(untracked(() => this.rootContext.registerTrigger(value, element)));
        });
    }

    protected onClick(event: MouseEvent) {
        if (this.disabled()) {
            return;
        }

        this.rootContext.toggle(this.item.value(), this.elementRef.nativeElement, event);
    }

    protected onPointerEnter(event: PointerEvent) {
        if (this.disabled() || event.pointerType === 'touch' || !this.openOnHover()) {
            return;
        }

        this.rootContext.cancelHoverClose();
        this.rootContext.openOnHover(this.item.value(), this.elementRef.nativeElement, event);
    }

    protected onPointerLeave(event: PointerEvent) {
        this.pressed.set(false);

        if (event.pointerType === 'touch' || !this.openOnHover()) {
            return;
        }

        this.rootContext.cancelHoverOpen();
    }

    protected onKeydown(event: KeyboardEvent) {
        if (this.disabled() || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        // Opening preserves the trigger's focus, including native Enter/Space clicks. Tab enters
        // this item's content in logical order even when the panel is portaled after the root list.
        if (event.key === TAB && !event.shiftKey && this.open()) {
            event.preventDefault();
            event.stopPropagation();
            this.focusContent();
            return;
        }

        if (this.rootContext.nested) {
            return;
        }

        if (event.key === this.entryKey()) {
            event.preventDefault();

            if (!this.open()) {
                this.rootContext.open(this.item.value(), this.elementRef.nativeElement, 'list-navigation', event);
            }
        }
    }

    /** The key that opens the panel while retaining trigger focus, based on orientation/dir. */
    private entryKey(): string {
        if (this.rootContext.orientation() === 'horizontal') {
            return ARROW_DOWN;
        }

        return this.rootContext.dir() === 'rtl' ? ARROW_LEFT : ARROW_RIGHT;
    }

    private focusContent() {
        // Content is rendered into the shared popup, which mounts through Presence + Portal and is
        // then positioned asynchronously by floating-ui. Until it is positioned the popper keeps it
        // `visibility: hidden`, so its tabbables aren't focusable yet. Poll across animation frames
        // until focus actually lands inside the panel (don't give up just because the element exists).
        const contentId = this.item.contentId();
        const origin = this.document.activeElement;
        let attempts = 0;

        const tryFocus = () => {
            // Positioning may take several frames. A later Tab/click/focus move owns focus now;
            // a stale entry request must not pull it back into a panel (or a destroyed view).
            if (this.destroyRef.destroyed || !this.open() || this.document.activeElement !== origin) {
                return;
            }

            const content = this.document.getElementById(contentId);
            const candidates = content ? getTabbableCandidates(content) : [];

            if (candidates.length && focusFirst(candidates)) {
                return;
            }

            if (attempts++ < 15) {
                requestAnimationFrame(tryFocus);
            } else if (content) {
                // Fallback: no tabbable content — focus the panel container itself.
                content.focus();
            }
        };

        requestAnimationFrame(tryFocus);
    }
}
