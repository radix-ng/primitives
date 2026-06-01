import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

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
            return undefined;
        }
        return this.disabled() && !this.focusableWhenDisabled() ? -1 : 0;
    });

    constructor() {
        const element = this.elementRef.nativeElement;

        // Capture-phase listeners registered here run before any consumer
        // `(click)`/`(keydown)` binding on the same element, so a disabled
        // button reliably suppresses activation (the native `disabled`
        // attribute can't be used when the control must stay focusable).
        const onClick = (event: MouseEvent): void => this.handleClick(event);
        const onKeydown = (event: KeyboardEvent): void => this.handleKeydown(event);

        element.addEventListener('click', onClick, true);
        element.addEventListener('keydown', onKeydown, true);

        inject(DestroyRef).onDestroy(() => {
            element.removeEventListener('click', onClick, true);
            element.removeEventListener('keydown', onKeydown, true);
        });
    }

    private handleClick(event: MouseEvent): void {
        if (this.disabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    private handleKeydown(event: KeyboardEvent): void {
        const isActivationKey = event.key === 'Enter' || event.key === ' ';
        if (!isActivationKey) {
            return;
        }

        if (this.disabled()) {
            // Native buttons fire a click on Enter/Space; the capture click
            // handler stops it. Non-button hosts never do, so just block here.
            event.preventDefault();
            if (!this.isNativeButton()) {
                event.stopImmediatePropagation();
            }
            return;
        }

        // Non-button hosts have no native activation; synthesize a click.
        // Space must not scroll the page.
        if (!this.isNativeButton()) {
            event.preventDefault();
            this.elementRef.nativeElement.click();
        }
    }
}
