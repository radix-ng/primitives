import { booleanAttribute, computed, Directive, ElementRef, inject, input, Signal } from '@angular/core';
import { RdxButtonBehavior } from '@radix-ng/primitives/button';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { BooleanInput, createContext } from '@radix-ng/primitives/core';
import { injectRadioRootContext } from './radio-root.directive';

export interface RadioItemContext {
    value: Signal<string>;
    checkedState: Signal<boolean>;
    disabledState: Signal<boolean>;
    readonlyState: Signal<boolean>;
    requiredState: Signal<boolean>;
    requestSelection(event?: Event): boolean;
}

const itemContext = (): RadioItemContext => {
    const item = inject(RdxRadioItemDirective);

    return {
        value: item.value,
        checkedState: item.checkedState,
        disabledState: item.disabledState,
        readonlyState: item.readonlyState,
        requiredState: item.requiredState,
        requestSelection: (event) => item.requestSelection(event)
    };
};

export const [injectRadioItemContext, provideRadioItemContext] = createContext<RadioItemContext>(
    'RadioItemContext',
    'components/radio'
);

@Directive({
    selector: '[rdxRadioItem]',
    exportAs: 'rdxRadioItem',
    providers: [provideRadioItemContext(itemContext), RdxButtonBehavior],
    hostDirectives: [RdxCompositeItem],

    host: {
        '[attr.type]': 'isNativeButton ? "button" : undefined',
        role: 'radio',
        '[attr.aria-checked]': 'checkedState()',
        '[attr.aria-disabled]': 'disabledState() ? "true" : undefined',
        '[attr.aria-readonly]': 'readonlyState() ? "true" : undefined',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.data-composite-item-active]': 'checkedState() ? "" : undefined',
        '[attr.data-checked]': 'checkedState() ? "" : undefined',
        '[attr.data-unchecked]': '!checkedState() ? "" : undefined',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-readonly]': 'readonlyState() ? "" : undefined',
        '[attr.data-required]': 'requiredState() ? "" : undefined',
        '[attr.disabled]': 'isNativeButton && disabledState() ? "" : undefined',
        '[attr.tabindex]': 'radioTabIndex()',
        '(click)': 'handleClick($event)',
        '(keydown)': 'onKeyDown($event)',
        '(focus)': 'onFocus($event)'
    }
})
export class RdxRadioItemDirective {
    private readonly rootContext = injectRadioRootContext();
    private readonly compositeItem = inject(RdxCompositeItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly value = input.required<string>();

    readonly id = input<string>();

    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the user should be unable to select this radio button. Bound in templates as
     * `readOnly` (Base UI spelling); the TS member stays `readonly` for cross-primitive consistency.
     */
    readonly readonly = input<boolean, BooleanInput>(false, { alias: 'readOnly', transform: booleanAttribute });

    /**
     * Whether the host is a native `<button>`. Detected from the host tag (unlike Base UI's explicit
     * `nativeButton` prop, the rendered element is statically known in Angular templates), and used to
     * apply `type="button"` and the native `disabled` attribute.
     */
    protected readonly isNativeButton = this.elementRef.nativeElement.tagName === 'BUTTON';

    readonly disabledState = computed(() => this.rootContext.disabledState() || this.disabled());

    readonly readonlyState = computed(() => this.rootContext.readonly() || this.readonly());

    readonly requiredState = computed(() => this.rootContext.required() || this.required());

    readonly checkedState = computed(() => this.rootContext.value() === this.value());

    protected readonly radioTabIndex = computed(() => {
        const authored = this.compositeItem.tabIndexInput();
        if (authored !== undefined) return authored;
        if (this.compositeItem.tabIndex() === null) return null;
        if (this.rootContext.disabledState()) return -1;
        const index = this.compositeItem.index();
        // An aria-disabled current item keeps the roving stop. Arrows still skip disabled targets.
        return index !== -1 && this.rootContext.tabStopIndex() === index ? 0 : -1;
    });

    constructor() {
        inject(RdxButtonBehavior, { self: true }).configure(
            {
                disabled: this.disabledState,
                focusableWhenDisabled: computed(() => !this.isNativeButton && !this.rootContext.disabledState()),
                native: computed(() => this.isNativeButton),
                compositeActivation: false
            },
            'radio'
        );
    }

    /** @ignore */
    requestSelection(event?: Event): boolean {
        if (this.disabledState() || this.readonlyState()) return false;
        return this.rootContext.select(this.value(), event, 'none', this.elementRef.nativeElement);
    }

    protected handleClick(event: MouseEvent): void {
        this.requestSelection(event);
        // A non-labelable host click inside a wrapping label would also activate its native input.
        if (!this.isNativeButton && this.elementRef.nativeElement.closest('label')) event.preventDefault();
    }

    /** @ignore */
    protected onKeyDown(event: KeyboardEvent): void {
        if (event.target === this.elementRef.nativeElement && event.key === 'Enter') event.preventDefault();
    }

    /** @ignore */
    protected onFocus(event: FocusEvent): void {
        if (this.rootContext.isKeyboardFocus(this.elementRef.nativeElement)) this.requestSelection(event);
    }
}
