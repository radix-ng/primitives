import { injectRdxMenuRootContext } from './menu-root';
import { CheckedState, isIndeterminate } from './menu-utils';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    output,
    Signal,
    signal
} from '@angular/core';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    RdxCancelableChangeEventDetails
} from '@radix-ng/primitives/core';

export interface RdxMenuCheckboxItemContext {
    checked: Signal<CheckedState>;
}

/** Payload of {@link RdxMenuCheckboxItem.onCheckedChange} — cancelable via `eventDetails.cancel()`. */
export interface RdxMenuCheckboxChangeEvent {
    checked: CheckedState;
    eventDetails: RdxCancelableChangeEventDetails<'none'>;
}

export const [injectRdxMenuCheckboxItemContext, provideRdxMenuCheckboxItemContext] =
    createContext<RdxMenuCheckboxItemContext>('RdxMenuCheckboxItemContext', 'components/menu');

const checkboxItemContextFactory = (): RdxMenuCheckboxItemContext => {
    const instance = inject(RdxMenuCheckboxItem);
    return {
        checked: instance.checked
    };
};

/**
 * A menu item that can be checked or unchecked.
 */
@Directive({
    selector: '[rdxMenuCheckboxItem]',
    exportAs: 'rdxMenuCheckboxItem',
    providers: [provideRdxMenuCheckboxItemContext(checkboxItemContextFactory)],
    hostDirectives: [RdxCompositeListItem],
    host: {
        role: 'menuitemcheckbox',
        '[attr.tabindex]': 'rootContext?.isOpen() && highlighted() ? 0 : -1',
        '[attr.aria-checked]': 'isIndeterminate(checked()) ? "mixed" : checked()',
        '[attr.data-checked]': 'checked() === true ? "" : undefined',
        '[attr.data-unchecked]': 'checked() === false ? "" : undefined',
        '[attr.data-indeterminate]': 'isIndeterminate(checked()) ? "" : undefined',
        '[attr.data-disabled]': 'effectiveDisabled() ? "" : undefined',
        '[attr.aria-disabled]': 'effectiveDisabled() ? true : undefined',
        '[attr.data-highlighted]': 'highlighted() ? "" : undefined',
        '[attr.data-label]': 'label() ?? undefined',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(pointermove)': 'onPointerMove($event)',
        '(pointerleave)': 'onPointerLeave($event)',
        '(mouseup)': 'onMouseUp($event)',
        '(click)': 'onItemClick()',
        '(keydown.enter)': 'onActivate($event)',
        '(keydown.space)': 'onActivate($event)'
    }
})
export class RdxMenuCheckboxItem {
    protected readonly rootContext = injectRdxMenuRootContext(true);
    private readonly listItem = inject(RdxCompositeListItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly isFocused = signal(false);

    /** Whether this item is disabled. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether toggling closes the menu. Defaults to false — checkbox items stay open. */
    readonly closeOnClick = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Explicit typeahead label. When set, overrides textContent for character search. */
    readonly label = input<string | undefined>(undefined);

    /** The checked state of the item. */
    readonly checked = model<CheckedState>(false);

    /** Emits before the checked state changes; call `eventDetails.cancel()` to veto it. */
    readonly onCheckedChange = output<RdxMenuCheckboxChangeEvent>();

    protected readonly highlighted = computed(
        () => this.rootContext?.activeIndex() === this.listItem.index() || this.isFocused()
    );
    protected readonly effectiveDisabled = computed(() => this.disabled() || (this.rootContext?.disabled() ?? false));

    // Expose helpers for host bindings
    protected readonly isIndeterminate = isIndeterminate;

    constructor() {
        effect(() => {
            this.listItem.setMetadata({
                type: 'checkbox-item',
                disabled: this.effectiveDisabled(),
                label: this.label()
            });
        });
    }

    onFocus(): void {
        if (!this.rootContext?.disabled()) {
            this.isFocused.set(true);
        }
        this.setActiveIndex();
    }

    onBlur(): void {
        this.isFocused.set(false);
        this.clearActiveIndex();
    }

    onPointerMove(event: PointerEvent): void {
        if (event.defaultPrevented || event.pointerType !== 'mouse' || this.effectiveDisabled()) {
            return;
        }
        if (this.rootContext && !this.rootContext.highlightItemOnHover()) {
            return;
        }
        this.setActiveIndex();
        if (this.elementRef.nativeElement.ownerDocument.activeElement !== this.elementRef.nativeElement) {
            this.elementRef.nativeElement.focus({ preventScroll: true });
        }
    }

    onPointerLeave(event: PointerEvent): void {
        if (event.pointerType !== 'mouse') {
            return;
        }
        if (this.elementRef.nativeElement.ownerDocument.activeElement === this.elementRef.nativeElement) {
            this.isFocused.set(false);
            this.clearActiveIndex();
            this.elementRef.nativeElement.closest<HTMLElement>('[rdxMenuPopup]')?.focus({ preventScroll: true });
        }
    }

    onItemClick(): void {
        if (this.effectiveDisabled()) return;
        if (this.toggleChecked() && this.closeOnClick()) {
            this.rootContext?.closeEntireMenu();
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.effectiveDisabled() || event.button !== 0 || !this.rootContext?.allowMouseUpTrigger()) {
            return;
        }

        this.rootContext.setAllowMouseUpTrigger(false);
        this.elementRef.nativeElement.click();
    }

    protected onActivate(event: Event): void {
        if (this.effectiveDisabled()) return;
        event.preventDefault();
        if (this.toggleChecked(event) && this.closeOnClick()) {
            this.rootContext?.closeEntireMenu();
        }
    }

    /** Emits the cancelable change, applies it unless vetoed, and reports whether it was applied. */
    private toggleChecked(event?: Event): boolean {
        const next = isIndeterminate(this.checked()) ? true : !this.checked();
        const { eventDetails } = createCancelableChangeEventDetails('none', event ?? new Event('menu.checked-change'));
        this.onCheckedChange.emit({ checked: next, eventDetails });

        if (eventDetails.isCanceled()) {
            return false;
        }

        this.checked.set(next);
        return true;
    }

    private setActiveIndex(): void {
        if (!this.rootContext || this.rootContext.disabled()) {
            return;
        }

        const index = this.listItem.index();
        if (index !== -1) {
            this.rootContext.setActiveIndex(index);
        }
    }

    private clearActiveIndex(): void {
        if (this.rootContext?.activeIndex() === this.listItem.index()) {
            this.rootContext.setActiveIndex(null);
        }
    }
}
