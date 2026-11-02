import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { rdxPlatform } from '@radix-ng/primitives/core';
import { injectOtpFieldRootContext } from './otp-field-context';

/** One native input representing one character of the root value. */
@Directive({
    selector: 'input[rdxOtpFieldInput]',
    exportAs: 'rdxOtpFieldInput',
    host: {
        type: 'text',
        autocorrect: 'off',
        spellcheck: 'false',
        '[id]': 'rootContext.inputId(index())',
        '[attr.maxlength]': 'index() === 0 ? rootContext.length() : undefined',
        '[type]': 'resolvedType()',
        '[value]': 'value()',
        '[attr.aria-label]': 'resolvedAriaLabel()',
        '[attr.inputmode]': 'rootContext.resolvedInputMode()',
        '[autocomplete]': 'index() === 0 ? rootContext.autoComplete() : "off"',
        '[tabIndex]': 'rootContext.isTabbable(index()) ? 0 : -1',
        '[disabled]': 'rootContext.isDisabled()',
        '[readonly]': 'rootContext.readonly()',
        '[attr.aria-invalid]': 'rootContext.displayValid() === false ? "true" : undefined',
        '[attr.data-disabled]': 'rootContext.attr(rootContext.isDisabled())',
        '[attr.data-readonly]': 'rootContext.attr(rootContext.readonly())',
        '[attr.data-required]': 'rootContext.attr(rootContext.required())',
        '[attr.data-valid]': 'rootContext.displayValid() === true ? "" : undefined',
        '[attr.data-invalid]': 'rootContext.displayValid() === false ? "" : undefined',
        '[attr.data-dirty]': 'rootContext.formUi.dirtyState() ? "" : undefined',
        '[attr.data-touched]': 'rootContext.formUi.touchedState() ? "" : undefined',
        '[attr.data-complete]': 'rootContext.isComplete() ? "" : undefined',
        '[attr.data-filled]': 'filled() ? "" : undefined',
        '[attr.data-focused]': 'rootContext.isFocused() ? "" : undefined',
        '(input)': 'onInput($event)',
        '(mousedown)': 'onMouseDown($event)',
        '(paste)': 'onPaste($event)',
        '(keydown)': 'onKeydown($event)',
        '(compositionstart)': 'onCompositionStart()',
        '(compositionend)': 'onCompositionEnd($event)'
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

    private composing = false;
    private skipNextInputValue: string | undefined;

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
    resolvedAriaLabel(): string | undefined {
        const ariaLabel = this.ariaLabel();
        return ariaLabel === undefined
            ? this.index() === 0
                ? undefined
                : `Character ${this.index() + 1} of ${this.rootContext.length()}`
            : (ariaLabel ?? undefined);
    }

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (this.isComposing((event as InputEvent).isComposing)) {
            return;
        }

        if (this.skipNextInputValue !== undefined) {
            const skipValue = this.skipNextInputValue;
            this.skipNextInputValue = undefined;
            if (target.value === skipValue) {
                target.value = this.value();
                return;
            }
        }

        this.commitInput(target, event);
    }

    onCompositionStart(): void {
        if (!rdxPlatform.os.android) {
            this.composing = true;
        }
    }

    onCompositionEnd(event: CompositionEvent): void {
        this.composing = false;
        if (rdxPlatform.os.android) {
            return;
        }

        const target = event.target as HTMLInputElement;
        this.skipNextInputValue = target.value;
        this.commitInput(target, event);
    }

    private isComposing(nativeIsComposing: boolean | undefined): boolean {
        return !rdxPlatform.os.android && (this.composing || Boolean(nativeIsComposing));
    }

    private commitInput(target: HTMLInputElement, event: Event): void {
        const insertedLength = this.rootContext.handleSlotInput(this.index(), target.value, event);
        target.value = this.value();
        if (insertedLength === null) {
            this.rootContext.focusInput(this.index());
            return;
        }

        const nextIndex = Math.min(this.index() + insertedLength, this.rootContext.length() - 1);
        this.rootContext.focusInput(nextIndex);
    }

    onMouseDown(event: MouseEvent): void {
        const input = this.elementRef.nativeElement;
        if (this.rootContext.isDisabled() || input.value === '') {
            return;
        }

        event.preventDefault();
        this.rootContext.focusInput(this.index());
        input.select();
    }

    onPaste(event: ClipboardEvent): void {
        let value: string | undefined;
        try {
            value = event.clipboardData?.getData('text/plain');
        } catch {
            event.preventDefault();
            return;
        }
        if (value === undefined) {
            return;
        }
        event.preventDefault();
        const insertedLength = this.rootContext.handlePaste(this.index(), value, event);
        if (insertedLength === null) {
            this.elementRef.nativeElement.value = this.value();
            return;
        }
        const nextIndex = Math.min(this.index() + insertedLength, this.rootContext.length() - 1);
        this.rootContext.focusInput(nextIndex);
    }

    onKeydown(event: KeyboardEvent): void {
        if (this.isComposing(event.isComposing) || event.altKey || this.rootContext.isDisabled()) {
            return;
        }

        const index = this.index();
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    this.rootContext.focusInput(0);
                    return;
                case 'ArrowRight':
                    event.preventDefault();
                    this.rootContext.focusInput(this.rootContext.length() - 1);
                    return;
                case 'Backspace':
                    if (this.rootContext.readonly()) {
                        return;
                    }
                    event.preventDefault();
                    this.rootContext.clearAll(event);
                    return;
                default:
                    return;
            }
        }
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.rootContext.focusInput(Math.max(0, index - 1));
                return;
            case 'ArrowRight':
                event.preventDefault();
                this.rootContext.focusInput(Math.min(this.rootContext.length() - 1, index + 1));
                return;
            case 'ArrowUp':
            case 'Home':
                event.preventDefault();
                this.rootContext.focusInput(0);
                return;
            case 'ArrowDown':
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
