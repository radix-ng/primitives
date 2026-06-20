import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input, Signal } from '@angular/core';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { BooleanInput, createContext } from '@radix-ng/primitives/core';
import { injectRadioRootContext } from './radio-root.directive';

export interface RadioItemContext {
    value: Signal<string>;
    checkedState: Signal<boolean>;
    disabledState: Signal<boolean>;
    readonlyState: Signal<boolean>;
    requiredState: Signal<boolean>;
}

const itemContext = (): RadioItemContext => {
    const item = inject(RdxRadioItemDirective);

    return {
        value: item.value,
        checkedState: item.checkedState,
        disabledState: item.disabledState,
        readonlyState: item.readonlyState,
        requiredState: item.requiredState
    };
};

export const [injectRadioItemContext, provideRadioItemContext] = createContext<RadioItemContext>(
    'RadioItemContext',
    'components/radio'
);

@Directive({
    selector: '[rdxRadioItem]',
    exportAs: 'rdxRadioItem',
    providers: [provideRadioItemContext(itemContext)],
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
        '(click)': 'onClick($event)',
        '(keydown)': 'onKeyDown($event)',
        '(keyup)': 'onKeyUp()',
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

    private readonly ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const;

    constructor() {
        effect(() => {
            this.compositeItem.setMetadata({
                disabled: this.disabledState(),
                value: this.value()
            });
        });
    }

    /** @ignore */
    onClick(event?: Event) {
        if (!this.disabledState() && !this.readonlyState()) {
            this.rootContext.select(this.value(), event);
        }
    }

    /** @ignore */
    onKeyDown(event: Event): void {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key === ' ') {
            this.onClick(keyEvent);
            return;
        }

        if (keyEvent.key === 'Enter') {
            keyEvent.preventDefault();
            return;
        }

        if (this.isAllowedArrowKey(keyEvent.key)) {
            this.rootContext.setArrowNavigation(true);
        }
    }

    /** @ignore */
    onKeyUp() {
        this.rootContext.setArrowNavigation(false);
    }

    /** @ignore */
    onFocus(event?: FocusEvent) {
        queueMicrotask(() => {
            if (this.rootContext.isArrowNavigation()) {
                this.rootContext.select(this.value(), event);
                this.rootContext.setArrowNavigation(false);
            }
        });
    }

    private isAllowedArrowKey(key: string): boolean {
        return (this.ARROW_KEYS as readonly string[]).includes(key);
    }
}
