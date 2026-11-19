import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    signal,
    Signal
} from '@angular/core';
import { RdxButtonBehavior } from '@radix-ng/primitives/button';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { BooleanInput, createContext, injectId, type RdxNativeInputRef } from '@radix-ng/primitives/core';
import { injectFieldRootContext, type RdxFieldRootContext } from '@radix-ng/primitives/field';
import { radioDescribedBy, type RadioItemRegistration, type RadioNativeInput } from './radio-field';
import { useRadioInputRef } from './radio-input-ref';
import { injectRadioRootContext } from './radio-root.directive';

export interface RadioItemContext {
    id: Signal<string>;
    field: RdxFieldRootContext | null;
    value: Signal<unknown>;
    checkedState: Signal<boolean>;
    disabledState: Signal<boolean>;
    readonlyState: Signal<boolean>;
    requiredState: Signal<boolean>;
    registerNativeInput(input: RadioNativeInput): () => void;
    focus(): void;
    requestSelection(event?: Event): boolean;
}

const itemContext = (): RadioItemContext => {
    const item = inject(RdxRadioItemDirective);

    return {
        id: item.id,
        field: item.field,
        value: item.value,
        checkedState: item.checkedState,
        disabledState: item.disabledState,
        readonlyState: item.readonlyState,
        requiredState: item.requiredState,
        registerNativeInput: (input) => item.registerNativeInput(input),
        focus: () => item.focus(),
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
        '[attr.id]': 'id()',
        '[attr.type]': 'isNativeButton ? "button" : undefined',
        role: 'radio',
        '[attr.aria-labelledby]': 'ariaLabelledBy() ?? itemField?.labelId()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.aria-invalid]': 'field?.invalidState() ? "true" : undefined',
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
        '[attr.data-valid]': 'field?.validState() === true ? "" : undefined',
        '[attr.data-invalid]': 'field?.validState() === false ? "" : undefined',
        '[attr.data-touched]': 'field?.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'field?.dirtyState() ? "" : undefined',
        '[attr.data-filled]': 'field?.filledState() ? "" : undefined',
        '[attr.data-focused]': 'field?.focusedState() ? "" : undefined',
        '[attr.disabled]': 'isNativeButton && disabledState() ? "" : undefined',
        '[attr.tabindex]': 'radioTabIndex()',
        '(click)': 'handleClick($event)',
        '(keydown)': 'onKeyDown($event)',
        '(focus)': 'onFocus($event)'
    }
})
export class RdxRadioItemDirective<Value = string> {
    private readonly rootContext = injectRadioRootContext();
    private readonly compositeItem = inject(RdxCompositeItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly nativeInputRegistration = signal<RadioNativeInput | null>(null);

    /** The authored native radio input, when present. */
    readonly nativeInput = computed(() => this.nativeInputRegistration()?.element ?? null);

    /** Called with the item's authored input after rendering and released when it detaches. */
    readonly inputRef = input<RdxNativeInputRef>();
    /** @ignore Field.Item can scope an individual radio's associations. */
    readonly field = injectFieldRootContext(true);
    protected readonly itemField = this.field === this.rootContext.field ? null : this.field;

    readonly value = input.required<Value>();

    readonly id = input(injectId('rdx-radio-item-'));

    /** Override the accessible label supplied by Field.Item. */
    readonly ariaLabelledBy = input<string>(undefined, { alias: 'aria-labelledby' });

    /** Additional description IDs. Group and item Field descriptions are appended automatically. */
    readonly ariaDescribedBy = input<string>(undefined, { alias: 'aria-describedby' });

    protected readonly describedBy = computed(() =>
        radioDescribedBy(this.ariaDescribedBy(), this.rootContext.field, this.itemField)
    );

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

    readonly disabledState = computed(
        () => this.rootContext.disabledState() || this.disabled() || Boolean(this.itemField?.disabledState())
    );

    readonly readonlyState = computed(() => this.rootContext.readonly() || this.readonly());

    readonly requiredState = computed(() => this.rootContext.required() || this.required());

    readonly checkedState = computed(() => {
        const value = this.value();
        return value != null && this.rootContext.value() === value;
    });

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
        this.compositeItem.setMetadata({
            radio: {
                value: this.value,
                disabled: this.disabledState,
                nativeInput: this.nativeInputRegistration
            } satisfies RadioItemRegistration
        });

        const field = this.itemField;
        if (field)
            effect(() =>
                field.setControlId(
                    this.isNativeButton ? this.id() : (this.nativeInputRegistration()?.id() ?? this.id())
                )
            );

        useRadioInputRef(this.nativeInput, this.inputRef);

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

    /** @ignore Native controls belong to the item they mirror. */
    registerNativeInput(input: RadioNativeInput): () => void {
        this.nativeInputRegistration.set(input);
        return () => {
            if (this.nativeInputRegistration() === input) this.nativeInputRegistration.set(null);
        };
    }

    /** @ignore Redirect native label and validation focus to the visible radio. */
    focus(): void {
        if (!this.disabledState()) this.elementRef.nativeElement.focus();
    }

    /** @ignore */
    requestSelection(event?: Event): boolean {
        if (this.disabledState() || this.readonlyState()) return false;
        const value = this.value();
        if (value == null) return false;
        return this.rootContext.select(value, event, 'none', this.elementRef.nativeElement);
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
