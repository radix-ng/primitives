import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input
} from '@angular/core';
import { BooleanInput, injectId } from '@radix-ng/primitives/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { injectFieldRootContext } from '@radix-ng/primitives/field';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { RdxAutocompletePositioner } from './autocomplete-positioner';
import { RdxAutocompleteRoot } from './autocomplete-root';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * The autocomplete text input. Holds DOM focus at all times; the highlighted option is referenced via
 * `aria-activedescendant`. In `both` / `inline` modes it shows the active item's inline completion
 * with the completed suffix selected. Integrates with Field for labeling and validation state.
 *
 * @group Components
 */
@Directive({
    selector: 'input[rdxAutocompleteInput]',
    exportAs: 'rdxAutocompleteInput',
    hostDirectives: [RdxPopperAnchor, RdxFloatingInsideElement],
    host: {
        role: 'combobox',
        autocomplete: 'off',
        '[attr.aria-autocomplete]': 'ariaAutocomplete()',
        '[attr.id]': 'id()',
        '[attr.aria-haspopup]': 'root.grid() ? "grid" : "listbox"',
        '[attr.aria-expanded]': 'root.open()',
        '[attr.aria-controls]': 'root.listId',
        '[attr.aria-labelledby]': 'root.labelId()',
        '[attr.aria-activedescendant]': 'root.activeId()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.aria-invalid]': 'invalidState() ? "true" : undefined',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.aria-disabled]': 'disabledState() ? "true" : undefined',
        '[attr.disabled]': 'disabledState() ? "" : undefined',
        '[attr.readonly]': 'root.readOnly() ? "" : undefined',
        '[attr.required]': 'requiredState() ? "" : undefined',
        '[value]': 'root.displayValue()',
        '[attr.data-popup-open]': 'dataAttr(root.open())',
        '[attr.data-list-empty]': 'dataAttr(root.visibleCount() === 0)',
        '[attr.data-invalid]': 'dataAttr(invalidState())',
        '[attr.data-valid]': 'dataAttr(!invalidState())',
        '[attr.data-disabled]': 'dataAttr(disabledState())',
        '[attr.data-required]': 'dataAttr(requiredState())',
        '[attr.data-touched]': 'dataAttr(touchedState())',
        '[attr.data-dirty]': 'dataAttr(dirtyState())',
        '[attr.data-filled]': 'dataAttr(filledState())',
        '[attr.data-focused]': 'dataAttr(focusedState())',
        '(input)': 'onInput($event)',
        '(click)': 'onClick($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(keydown)': 'onKeydown($event)',
        '(compositionstart)': 'composing = true',
        '(compositionend)': 'onCompositionEnd($event)'
    }
})
export class RdxAutocompleteInput {
    protected readonly root = inject(RdxAutocompleteRoot);
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
    private readonly fieldRootContext = injectFieldRootContext(true);

    /** The input id; Field labels and descriptions reference it for accessible relationships. */
    readonly id = input(injectId('rdx-autocomplete-input-'));

    /** Marks the input as invalid independently of any Field state. */
    readonly invalid = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    // Mirrors the configured mode (matches Base UI): 'list' | 'both' | 'inline' | 'none' — all valid
    // `aria-autocomplete` tokens. Must reflect the static mechanism, not the transient inline preview.
    protected readonly ariaAutocomplete = computed(() => this.root.mode());

    protected readonly invalidState = computed(
        () => this.invalid() || this.root.invalidState() || Boolean(this.fieldRootContext?.invalidState())
    );
    protected readonly disabledState = computed(
        () => this.root.disabledState() || Boolean(this.fieldRootContext?.disabledState())
    );
    protected readonly requiredState = computed(
        () => this.root.requiredState() || Boolean(this.fieldRootContext?.requiredState())
    );
    protected readonly touchedState = computed(
        () => this.root.touchedState() || Boolean(this.fieldRootContext?.touchedState())
    );
    protected readonly dirtyState = computed(
        () => this.root.dirtyState() || Boolean(this.fieldRootContext?.dirtyState())
    );
    protected readonly filledState = computed(
        () => Boolean(this.root.value()) || Boolean(this.fieldRootContext?.filledState())
    );
    protected readonly focusedState = computed(() => Boolean(this.fieldRootContext?.focusedState()));

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
        this.root.setInputElement(this.element);
        // Report the layout (Base UI's `inputInsidePopup`): a positioner ancestor means the input lives
        // inside the popup, so the Trigger becomes the focusable `role="combobox"`; otherwise the input
        // is the tab stop and the Trigger is a `tabindex="-1"` toggle.
        this.root.setInputLayout(inject(RdxAutocompletePositioner, { optional: true }) ? 'inside' : 'outside');

        afterNextRender(() => {
            this.fieldRootContext?.setControlId(this.id());
        });

        // Select the completed part of an inline preview so the next keystroke replaces it: the suffix
        // after the typed prefix when the label prefix-matches, otherwise the whole navigated label.
        afterRenderEffect(() => {
            const preview = this.root.inlinePreview();
            if (preview === null) {
                return;
            }
            const query = this.root.query();
            const start = query && preview.toLowerCase().startsWith(query.toLowerCase()) ? query.length : 0;
            this.element.setSelectionRange(start, preview.length);
        });

        inject(DestroyRef).onDestroy(() => {
            if (this.root.inputElement() === this.element) {
                this.root.setInputElement(null);
            }
        });
    }

    /** Whether an IME composition is in progress (CJK). While composing, don't filter or select. */
    protected composing = false;

    onInput(event: Event): void {
        if (this.composing || (event as InputEvent).isComposing) {
            return;
        }
        this.commitInput((event.target as HTMLInputElement).value, event);
    }

    onCompositionEnd(event: CompositionEvent): void {
        this.composing = false;
        this.commitInput((event.target as HTMLInputElement).value, event);
    }

    private commitInput(value: string, event: Event): void {
        // Base UI opens on input only for a non-empty trimmed value — whitespace alone won't open it.
        if (!this.root.open() && value.trim() !== '') {
            this.root.setOpen(true, 'input-change', event);
        }
        this.root.setQuery(value);
    }

    onClick(event: MouseEvent): void {
        if (this.root.openOnInputClick()) {
            this.root.openForBrowse('input-press', event);
        }
    }

    onFocus(): void {
        this.fieldRootContext?.setFocused(true);
    }

    onBlur(): void {
        this.fieldRootContext?.setFocused(false);
        this.fieldRootContext?.setTouched(true);
        // Notify Signal Forms (touched model + touch output) the control was touched.
        this.root.markAsTouched();
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.isComposing || this.composing) {
            return;
        }
        // Backspace / Delete must never re-add an inline completion for the resulting edit.
        this.root.setSuppressInline(event.key === 'Backspace' || event.key === 'Delete');

        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
            return;
        }

        const open = this.root.open();

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.root.setKeyboardActive(true);
                if (!open) {
                    this.root.openAndHighlight('first', 'list-navigation', event);
                } else {
                    this.root.moveDown();
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.root.setKeyboardActive(true);
                if (!open) {
                    this.root.openAndHighlight('last', 'list-navigation', event);
                } else {
                    this.root.moveUp();
                }
                break;
            case 'ArrowRight':
                if (open && this.root.grid()) {
                    event.preventDefault();
                    this.root.setKeyboardActive(true);
                    this.root.moveRight();
                }
                break;
            case 'ArrowLeft':
                if (open && this.root.grid()) {
                    event.preventDefault();
                    this.root.setKeyboardActive(true);
                    this.root.moveLeft();
                }
                break;
            case 'Home':
                // In a grid the search box is a filter, so Home/End jump to the first/last cell rather
                // than moving the caret (outside a grid they keep their native text-editing behavior).
                if (open && this.root.grid()) {
                    event.preventDefault();
                    this.root.setKeyboardActive(true);
                    this.root.highlightFirst();
                }
                break;
            case 'End':
                if (open && this.root.grid()) {
                    event.preventDefault();
                    this.root.setKeyboardActive(true);
                    this.root.highlightLast();
                }
                break;
            case 'Enter':
                if (open) {
                    const hasHighlight = this.root.virtualized()
                        ? this.root.highlightedIndex() >= 0
                        : this.root.highlightedItem() !== null;
                    if (hasHighlight) {
                        event.preventDefault();
                        this.root.selectHighlighted(event);
                    } else if (!this.root.inlineMode()) {
                        // Non-inline: close and let native form submission proceed. Inline modes keep the
                        // popup open on Enter without a highlight (matches Base UI).
                        this.root.closePopup(true, 'none', event);
                    }
                }
                break;
            case 'Escape':
                if (open) {
                    event.preventDefault();
                    this.root.closePopup(true, 'escape-key', event);
                } else if (!this.root.popupMounted()) {
                    // Base UI: Escape on a closed autocomplete clears the input value (a no-op while
                    // read-only / disabled). Guard on `popupMounted` so the same Escape that just closed
                    // an open popup (the `open` branch above) doesn't also clear.
                    this.root.clearValue();
                }
                break;
            case 'Tab':
                // Tab dismisses a real popup and lets focus move on. With no popup (the always-open,
                // inline "command palette" layout), Tab must NOT close — it just moves focus within the
                // surrounding dialog. Guard on `popupMounted` so closing doesn't tear down that dialog.
                if (open && this.root.popupMounted()) {
                    this.root.closePopup(true, 'none', event);
                }
                break;
        }
    }

    protected readonly dataAttr = attr;
}
