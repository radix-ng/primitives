import { booleanAttribute, computed, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { BooleanInput, dispatchClickWithModifiers } from '@radix-ng/primitives/core';

export type RdxButtonType = 'button' | 'submit' | 'reset';

export interface RdxButtonProps {
    /**
     * Whether the button is disabled.
     * @defaultValue false
     */
    disabled?: boolean;

    /**
     * Whether the button should remain focusable when disabled. When `true`,
     * the disabled state is expressed with `aria-disabled` (instead of the
     * native `disabled` attribute) so the control stays in the tab order while
     * its activation is suppressed.
     * @defaultValue false
     */
    focusableWhenDisabled?: boolean;

    /**
     * The `type` attribute applied to native `<button>` hosts.
     * @defaultValue 'button'
     */
    type?: RdxButtonType;
}

/**
 * Headless button behavior, modeled on Base UI's `useButton`.
 *
 * Renders accessible button semantics on a native `<button>` or on any other
 * element (e.g. `<a>`, `<span>`). Carries no styles — state is exposed via
 * `data-disabled` for consumers to style.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxButton]',
    exportAs: 'rdxButton',
    host: {
        '[attr.data-disabled]': 'disabled() ? "" : undefined',

        // Native disabled only when we do NOT need it focusable; otherwise we
        // keep it focusable and express the state via aria-disabled below.
        '[attr.disabled]': 'isNativeButton() && disabled() && !focusableWhenDisabled() ? "" : undefined',
        '[attr.aria-disabled]': 'ariaDisabled()',

        // Native buttons get their type; non-button hosts get button semantics.
        '[attr.type]': 'isNativeButton() ? type() : undefined',
        '[attr.role]': 'isNativeButton() ? undefined : "button"',
        '[attr.tabindex]': 'tabIndex()'
    }
})
export class RdxButtonDirective {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    /**
     * Whether the button is disabled.
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Keep the button focusable while disabled (uses `aria-disabled`).
     * @group Props
     */
    readonly focusableWhenDisabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The `type` attribute applied to native `<button>` hosts.
     * @group Props
     */
    readonly type = input<RdxButtonType>('button');

    /**
     * @ignore
     */
    protected readonly isNativeButton = computed(() => this.elementRef.nativeElement.tagName === 'BUTTON');

    /**
     * @ignore
     * Express disabled via `aria-disabled` on non-button hosts, or whenever the
     * control must stay focusable.
     */
    protected readonly ariaDisabled = computed(() => {
        if (!this.disabled()) {
            return undefined;
        }
        return !this.isNativeButton() || this.focusableWhenDisabled() ? 'true' : undefined;
    });

    /**
     * @ignore
     */
    protected readonly tabIndex = computed(() => {
        if (this.isNativeButton()) {
            // Explicit tabindex also opts native buttons into Safari's keyboard tab order.
            return 0;
        }
        return this.disabled() && !this.focusableWhenDisabled() ? -1 : 0;
    });

    constructor() {
        const element = this.elementRef.nativeElement;

        // Capture click suppression before consumer bindings, including on aria-disabled hosts.
        const onClick = (event: MouseEvent): void => this.handleClick(event);
        const onKeydown = (event: KeyboardEvent): void => this.handleKeydown(event);
        const onKeyup = (event: KeyboardEvent): void => this.handleKeyup(event);
        const onPointerdown = (event: PointerEvent): void => {
            // A disabled press must not blur the previously focused element.
            if (this.disabled()) event.preventDefault();
        };

        element.addEventListener('click', onClick, true);
        element.addEventListener('keydown', onKeydown, true);
        element.addEventListener('keyup', onKeyup, true);
        element.addEventListener('pointerdown', onPointerdown, true);

        inject(DestroyRef).onDestroy(() => {
            element.removeEventListener('click', onClick, true);
            element.removeEventListener('keydown', onKeydown, true);
            element.removeEventListener('keyup', onKeyup, true);
            element.removeEventListener('pointerdown', onPointerdown, true);
        });
    }

    private handleClick(event: MouseEvent): void {
        if (this.disabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (this.disabled()) {
            if (this.focusableWhenDisabled() && event.key !== 'Tab') event.preventDefault();
            return;
        }

        if (this.isNativeButton() || event.target !== event.currentTarget) return;

        const element = this.elementRef.nativeElement;
        const isLink = element.tagName === 'A' && !!(element as HTMLAnchorElement).href;
        if (event.key === ' ') {
            // Standalone buttons activate Space on release. Suppress its scrolling default.
            event.preventDefault();
            return;
        }

        // A valid link already receives its own trusted Enter click from the browser.
        if (event.key === 'Enter' && !isLink && !event.defaultPrevented) {
            event.preventDefault();
            dispatchClickWithModifiers(element, event);
        }
    }

    private handleKeyup(event: KeyboardEvent): void {
        if (
            this.disabled() ||
            this.isNativeButton() ||
            event.target !== event.currentTarget ||
            event.defaultPrevented ||
            event.key !== ' '
        )
            return;

        // Like the pin, standalone non-native hosts do not retain a keydown cancellation flag.
        dispatchClickWithModifiers(this.elementRef.nativeElement, event);
    }
}
