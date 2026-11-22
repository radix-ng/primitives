import { DestroyRef, ElementRef, inject, Injectable, Signal } from '@angular/core';
import { injectRdxCompositeRootContext, RdxCompositeItem } from '@radix-ng/primitives/composite';
import { dispatchClickWithModifiers } from '@radix-ng/primitives/core';

const handledKeydowns = new WeakSet<Event>();

/** @internal A composed trigger has already handled this keydown's activation. */
export function preventRdxButtonActivation(event: Event): void {
    handledKeydowns.add(event);
}

/** @internal Shared by Button and Toolbar.Button on one element. */
export interface RdxButtonBehaviorConfig {
    disabled: Signal<boolean>;
    focusableWhenDisabled: Signal<boolean>;
    native: Signal<boolean>;
    /** Override composite activation without changing how the host participates in navigation. */
    compositeActivation?: boolean;
}

type ButtonOwner = 'button' | 'toolbar' | 'radio' | 'toggle';

/**
 * @internal A single set of DOM handlers per button host. Exported for coordination between
 * secondary entry points; this helper has no semver stability guarantee.
 */
@Injectable()
export class RdxButtonBehavior {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly compositeItem = inject(RdxCompositeItem, { self: true, optional: true });
    private readonly compositeRoot = injectRdxCompositeRootContext(true);
    private readonly isComposite = !!this.compositeItem || !!this.compositeRoot;
    private config?: RdxButtonBehaviorConfig;
    private owner?: ButtonOwner;
    private renderedAriaDisabled?: Signal<'true' | undefined>;
    private readonly isDisabled = () => this.config?.disabled() ?? false;
    private readonly isFocusableWhenDisabled = () => this.config?.focusableWhenDisabled() ?? false;
    private readonly isNativeButton = () => this.config?.native() ?? this.elementRef.nativeElement.tagName === 'BUTTON';

    get hasRenderedButton(): boolean {
        return this.owner === 'button' || !!this.renderedAriaDisabled;
    }

    /** A composed primitive consumes disabled props and owns the resulting ARIA state. */
    registerRenderedButton(ariaDisabled: Signal<'true' | undefined>): void {
        this.renderedAriaDisabled = ariaDisabled;
    }

    resolveAriaDisabled(fallback: 'true' | undefined): 'true' | undefined {
        return this.renderedAriaDisabled ? this.renderedAriaDisabled() : fallback;
    }

    configure(config: RdxButtonBehaviorConfig, owner: ButtonOwner): void {
        if (owner === 'button' || this.owner !== 'button') {
            this.config = config;
            this.owner = owner;
        }
    }

    constructor() {
        const element = this.elementRef.nativeElement;

        // Capture click suppression before consumer bindings, including on aria-disabled hosts.
        const onClick = (event: MouseEvent): void => this.handleClick(event);
        const onKeydown = (event: KeyboardEvent): void => this.handleKeydown(event);
        const onKeyup = (event: KeyboardEvent): void => this.handleKeyup(event);
        // At capture time, move our bubble listener after the host's current consumer listeners.
        // This keeps activation synchronous while allowing later template/DOM handlers to cancel it.
        const prepareKeydown = (event: KeyboardEvent): void => {
            if (this.isDisabled()) {
                if (this.isFocusableWhenDisabled() && event.key !== 'Tab') event.preventDefault();
                // Suppress the host's consumer handlers while preserving its owned roving navigation.
                if (this.compositeItem) this.compositeItem.relayKeyboardEvent(event);
                else this.compositeRoot?.relayKeyboardEvent(event);
                event.stopImmediatePropagation();
                return;
            }
            element.removeEventListener('keydown', onKeydown);
            element.addEventListener('keydown', onKeydown);
        };
        const prepareKeyup = (event: KeyboardEvent): void => {
            if (this.isDisabled()) {
                event.stopImmediatePropagation();
                return;
            }
            element.removeEventListener('keyup', onKeyup);
            element.addEventListener('keyup', onKeyup);
        };
        const onPointerdown = (event: PointerEvent): void => {
            // A disabled press must not blur the previously focused element.
            if (this.isDisabled()) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        };

        const onMousedown = (event: MouseEvent): void => {
            if (this.isDisabled()) event.stopImmediatePropagation();
        };
        element.addEventListener('mousedown', onMousedown, true);
        element.addEventListener('click', onClick, true);
        element.addEventListener('keydown', prepareKeydown, true);
        element.addEventListener('keyup', prepareKeyup, true);
        element.addEventListener('pointerdown', onPointerdown, true);

        inject(DestroyRef).onDestroy(() => {
            element.removeEventListener('mousedown', onMousedown, true);
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

        if (handledKeydowns.has(event)) return;
        if (event.target !== event.currentTarget) return;

        if ((this.config?.compositeActivation ?? this.isComposite) && event.key === ' ') {
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

        if (this.config?.compositeActivation ?? this.isComposite) {
            // Composite Space already dispatched on keydown; cancel the native button's keyup click.
            if (this.isNativeButton() && event.key === ' ') event.preventDefault();
            return;
        }

        if (this.isNativeButton() || event.defaultPrevented || event.key !== ' ') return;

        // Like the pin, standalone non-native hosts do not retain a keydown cancellation flag.
        dispatchClickWithModifiers(this.elementRef.nativeElement, event);
    }
}
