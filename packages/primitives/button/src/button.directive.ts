import { booleanAttribute, computed, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { injectRdxCompositeRootContext, RdxCompositeItem } from '@radix-ng/primitives/composite';
import {
    BooleanInput,
    coerceTabIndex,
    dispatchClickWithModifiers,
    injectTabIndexAttribute,
    NumberInput
} from '@radix-ng/primitives/core';
import { RDX_BUTTON_CONFIG } from './button-config';

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

    /** The authored ARIA role. `null` removes the explicit role. */
    role?: string | null;

    /** The authored tab order. `null` removes the tabindex attribute. */
    tabIndex?: number | null;
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
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',

        // Native disabled only when we do NOT need it focusable; otherwise we
        // keep it focusable and express the state via aria-disabled below.
        '[attr.disabled]': 'isNativeButton() && isDisabled() && !isFocusableWhenDisabled() ? "" : undefined',
        '[attr.aria-disabled]': 'ariaDisabled()',

        // Native buttons get their type; non-button hosts get button semantics.
        '[attr.type]': 'isNativeButton() ? type() : undefined',
        '[attr.role]': 'role() !== undefined ? role() : isNativeButton() ? undefined : "button"',
        '[attr.tabindex]': 'hostTabIndex()'
    }
})
export class RdxButtonDirective {
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly config = inject(RDX_BUTTON_CONFIG, { self: true, optional: true });
    private readonly compositeItem = inject(RdxCompositeItem, { self: true, optional: true });
    private readonly compositeRoot = injectRdxCompositeRootContext(true);
    private readonly isComposite = !!this.compositeItem || !!this.compositeRoot;

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
     * The authored ARIA role. `null` removes the attribute; `undefined` restores the default.
     * @group Props
     */
    readonly role = input<string | null | undefined>(undefined);

    /**
     * The authored tab order, overriding disabled and composite defaults.
     * `null` removes the attribute; `undefined` restores the default.
     * @defaultValue undefined
     * @group Props
     */
    readonly tabIndex = input<number | null | undefined, NumberInput>(injectTabIndexAttribute(), {
        transform: coerceTabIndex
    });

    /** @ignore */
    protected readonly isDisabled = computed(() => this.disabled() || (this.config?.disabled() ?? false));

    /** @ignore */
    protected readonly isFocusableWhenDisabled = computed(
        () => this.config?.focusableWhenDisabled() ?? this.focusableWhenDisabled()
    );

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
        if (!this.isDisabled()) {
            return undefined;
        }
        return !this.isNativeButton() || this.isFocusableWhenDisabled() ? 'true' : undefined;
    });

    /**
     * @ignore
     */
    protected readonly hostTabIndex = computed(() => {
        const authored = this.tabIndex();
        if (authored !== undefined) return authored;
        if (this.compositeItem) return this.compositeItem.tabIndex();
        if (this.isComposite) return undefined;
        if (this.isNativeButton()) {
            // Explicit tabindex also opts native buttons into Safari's keyboard tab order.
            return 0;
        }
        return this.isDisabled() && !this.isFocusableWhenDisabled() ? -1 : 0;
    });

    constructor() {
        const element = this.elementRef.nativeElement;

        // Capture click suppression before consumer bindings, including on aria-disabled hosts.
        const onClick = (event: MouseEvent): void => this.handleClick(event);
        const onKeydown = (event: KeyboardEvent): void => this.handleKeydown(event);
        const onKeyup = (event: KeyboardEvent): void => this.handleKeyup(event);
        // At capture time, move our bubble listener after the host's current consumer listeners.
        // This keeps activation synchronous while allowing later template/DOM handlers to cancel it.
        const prepareKeydown = (): void => {
            element.removeEventListener('keydown', onKeydown);
            element.addEventListener('keydown', onKeydown);
        };
        const prepareKeyup = (): void => {
            element.removeEventListener('keyup', onKeyup);
            element.addEventListener('keyup', onKeyup);
        };
        const onPointerdown = (event: PointerEvent): void => {
            // A disabled press must not blur the previously focused element.
            if (this.isDisabled()) event.preventDefault();
        };

        element.addEventListener('click', onClick, true);
        element.addEventListener('keydown', prepareKeydown, true);
        element.addEventListener('keyup', prepareKeyup, true);
        element.addEventListener('pointerdown', onPointerdown, true);

        inject(DestroyRef).onDestroy(() => {
            element.removeEventListener('click', onClick, true);
            element.removeEventListener('keydown', prepareKeydown, true);
            element.removeEventListener('keyup', prepareKeyup, true);
            element.removeEventListener('keydown', onKeydown);
            element.removeEventListener('keyup', onKeyup);
            element.removeEventListener('pointerdown', onPointerdown, true);
        });
    }

    private handleClick(event: MouseEvent): void {
        if (this.isDisabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (this.isDisabled()) {
            if (this.isFocusableWhenDisabled() && event.key !== 'Tab') event.preventDefault();
            return;
        }

        if (event.target !== event.currentTarget) return;

        if (this.isComposite && event.key === ' ') {
            const role = this.elementRef.nativeElement.getAttribute('role');
            const textNavigation = role?.startsWith('menuitem') || role === 'option' || role === 'gridcell';
            if (event.defaultPrevented && textNavigation) return;
            event.preventDefault();
            dispatchClickWithModifiers(this.elementRef.nativeElement, event);
            return;
        }

        if (this.isNativeButton()) return;

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
        if (this.isDisabled() || event.target !== event.currentTarget) return;

        if (this.isComposite) {
            // Composite Space already dispatched on keydown; cancel the native button's keyup click.
            if (this.isNativeButton() && event.key === ' ') event.preventDefault();
            return;
        }

        if (this.isNativeButton() || event.defaultPrevented || event.key !== ' ') return;

        // Like the pin, standalone non-native hosts do not retain a keydown cancellation flag.
        dispatchClickWithModifiers(this.elementRef.nativeElement, event);
    }
}
