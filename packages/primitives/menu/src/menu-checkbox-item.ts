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
    signal,
    Signal
} from '@angular/core';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import { BooleanInput, createContext } from '@radix-ng/primitives/core';
import { injectRdxMenuRootContext } from './menu-root';
import { CheckedState, getCheckedState, isIndeterminate } from './menu-utils';

export interface RdxMenuCheckboxItemContext {
    checked: Signal<CheckedState>;
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
        '[attr.data-state]': 'getCheckedState(checked())',
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

    /** Emits when the checked state changes. */
    readonly onCheckedChange = output<CheckedState>();

    protected readonly highlighted = computed(
        () => this.rootContext?.activeIndex() === this.listItem.index() || this.isFocused()
    );
    protected readonly effectiveDisabled = computed(() => this.disabled() || (this.rootContext?.disabled() ?? false));

    // Expose helpers for host bindings
    protected readonly isIndeterminate = isIndeterminate;
    protected readonly getCheckedState = getCheckedState;

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
        this.toggleChecked();
        if (this.closeOnClick()) this.rootContext?.closeEntireMenu();
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
        this.toggleChecked();
        if (this.closeOnClick()) this.rootContext?.closeEntireMenu();
    }

    private toggleChecked(): void {
        const next = isIndeterminate(this.checked()) ? true : !this.checked();
        this.checked.set(next);
        this.onCheckedChange.emit(next);
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
