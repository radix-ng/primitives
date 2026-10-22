import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { injectOtpFieldRootContext } from './otp-field-context';

/** One native input representing one character of the root value. */
@Directive({
    selector: 'input[rdxOtpFieldInput]',
    exportAs: 'rdxOtpFieldInput',
    host: {
        type: 'text',
        maxlength: '1',
        autocorrect: 'off',
        spellcheck: 'false',
        '[id]': 'rootContext.inputId(index())',
        '[type]': 'resolvedType()',
        '[value]': 'value()',
        '[attr.aria-label]': 'resolvedAriaLabel()',
        '[attr.inputmode]': 'rootContext.resolvedInputMode()',
        '[autocomplete]': 'index() === 0 ? rootContext.autoComplete() : "off"',
        '[tabIndex]': 'rootContext.isTabbable(index()) ? 0 : -1',
        '[disabled]': 'rootContext.isDisabled()',
        '[readonly]': 'rootContext.readonly()',
        '[attr.aria-invalid]': 'rootContext.displayValid() === false ? "true" : null',
        '[attr.data-disabled]': 'rootContext.attr(rootContext.isDisabled())',
        '[attr.data-readonly]': 'rootContext.attr(rootContext.readonly())',
        '[attr.data-required]': 'rootContext.attr(rootContext.required())',
        '[attr.data-valid]': 'rootContext.displayValid() === true ? "" : null',
        '[attr.data-invalid]': 'rootContext.displayValid() === false ? "" : null',
        '[attr.data-dirty]': 'rootContext.formUi.dirtyState() ? "" : null',
        '[attr.data-touched]': 'rootContext.formUi.touchedState() ? "" : null',
        '[attr.data-complete]': 'rootContext.isComplete() ? "" : null',
        '[attr.data-filled]': 'filled() ? "" : null',
        '[attr.data-focused]': 'rootContext.isFocused() ? "" : null',
        '(input)': 'onInput($event)',
        '(paste)': 'onPaste($event)',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxOtpFieldInput {
    protected readonly rootContext = injectOtpFieldRootContext();
    private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

    /** Slot index in DOM order, including inputs nested in consumer wrappers. */
    readonly index = computed(() => this.rootContext.inputs().indexOf(this));

    /** Value of this slot. */
    readonly value = computed(() => this.rootContext.characterAt(this.index()));

    /** Whether this slot contains a character. */
    readonly filled = computed(() => this.value() !== '');

    /** Optional native input type override; when omitted, `mask` chooses text or password. */
    readonly type = input<string | undefined>();

    /** Optional accessible name override; later slots receive a generated character label by default. */
    readonly ariaLabel = input<string | null | undefined>(undefined, { alias: 'aria-label' });

    /** @ignore Native element used by the root for focus management. */
    hostElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    /** @ignore Focusing this slot also updates the root's active Tab stop. */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    /** @ignore Resolves an explicit `type` before the root mask state. */
    resolvedType(): string {
        return this.type() ?? (this.rootContext.mask() ? 'password' : 'text');
    }

    /** @ignore Preserves an explicitly supplied label while naming slots after the first by default. */
    resolvedAriaLabel(): string | null {
        const ariaLabel = this.ariaLabel();
        return ariaLabel === undefined
            ? this.index() === 0
                ? null
                : `Character ${this.index() + 1} of ${this.rootContext.length()}`
            : ariaLabel;
    }

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        const accepted = this.rootContext.handleSlotInput(this.index(), target.value, event);
        if (!accepted) {
            target.value = this.value();
            return;
        }

        const insertedLength = Array.from(target.value).length;
        const nextIndex = Math.min(this.index() + Math.max(1, insertedLength), this.rootContext.length() - 1);
        this.rootContext.focusInput(nextIndex);
    }

    onPaste(event: ClipboardEvent): void {
        const value = event.clipboardData?.getData('text/plain');
        if (value === undefined) {
            return;
        }
        event.preventDefault();
        const accepted = this.rootContext.handlePaste(this.index(), value, event);
        if (!accepted) {
            this.elementRef.nativeElement.value = this.value();
            return;
        }
        const nextIndex = Math.min(this.index() + Math.max(1, Array.from(value).length), this.rootContext.length() - 1);
        this.rootContext.focusInput(nextIndex);
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.altKey || event.ctrlKey || event.metaKey || this.rootContext.isDisabled()) {
            return;
        }

        const index = this.index();
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.rootContext.focusInput(Math.max(0, index - 1));
                return;
            case 'ArrowRight':
                event.preventDefault();
                this.rootContext.focusInput(Math.min(this.rootContext.length() - 1, index + 1));
                return;
            case 'Home':
                event.preventDefault();
                this.rootContext.focusInput(0);
                return;
            case 'End':
                event.preventDefault();
                this.rootContext.focusInput(this.rootContext.length() - 1);
                return;
            case 'Backspace':
                if (this.rootContext.readonly()) {
                    return;
                }
                event.preventDefault();
                this.rootContext.deleteAt(index, true, event);
                return;
            case 'Delete':
                if (this.rootContext.readonly()) {
                    return;
                }
                event.preventDefault();
                this.rootContext.deleteAt(index, false, event);
                return;
        }
    }
}
