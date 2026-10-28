import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    contentChildren,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    numberAttribute,
    output,
    PLATFORM_ID,
    signal,
    untracked
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    injectControlValueAccessor,
    injectId,
    NumberInput,
    RdxControlValueAccessor,
    RdxFormUiControlBase,
    RdxFormUiTouchTarget,
    RdxFormValueControl,
    serializeNativeFormValue,
    useNativeFormControl
} from '@radix-ng/primitives/core';
import { provideOtpFieldRootContext } from './otp-field-context';
import { RdxOtpFieldInput } from './otp-field-input';
import {
    RdxOtpFieldChangeReason,
    RdxOtpFieldInputMode,
    RdxOtpFieldValidationType,
    RdxOtpFieldValueChangeEvent,
    RdxOtpFieldValueCompleteEvent
} from './types';

const attr = (value: boolean) => (value ? '' : undefined);

function positiveIntegerAttribute(value: NumberInput): number {
    const parsed = numberAttribute(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
        throw new RangeError('RdxOtpFieldRoot length must be a positive integer.');
    }
    return parsed;
}

/**
 * Coordinates one native input per code point and a visually hidden native text control for
 * autofill, constraint validation, reset, and form submission.
 *
 * @see https://base-ui.com/react/components/otp-field
 */
@Directive({
    selector: 'div[rdxOtpFieldRoot]',
    exportAs: 'rdxOtpFieldRoot',
    providers: [provideOtpFieldRootContext(() => inject(RdxOtpFieldRoot))],
    hostDirectives: [
        {
            directive: RdxControlValueAccessor,
            inputs: ['value: value', 'disabled']
        }
    ],
    host: {
        role: 'group',
        // `id` is an input to the root but belongs to the first slot, which is the label target.
        '[attr.id]': 'null',
        '[attr.data-disabled]': 'attr(isDisabled())',
        '[attr.data-readonly]': 'attr(readonly())',
        '[attr.data-required]': 'attr(required())',
        '[attr.data-valid]': 'displayValid() === true ? "" : undefined',
        '[attr.data-invalid]': 'displayValid() === false ? "" : undefined',
        '[attr.data-dirty]': 'formUi.dirtyState() ? "" : undefined',
        '[attr.data-touched]': 'formUi.touchedState() ? "" : undefined',
        '[attr.data-complete]': 'isComplete() ? "" : undefined',
        '[attr.data-filled]': 'isFilled() ? "" : undefined',
        '[attr.data-focused]': 'isFocused() ? "" : undefined',
        '(focusin)': 'onFocusIn($event)',
        '(focusout)': 'onFocusOut($event)'
    }
})
export class RdxOtpFieldRoot extends RdxFormUiControlBase implements RdxFormValueControl<string> {
    /** @ignore */
    protected readonly cva = injectControlValueAccessor<string>();

    /** The id applied to the first slot; subsequent slots receive `{id}-2`, `{id}-3`, and so on. */
    readonly id = input<string>(injectId('rdx-otp-field-'));

    /** Number of characters in the code. Required so server and client markup agree. */
    readonly length = input.required<number, NumberInput>({
        transform: positiveIntegerAttribute
    });

    /** Character set accepted by the field. */
    readonly validationType = input<RdxOtpFieldValidationType>('numeric');

    /** Additional normalization, applied between two validation passes. Keep this function idempotent. */
    readonly normalizeValue = input<((value: string) => string) | undefined>();

    /** Masks all slots unless an individual input supplies its own `type`. */
    readonly mask = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Autocomplete hint used by the first slot and the hidden native input. */
    readonly autoComplete = input('one-time-code');

    /** Submit the owning form as soon as a complete user-entered value is committed. */
    readonly autoSubmit = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Software-keyboard hint. Defaults to `numeric` for numeric validation and `text` otherwise. */
    readonly inputMode = input<RdxOtpFieldInputMode>();

    /** Name used when this field participates in a native form. */
    readonly name = input<string>();

    /** Id of an external form that owns this field. */
    readonly form = input<string>();

    /** Whether the user can interact with this field. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether the value can be changed. Read-only slots remain focusable and navigable. */
    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether a non-empty, complete code is required for native form submission. */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Initial uncontrolled value. It is normalized before first render and restored on form reset. */
    readonly defaultValue = input<string>();

    /** Current value. Use with `[(value)]` for two-way binding. */
    readonly value = model<string>('');

    /** Emitted before a user edit is committed. Call `eventDetails.cancel()` to reject the change. */
    readonly onValueChange = output<RdxOtpFieldValueChangeEvent>();

    /** Emitted with the attempted pre-normalization text when a character is rejected. */
    readonly valueInvalid = output<string>();

    /** Emitted after a user edit fills every slot. */
    readonly valueComplete = output<RdxOtpFieldValueCompleteEvent>();

    /** @ignore Inputs in DOM order, including those inside consumer wrappers. */
    readonly inputs = contentChildren(RdxOtpFieldInput, { descendants: true });

    /** @ignore Native input used for autofill and browser form semantics. */
    readonly nativeInput = signal<HTMLInputElement | null>(null);

    /** @ignore The current normalized value shared by the slots and forms. */
    readonly currentValue = computed(() => this.normalize(this.cva.value() ?? this.value() ?? ''));

    /** @ignore True when the CVA or this root disables interaction. */
    readonly isDisabled = computed(() => Boolean(this.cva.disabled() || this.disabled()));

    /** @ignore True if the current value contains at least one code point. */
    readonly isFilled = computed(() => codePoints(this.currentValue()).length > 0);

    /** @ignore True when the current value occupies every slot. */
    readonly isComplete = computed(() => codePoints(this.currentValue()).length === this.length());

    /** @ignore Index of the focused slot, or -1 when focus is outside the root. */
    readonly focusedIndex = signal(-1);

    /** @ignore Whether any slot currently has focus. */
    readonly isFocused = computed(() => this.focusedIndex() >= 0);

    /** @ignore Roving tab stop: the focused slot, or the first empty slot when focus is outside. */
    readonly activeIndex = computed(() =>
        this.focusedIndex() >= 0
            ? this.focusedIndex()
            : Math.min(codePoints(this.currentValue()).length, this.length() - 1)
    );

    private readonly host = inject<ElementRef<HTMLDivElement>>(ElementRef);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly destroyRef = inject(DestroyRef);
    private readonly hasNativeInput = signal(true);
    private appliedDefaultValue = false;
    private previousModelValue: string | undefined;
    private previousCvaValue: string | undefined;
    private nativeDefaultValueSet = false;

    // The text input created after render owns serialization, so the shared helper only coordinates
    // form reset and imperative submit. It never creates a duplicate hidden entry.
    private readonly nativeFormControl = useNativeFormControl({
        name: this.name,
        form: this.form,
        disabled: this.isDisabled,
        value: this.currentValue,
        serialize: serializeNativeFormValue,
        hasNativeControl: this.hasNativeInput,
        syncNativeControl: () => this.syncNativeInput(),
        defaultValue: () => this.normalize(this.defaultValue() ?? this.cva.value() ?? this.value() ?? ''),
        onReset: (value) => {
            const normalized = this.normalize(value ?? '');
            this.value.set(normalized);
            if (!this.resetNgControl(normalized)) {
                this.cva.writeValue(normalized);
            }
            this.previousModelValue = normalized;
            this.previousCvaValue = normalized;
            this.focusedIndex.set(-1);
            this.formUi.resetInteractionState?.();
        }
    });

    constructor() {
        super();

        // Keep the Signal Forms model and CVA value synchronized while respecting which side was
        // written (a model input, Signal Forms, or Reactive/template-driven Forms).
        effect(() => {
            const modelValue = this.value() ?? '';
            const cvaValue = this.cva.value();
            const modelChanged = this.previousModelValue !== undefined && modelValue !== this.previousModelValue;
            const cvaChanged = this.previousCvaValue !== undefined && cvaValue !== this.previousCvaValue;
            const sourceValue =
                cvaChanged && !modelChanged
                    ? (cvaValue ?? modelValue)
                    : modelChanged && !cvaChanged
                      ? modelValue
                      : !modelValue && cvaValue !== undefined
                        ? cvaValue
                        : modelValue;
            const normalized = this.normalize(sourceValue);

            untracked(() => {
                if (modelValue !== normalized) {
                    this.value.set(normalized);
                }
                if (cvaValue !== normalized) {
                    this.cva.writeValue(normalized);
                }
                this.previousModelValue = normalized;
                this.previousCvaValue = normalized;
            });
        });

        effect(() => {
            const initialValue = this.defaultValue();
            if (initialValue === undefined || this.appliedDefaultValue) {
                return;
            }

            this.appliedDefaultValue = true;
            const normalized = this.normalize(initialValue);
            untracked(() => {
                this.value.set(normalized);
                this.cva.writeValue(normalized);
                this.previousModelValue = normalized;
                this.previousCvaValue = normalized;
            });
        });

        effect(() => {
            // Re-apply normalization when value, length, validation, or the custom normalizer changes.
            const rawValue = this.currentValue();
            const normalized = this.normalize(rawValue);
            if (rawValue !== normalized) {
                untracked(() => {
                    this.value.set(normalized);
                    this.cva.writeValue(normalized);
                    this.previousModelValue = normalized;
                    this.previousCvaValue = normalized;
                });
            }
            this.syncNativeInput();
        });

        if (isPlatformBrowser(this.platformId)) {
            afterNextRender(() => this.mountNativeInput());
        }
    }

    /** @ignore Attribute helper used by host bindings. */
    attr(value: boolean): string | undefined {
        return attr(value);
    }

    /** @ignore Current keyboard mode, using the validation type when no explicit mode was supplied. */
    resolvedInputMode(): RdxOtpFieldInputMode {
        return this.inputMode() ?? (this.validationType() === 'numeric' ? 'numeric' : 'text');
    }

    /** @ignore Id assigned to an input based on its current DOM-order index. */
    inputId(index: number): string {
        return index === 0 ? this.id() : `${this.id()}-${index + 1}`;
    }

    /** @ignore Whether this slot is the single Tab stop. */
    isTabbable(index: number): boolean {
        return !this.isDisabled() && index === this.activeIndex();
    }

    /** @ignore Returns the code point at a slot. */
    characterAt(index: number): string {
        return codePoints(this.currentValue())[index] ?? '';
    }

    /** @ignore Focuses a slot in DOM order. */
    focusInput(index: number): void {
        const slot = this.inputs()[index];
        if (slot && !this.isDisabled()) {
            slot.focus();
        }
    }

    /** @ignore Called when a slot receives a native `input` event. */
    handleSlotInput(index: number, attempted: string, event: Event): boolean {
        if (this.isDisabled() || this.readonly()) {
            return false;
        }

        const rawCharacters = codePoints(attempted);
        if (rawCharacters.some((character) => !/\s/u.test(character) && !this.isAllowed(character))) {
            this.valueInvalid.emit(attempted);
            return false;
        }

        const current = codePoints(this.currentValue());
        if (rawCharacters.length === 0) {
            if (index >= current.length) {
                return false;
            }
            current.splice(index, 1);
            return this.commitUserValue(current.join(''), 'input-clear', event);
        }

        const next = replaceAt(current, index, rawCharacters, this.length());
        return this.commitUserValue(next.join(''), 'input-change', event);
    }

    /** @ignore Handles a paste into the currently focused slot. */
    handlePaste(index: number, attempted: string, event: ClipboardEvent): boolean {
        if (this.isDisabled() || this.readonly()) {
            return false;
        }
        const rawCharacters = codePoints(attempted);
        const nonWhitespaceCharacters = rawCharacters.filter((character) => !/\s/u.test(character));
        const pastedCharacters = nonWhitespaceCharacters.filter((character) => this.isAllowed(character));
        const isCompletePaste = pastedCharacters.length >= this.length();
        if (pastedCharacters.length !== nonWhitespaceCharacters.length) {
            this.valueInvalid.emit(attempted);
        }
        return this.commitUserValue(
            replaceAt(codePoints(this.currentValue()), index, pastedCharacters, this.length()).join(''),
            'input-paste',
            event,
            isCompletePaste
        );
    }

    /** @ignore Applies a native autofill value from the hidden input. */
    handleNativeAutofill(attempted: string, event: Event): void {
        if (this.isDisabled() || this.readonly()) {
            this.syncNativeInput();
            return;
        }
        const rawCharacters = codePoints(attempted);
        const nonWhitespaceCharacters = rawCharacters.filter((character) => !/\s/u.test(character));
        const acceptedCharacters = nonWhitespaceCharacters.filter((character) => this.isAllowed(character));
        if (acceptedCharacters.length !== nonWhitespaceCharacters.length) {
            this.valueInvalid.emit(attempted);
        }
        const accepted = this.commitUserValue(acceptedCharacters.join(''), 'input-change', event);
        if (accepted) {
            this.focusInput(Math.min(codePoints(this.currentValue()).length, this.length() - 1));
        }
    }

    /** @ignore Handles Backspace/Delete without leaving holes in the compact string value. */
    deleteAt(index: number, backward: boolean, event: KeyboardEvent): void {
        if (this.isDisabled() || this.readonly()) {
            return;
        }
        const characters = codePoints(this.currentValue());
        const removeIndex = backward && index >= characters.length ? index - 1 : index;
        if (removeIndex < 0 || removeIndex >= characters.length) {
            if (backward && index > 0) {
                this.focusInput(index - 1);
            }
            return;
        }
        characters.splice(removeIndex, 1);
        if (this.commitUserValue(characters.join(''), 'keyboard', event)) {
            this.focusInput(Math.max(0, removeIndex));
        }
    }

    /** @ignore Focus-in is delegated from the root so wrapped slots count as one field. */
    onFocusIn(event: FocusEvent): void {
        const index = this.inputs().findIndex((input) => input.hostElement() === event.target);
        if (index < 0) {
            return;
        }

        const firstEmptyIndex = codePoints(this.currentValue()).length;
        if (index > firstEmptyIndex) {
            this.focusInput(firstEmptyIndex);
            return;
        }

        this.focusedIndex.set(index);
        this.inputs()[index]?.hostElement().select();
    }

    /** @ignore Focus between slots does not touch the field. */
    onFocusOut(event: FocusEvent): void {
        const host = this.host.nativeElement;
        const next = event.relatedTarget;
        if (next instanceof Node && host.contains(next)) {
            return;
        }

        queueMicrotask(() => {
            if (host.contains(host.ownerDocument.activeElement)) {
                return;
            }
            this.focusedIndex.set(-1);
            this.formUi.markAsTouched();
        });
    }

    /** @ignore Bridges the CVA into `markAsTouched` (dual forms). */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return injectControlValueAccessor<string>();
    }

    private commitUserValue(
        attemptedValue: string,
        reason: RdxOtpFieldChangeReason,
        event: Event,
        completePaste = false
    ): boolean {
        const previousValue = this.currentValue();
        const { value: normalized, rejectedCharacters } = this.normalizeWithRejection(attemptedValue);
        let changed = false;

        if (rejectedCharacters) {
            this.valueInvalid.emit(attemptedValue);
        }

        if (normalized !== previousValue) {
            const trigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
            const { eventDetails } = createCancelableChangeEventDetails(reason, event, trigger);
            this.onValueChange.emit({ value: normalized, eventDetails });
            if (eventDetails.isCanceled()) {
                this.syncNativeInput();
                return false;
            }
            this.value.set(normalized);
            this.cva.setValue(normalized);
            this.previousModelValue = normalized;
            this.previousCvaValue = normalized;
            this.formUi.markDirty();
            changed = true;
        }

        const wasComplete = codePoints(previousValue).length === this.length();
        const isComplete = codePoints(normalized).length === this.length();
        const shouldComplete = isComplete && (!wasComplete || completePaste);
        if (shouldComplete && (changed || completePaste)) {
            this.valueComplete.emit({
                value: normalized,
                reason: reason === 'input-paste' ? 'input-paste' : 'input-change',
                event
            });
            if (this.autoSubmit()) {
                this.nativeFormControl.requestSubmit();
            }
        }
        this.syncNativeInput();
        return true;
    }

    private normalize(value: string): string {
        return this.normalizeWithRejection(value).value;
    }

    private normalizeWithRejection(value: string): { value: string; rejectedCharacters: boolean } {
        const withoutWhitespace = codePoints(value)
            .filter((character) => !/\s/u.test(character))
            .join('');
        const filtered = this.filterAllowed(withoutWhitespace);
        const custom = this.normalizeValue()?.(filtered) ?? filtered;
        const filteredCustom = this.filterAllowed(custom);
        const rejectedCharacters =
            codePoints(filtered).length !== codePoints(withoutWhitespace).length ||
            codePoints(filteredCustom).length !== codePoints(custom).length;
        return {
            value: codePoints(filteredCustom).slice(0, this.length()).join(''),
            rejectedCharacters
        };
    }

    private filterAllowed(value: string): string {
        return codePoints(value)
            .filter((character) => this.isAllowed(character))
            .join('');
    }

    private isAllowed(character: string): boolean {
        switch (this.validationType()) {
            case 'numeric':
                return /^[0-9]$/u.test(character);
            case 'alpha':
                return /^[a-z]$/iu.test(character);
            case 'alphanumeric':
                return /^[a-z0-9]$/iu.test(character);
            case 'none':
                return true;
        }
    }

    private syncNativeInput(): void {
        const input = this.nativeInput();
        if (!input) {
            return;
        }

        const name = this.name();
        if (name) {
            input.name = name;
        } else {
            input.removeAttribute('name');
        }
        const form = this.form();
        if (form) {
            input.setAttribute('form', form);
        } else {
            input.removeAttribute('form');
        }
        input.disabled = this.isDisabled();
        input.readOnly = this.readonly();
        input.required = this.required();
        input.setAttribute('autocomplete', this.autoComplete());
        input.inputMode = this.resolvedInputMode();
        input.minLength = this.length();
        input.maxLength = this.length();
        input.value = this.currentValue();
        input.setCustomValidity(
            this.required() && this.isFilled() && !this.isComplete() ? `Enter all ${this.length()} characters.` : ''
        );

        if (!this.nativeDefaultValueSet) {
            input.defaultValue = this.normalize(this.defaultValue() ?? this.currentValue());
            this.nativeDefaultValueSet = true;
        }
    }

    private mountNativeInput(): void {
        if (!isPlatformBrowser(this.platformId) || this.nativeInput()) {
            return;
        }

        const host = this.host.nativeElement;
        const input = host.ownerDocument.createElement('input');
        input.type = 'text';
        input.tabIndex = -1;
        input.setAttribute('aria-hidden', 'true');
        input.setAttribute('data-rdx-otp-field-native-input', '');
        input.style.cssText =
            'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        host.appendChild(input);
        this.nativeInput.set(input);

        const onChange = (event: Event) => this.handleNativeAutofill(input.value, event);
        const onFocus = () => this.focusInput(0);
        input.addEventListener('input', onChange);
        input.addEventListener('change', onChange);
        input.addEventListener('focus', onFocus);
        this.destroyRef.onDestroy(() => {
            input.removeEventListener('input', onChange);
            input.removeEventListener('change', onChange);
            input.removeEventListener('focus', onFocus);
            input.remove();
            this.nativeInput.set(null);
        });

        this.syncNativeInput();
        this.nativeFormControl.sync();
    }
}

function codePoints(value: string): string[] {
    return Array.from(value ?? '');
}

function replaceAt(current: string[], index: number, inserted: string[], length: number): string[] {
    const start = Math.max(0, Math.min(index, length));
    const available = Math.max(0, length - start);
    const replacement = inserted.slice(0, available);
    return [...current.slice(0, start), ...replacement, ...current.slice(start + replacement.length)].slice(0, length);
}
