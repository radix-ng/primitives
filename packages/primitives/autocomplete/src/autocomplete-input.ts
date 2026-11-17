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
import { BooleanInput, dispatchClickWithModifiers, injectId, rdxPlatform } from '@radix-ng/primitives/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { injectFieldRootContext } from '@radix-ng/primitives/field';
import { RdxPopperAnchor } from '@radix-ng/primitives/popper';
import { RdxAutocompletePositioner } from './autocomplete-positioner';
import { RdxAutocompleteRoot } from './autocomplete-root';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * The autocomplete text input. Holds DOM focus at all times; the highlighted option is referenced via
 * `aria-activedescendant`. In `both` / `inline` modes it shows the active item's inline completion
 * with native caret behavior. Integrates with Field for labeling and validation state.
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
        '[attr.aria-labelledby]': 'labelledBy()',
        '[attr.aria-activedescendant]': 'root.activeId()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.aria-invalid]': 'displayValid() === false ? "true" : undefined',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.aria-disabled]': 'disabledState() ? "true" : undefined',
        '[attr.disabled]': 'disabledState() ? "" : undefined',
        '[attr.aria-readonly]': 'root.readOnly() ? "true" : undefined',
        '[attr.readonly]': 'root.readOnly() ? "" : undefined',
        '[attr.required]': 'requiredState() ? "" : undefined',
        '[attr.name]': 'root.inputOwnsFormValue() ? root.name() : undefined',
        '[attr.form]': 'root.form()',
        '[value]': 'root.displayValue()',
        '[attr.data-popup-open]': 'dataAttr(root.open())',
        '[attr.data-list-empty]': 'dataAttr(root.visibleCount() === 0)',
        '[attr.data-invalid]': 'dataAttr(displayValid() === false)',
        '[attr.data-valid]': 'dataAttr(displayValid() === true)',
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
        '(compositionstart)': 'onCompositionStart()',
        '(compositionend)': 'onCompositionEnd($event)'
    }
})
export class RdxAutocompleteInput {
    protected readonly root = inject(RdxAutocompleteRoot);
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
    private readonly fieldRootContext = injectFieldRootContext(true);
    protected readonly labelledBy = computed(() => this.fieldRootContext?.labelId() ?? this.root.labelId());

    /** The input id; Field labels and descriptions reference it for accessible relationships. */
    readonly id = input(injectId('rdx-autocomplete-input-'));

    /** Marks the input as invalid independently of any Field state. */
    readonly invalid = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    // Mirrors the configured mode (matches Base UI): 'list' | 'both' | 'inline' | 'none' — all valid
    // `aria-autocomplete` tokens. Must reflect the static mechanism, not the transient inline preview.
    protected readonly ariaAutocomplete = computed(() => (this.root.readOnly() ? 'none' : this.root.mode()));

    /**
     * Tri-state *displayed* validity: the enclosing Field's gated `validState` when inside a `rdxFieldRoot`
     * (so a field whose `validationMode` defers display (e.g. `onBlur`) keeps the input neutral until revealed), else the input's
     * own binary invalidity.
     */
    protected readonly displayValid = computed<boolean | null>(() => {
        if (this.fieldRootContext) {
            return this.fieldRootContext.validState();
        }
        const rootValid = this.root.validState();
        if (rootValid === null) {
            return null;
        }
        return this.invalid() ? false : rootValid;
    });
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
        const ids = [...this.fieldRootContext.descriptionIds(), ...this.fieldRootContext.errorIds()];
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

        inject(DestroyRef).onDestroy(() => {
            if (this.root.inputElement() === this.element) {
                this.root.setInputElement(null);
            }
        });
    }

    /** Whether an IME composition is in progress (CJK). While composing, don't filter or select. */
    protected composing = false;

    /**
     * Whether IME composition is in progress, combining our own `compositionstart` bookkeeping with
     * the event's native flag. Always `false` on Android: predictive-text keyboards there (Samsung's,
     * for one) report a composition for ordinary typing, so honoring it would stall filtering for the
     * whole session (Base UI `ComboboxInput`).
     */
    protected isComposing(nativeIsComposing: boolean | undefined): boolean {
        return !rdxPlatform.os.android && (this.composing || Boolean(nativeIsComposing));
    }

    onInput(event: Event): void {
        if (this.isComposing((event as InputEvent).isComposing)) {
            return;
        }
        this.commitInput((event.target as HTMLInputElement).value, event);
    }

    onCompositionStart(): void {
        if (rdxPlatform.os.android) {
            return;
        }
        this.composing = true;
    }

    onCompositionEnd(event: CompositionEvent): void {
        this.composing = false;
        this.commitInput((event.target as HTMLInputElement).value, event);
    }

    private commitInput(value: string, event: Event): void {
        if (this.root.readOnly() || this.root.disabledState()) {
            return;
        }
        if (!this.root.setQuery(value, event)) {
            this.element.value = this.root.displayValue();
            return;
        }
        if (value === '' && !this.root.openOnInputClick() && this.root.inputLayout() === 'outside') {
            this.root.closePopup('input-clear', event);
        } else if (!this.root.open() && value.trim() !== '') {
            this.root.setOpen(true, 'input-change', event);
        }
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
        if (this.isComposing(event.isComposing)) {
            return;
        }

        // List navigation also handles modified arrows in Base UI; editing/activation handlers do not.
        if ((event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) && !event.key.startsWith('Arrow')) {
            return;
        }

        const open = this.root.open();

        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp':
                if (!open && this.root.grid()) {
                    break;
                }
                event.preventDefault();
                event.stopPropagation();
                this.root.navigateByKeyboard(event.key === 'ArrowDown' ? 1 : -1, event);
                break;
            case 'ArrowRight':
            case 'ArrowLeft':
                if (open && this.root.grid() && this.root.activeId()) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.root.setKeyboardActive(true);
                    if (event.key === 'ArrowRight') {
                        this.root.moveRight();
                    } else {
                        this.root.moveLeft();
                    }
                }
                break;
            case 'Home':
            case 'End': {
                if (this.root.readOnly()) {
                    break;
                }
                event.preventDefault();
                event.stopPropagation();
                const rtl = this.root.dir() === 'rtl';
                const end = event.key === 'End';
                const position = (rdxPlatform.engine.gecko && rtl ? !end : end) ? this.element.value.length : 0;
                this.element.setSelectionRange(position, position);
                this.element.scrollLeft = end
                    ? (rtl ? -1 : 1) * (this.element.scrollWidth - this.element.clientWidth)
                    : 0;
                break;
            }
            case ' ':
                if (open && !this.root.readOnly() && this.element.value === '') {
                    event.preventDefault();
                    event.stopPropagation();
                    this.clickHighlighted(event);
                }
                break;
            case 'Enter':
                if (open) {
                    const hasHighlight = this.root.virtualized()
                        ? this.root.highlightedIndex() >= 0
                        : this.root.highlightedItem() !== null;
                    if (this.root.readOnly()) {
                        if (hasHighlight) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        break;
                    }
                    if (hasHighlight) {
                        event.preventDefault();
                        this.clickHighlighted(event);
                    } else if (!this.root.inlineMode()) {
                        // Non-inline: close and let native form submission proceed. Inline modes keep the
                        // popup open on Enter without a highlight (matches Base UI).
                        this.root.closePopup('none', event);
                    }
                }
                break;
            case 'Escape':
                if (open) {
                    event.preventDefault();
                    this.root.closePopup('escape-key', event);
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
                    this.root.closePopup('none', event);
                }
                break;
        }
    }

    private clickHighlighted(event: KeyboardEvent): void {
        const id = this.root.activeId();
        const item = id ? this.element.ownerDocument.getElementById(id) : null;
        if (item) {
            dispatchClickWithModifiers(item, event);
        }
    }

    protected readonly dataAttr = attr;
}
