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
import { RdxComboboxPositioner } from './combobox-positioner';
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
        '[attr.aria-haspopup]': 'rootContext.grid() ? "grid" : "listbox"',
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
        // Report the layout (Base UI's `inputInsidePopup`): a positioner ancestor means the input lives
        // inside the popup (e.g. a command palette), so the Trigger becomes the focusable
        // `role="combobox"`; otherwise the input is the tab stop and the Trigger is a `tabindex="-1"` toggle.
        this.rootContext.setInputLayout(inject(RdxComboboxPositioner, { optional: true }) ? 'inside' : 'outside');

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
        // Base UI: clearing the field closes the popup only when the input is OUTSIDE it (and doesn't
        // open on click). When the input lives inside the popup, emptying the search must keep the popup
        // open (closing it would dismiss the field the user is typing in); otherwise typing (including
        // down to empty in browse mode) opens it.
        if (value === '' && !this.rootContext.openOnInputClick() && this.rootContext.inputLayout() !== 'inside') {
            this.rootContext.closePopup(false);
        } else if (!this.rootContext.open() && value.trim() !== '') {
            // Base UI opens on input only for a non-empty trimmed value — whitespace alone won't open it.
            this.rootContext.openPopup();
        }
        // setInputValue applies any autoHighlight (deferred until items mount) and, in single mode,
        // deselects when the field is emptied.
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
        // Don't interfere with IME composition or text-editing shortcuts / range selection. Shift+Arrows
        // and modified Home/End keep moving/extending the caret; Ctrl/Meta combos stay browser shortcuts.
        // (Plain Home/End navigate the grid below, but only in `grid` mode.)
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
                this.rootContext.navigateByKeyboard(1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.rootContext.navigateByKeyboard(-1);
                break;
            case 'Enter':
                if (open) {
                    const hasHighlight = this.rootContext.virtualized()
                        ? this.rootContext.highlightedIndex() >= 0
                        : this.rootContext.highlightedItem() !== null;
                    if (hasHighlight) {
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
                    // Close the popup, reverting the in-progress query; keep the selection.
                    event.preventDefault();
                    this.rootContext.closePopup(true);
                } else if (!this.rootContext.popupMounted()) {
                    // Base UI: Escape on a closed combobox clears the input text and the selection
                    // (`clearSelection` resets both, a no-op while read-only / disabled). Guard on
                    // `popupMounted`: the dismissable layer closes in the capture phase, so `open()` is
                    // already false here when this same Escape just closed an open popup — in that case
                    // the popup is still mounted (exiting) and we must not also clear.
                    this.rootContext.clearSelection();
                }
                break;
            case 'Tab':
                // Tab dismisses a real popup and lets focus move on. With no popup mounted (an always-open
                // inline layout) Tab must NOT close — it just moves focus on. Guard on `popupMounted`.
                if (open && this.rootContext.popupMounted()) {
                    this.rootContext.closePopup(true);
                }
                break;
            case 'ArrowRight':
                // In a grid, the horizontal arrows move within a row.
                if (open && this.rootContext.grid()) {
                    event.preventDefault();
                    this.rootContext.setKeyboardActive(true);
                    this.rootContext.highlightNextColumn();
                    break;
                }
                this.maybeStepIntoChips('ArrowRight', event);
                break;
            case 'ArrowLeft':
                if (open && this.rootContext.grid()) {
                    event.preventDefault();
                    this.rootContext.setKeyboardActive(true);
                    this.rootContext.highlightPreviousColumn();
                    break;
                }
                this.maybeStepIntoChips('ArrowLeft', event);
                break;
            case 'Home':
                // In a grid the search box is a filter, so Home/End jump to the first/last cell rather
                // than moving the caret (outside a grid they keep their native text-editing behavior).
                if (open && this.rootContext.grid()) {
                    event.preventDefault();
                    this.rootContext.setKeyboardActive(true);
                    this.rootContext.highlightFirst();
                }
                break;
            case 'End':
                if (open && this.rootContext.grid()) {
                    event.preventDefault();
                    this.rootContext.setKeyboardActive(true);
                    this.rootContext.highlightLast();
                }
                break;
            case 'Backspace':
                if (this.rootContext.multiple() && this.element.value === '') {
                    this.rootContext.removeLastValue();
                }
                break;
        }
    }

    /**
     * From the very start of the input in `multiple` mode, step into the chips. The key that points
     * toward the chips is direction-aware: `ArrowLeft` in LTR, `ArrowRight` in RTL.
     */
    private maybeStepIntoChips(key: 'ArrowLeft' | 'ArrowRight', event: KeyboardEvent): void {
        const towardChips = this.rootContext.dir() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
        if (
            key === towardChips &&
            this.rootContext.multiple() &&
            this.element.selectionStart === 0 &&
            this.element.selectionEnd === 0 &&
            this.rootContext.focusLastChip()
        ) {
            event.preventDefault();
        }
    }

    protected readonly dataAttr = attr;
}
