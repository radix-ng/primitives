import { RdxNavigationMenuItem } from './navigation-menu-item';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';
import { focusFirst, getTabbableCandidates } from './utils';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    signal,
    untracked
} from '@angular/core';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ENTER, injectDocument, SPACE } from '@radix-ng/primitives/core';

/**
 * A button that opens its item's content in the shared popup.
 */
@Directive({
    selector: 'button[rdxNavigationMenuTrigger]',
    hostDirectives: [RdxCompositeItem],
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
        if (this.disabled()) {
            return;
        }

        const entryKey = this.entryKey();

        if (event.key === ENTER || event.key === SPACE) {
            event.preventDefault();
            this.rootContext.toggle(this.item.value(), this.elementRef.nativeElement, event);

            if (this.open()) {
                this.focusContent();
            }

            return;
        }

        if (this.rootContext.nested) {
            return;
        }

        if (event.key === entryKey) {
            event.preventDefault();

            if (!this.open()) {
                this.rootContext.open(this.item.value(), this.elementRef.nativeElement, 'list-navigation', event);
            }

            this.focusContent();
        }
    }

    /** The key that moves focus from the trigger into the open content, based on orientation/dir. */
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
        let attempts = 0;

        const tryFocus = () => {
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
