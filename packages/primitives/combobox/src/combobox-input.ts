import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input
} from '@angular/core';
import { BooleanInput, injectId } from '@radix-ng/primitives/core';
import { RdxDismissableLayerBranch } from '@radix-ng/primitives/dismissable-layer';
import { injectFieldRootContext } from '@radix-ng/primitives/field';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { injectComboboxRootContext } from './combobox-root';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * The combobox text input. Holds DOM focus at all times; the highlighted option is referenced via
 * `aria-activedescendant`. Integrates with Field for labeling, description, and validation state.
 *
 * @group Components
 */
@Directive({
    selector: 'input[rdxComboboxInput]',
    exportAs: 'rdxComboboxInput',
    hostDirectives: [RdxPopperAnchor, RdxDismissableLayerBranch],
    host: {
        role: 'combobox',
        autocomplete: 'off',
        'aria-autocomplete': 'list',
        '[attr.id]': 'id()',
        '[attr.aria-expanded]': 'rootContext.open()',
        '[attr.aria-controls]': 'rootContext.listId',
        '[attr.aria-labelledby]': 'rootContext.labelId()',
        '[attr.aria-activedescendant]': 'rootContext.activeId()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.aria-invalid]': 'invalidState() ? "true" : undefined',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.aria-disabled]': 'disabledState() ? "true" : undefined',
        '[attr.disabled]': 'disabledState() ? "" : undefined',
        '[attr.readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.required]': 'requiredState() ? "" : undefined',
        '[value]': 'rootContext.inputValue()',
        '[attr.data-popup-open]': 'dataAttr(rootContext.open())',
        '[attr.data-list-empty]': 'dataAttr(rootContext.visibleCount() === 0)',
        '[attr.data-placeholder]': 'dataAttr(isEmptyValue())',
        '[attr.data-invalid]': 'dataAttr(invalidState())',
        '[attr.data-valid]': 'dataAttr(!invalidState())',
        '[attr.data-disabled]': 'dataAttr(disabledState())',
        '[attr.data-required]': 'dataAttr(requiredState())',
        '[attr.data-filled]': 'dataAttr(filledState())',
        '[attr.data-focused]': 'dataAttr(focusedState())',
        '(input)': 'onInput($event)',
        '(click)': 'onClick()',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(keydown)': 'onKeydown($event)',
        '(compositionstart)': 'composing = true',
        '(compositionend)': 'onCompositionEnd($event)'
    }
})
export class RdxComboboxInput {
    protected readonly rootContext = injectComboboxRootContext();
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
    private readonly fieldRootContext = injectFieldRootContext(true);

    /** The input id; Field labels and descriptions reference it for accessible relationships. */
    readonly id = input(injectId('rdx-combobox-input-'));

    /** Marks the input as invalid independently of any Field state. */
    readonly invalid = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly invalidState = computed(() => this.invalid() || Boolean(this.fieldRootContext?.invalidState()));
    protected readonly disabledState = computed(
        () => this.rootContext.disabledState() || Boolean(this.fieldRootContext?.disabledState())
    );
    protected readonly requiredState = computed(
        () => this.rootContext.requiredState() || Boolean(this.fieldRootContext?.requiredState())
    );
    protected readonly filledState = computed(
        () => !this.isEmptyValue() || Boolean(this.fieldRootContext?.filledState())
    );
    protected readonly focusedState = computed(() => Boolean(this.fieldRootContext?.focusedState()));

    protected readonly isEmptyValue = computed(() => {
        const value = this.rootContext.value();
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        return value === null || value === undefined;
    });

    protected readonly describedBy = computed(() => {
        if (!this.fieldRootContext) {
            return undefined;
        }
        const ids = [
            ...this.fieldRootContext.descriptionIds(),
            ...(this.fieldRootContext.invalidState() ? this.fieldRootContext.errorIds() : [])
        ];
        return ids.length ? ids.join(' ') : undefined;
    });

    constructor() {
        this.rootContext.setInputElement(this.element);

        afterNextRender(() => {
            this.fieldRootContext?.setControlId(this.id());
        });

        inject(DestroyRef).onDestroy(() => {
            if (this.rootContext.inputElement() === this.element) {
                this.rootContext.setInputElement(null);
            }
        });
    }

    /** Whether an IME composition is in progress (CJK). While composing, don't filter or select. */
    protected composing = false;

    onInput(event: Event): void {
        // Defer filtering until the composition ends so intermediate IME text doesn't filter/select.
        if (this.composing || (event as InputEvent).isComposing) {
            return;
        }
        this.commitInput((event.target as HTMLInputElement).value);
    }

    onCompositionEnd(event: CompositionEvent): void {
        this.composing = false;
        this.commitInput((event.target as HTMLInputElement).value);
    }

    private commitInput(value: string): void {
        if (!this.rootContext.open()) {
            this.rootContext.openPopup();
        }
        // setInputValue applies any autoHighlight (deferred until items mount).
        this.rootContext.setInputValue(value);
    }

    onClick(): void {
        if (this.rootContext.openOnInputClick()) {
            this.rootContext.openForBrowse();
        }
    }

    onFocus(): void {
        this.fieldRootContext?.setFocused(true);
    }

    onBlur(): void {
        this.fieldRootContext?.setFocused(false);
        this.fieldRootContext?.setTouched(true);
    }

    onKeydown(event: KeyboardEvent): void {
        // Don't interfere with IME composition or text-editing shortcuts / range selection. Home/End
        // and Shift+Arrows must keep moving the caret, Ctrl/Meta combos stay browser shortcuts.
        if (event.isComposing || this.composing) {
            return;
        }
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
            return;
        }

        const open = this.rootContext.open();

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.rootContext.setKeyboardActive(true);
                if (!open) {
                    this.rootContext.openAndHighlight('first');
                } else {
                    this.rootContext.highlight.next();
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.rootContext.setKeyboardActive(true);
                if (!open) {
                    this.rootContext.openAndHighlight('last');
                } else {
                    this.rootContext.highlight.previous();
                }
                break;
            case 'Enter':
                if (open) {
                    if (this.rootContext.highlightedItem()) {
                        // Select the highlighted item (and prevent an accidental form submit).
                        event.preventDefault();
                        this.rootContext.selectHighlighted();
                    } else {
                        // Nothing highlighted: just close, and let the form submit.
                        this.rootContext.closePopup(true);
                    }
                }
                break;
            case 'Escape':
                if (open) {
                    event.preventDefault();
                    this.rootContext.closePopup(true);
                } else if (!this.isEmptyValue() || this.element.value !== '') {
                    // Second Escape on a closed combobox clears the selection and the input.
                    event.preventDefault();
                    this.rootContext.clearSelection();
                }
                break;
            case 'Tab':
                if (open) {
                    this.rootContext.closePopup(true);
                }
                break;
            case 'ArrowLeft':
                // From the very start of the input in multiple mode, step into the chips.
                if (
                    this.rootContext.multiple() &&
                    this.element.selectionStart === 0 &&
                    this.element.selectionEnd === 0 &&
                    this.rootContext.focusLastChip()
                ) {
                    event.preventDefault();
                }
                break;
            case 'Backspace':
                if (this.rootContext.multiple() && this.element.value === '') {
                    this.rootContext.removeLastValue();
                }
                break;
        }
    }

    protected readonly dataAttr = attr;
}
