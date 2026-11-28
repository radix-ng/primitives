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
    Injector,
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
    Direction,
    injectControlValueAccessor,
    injectId,
    NumberInput,
    RdxControlValueAccessor,
    RdxFormUiControlBase,
    RdxFormUiTouchTarget,
    RdxFormValueControl,
    serializeNativeFormValue,
    useNativeFormControl,
    watch
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { injectFieldRootContext } from '@radix-ng/primitives/field';
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

interface PendingOtpEdit {
    value: string;
    focusIndex: number;
    completion?: RdxOtpFieldValueCompleteEvent;
}

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
            inputs: ['disabled']
        }
    ],
    host: {
        role: 'group',
        // `id` is an input to the root but belongs to the first slot, which is the label target.
        '[attr.id]': 'undefined',
        '[attr.dir]': 'direction()',
        '[attr.data-disabled]': 'attr(isDisabled())',
        '[attr.data-readonly]': 'attr(readonly())',
        '[attr.data-required]': 'attr(isRequired())',
        '[attr.data-valid]': 'displayValid() === true ? "" : undefined',
        '[attr.data-invalid]': 'displayValid() === false ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() ? "" : undefined',
        '[attr.data-touched]': 'touchedState() ? "" : undefined',
        '[attr.data-complete]': 'isComplete() ? "" : undefined',
        '[attr.data-filled]': 'filledState() ? "" : undefined',
        '[attr.data-focused]': 'focusedState() ? "" : undefined',
        '(focusin)': 'onFocusIn($event)',
        '(focusout)': 'onFocusOut($event)'
    }
})
export class RdxOtpFieldRoot extends RdxFormUiControlBase implements RdxFormValueControl<string | null | undefined> {
    /** @ignore */
    protected readonly cva = injectControlValueAccessor<string | null>();

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

    /** Text direction used for horizontal slot navigation. */
    readonly dir = input<Direction | undefined>();

    /** @ignore Resolved direction used by slot keyboard navigation. */
    readonly direction = injectDirection(this.dir);

    /** Name used when this field participates in a native form. */
    readonly name = input<string>();

    /** Id of an external form that owns this field. */
    readonly form = input<string>();

    /** Whether the user can interact with this field. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether the value can be changed. Read-only slots remain focusable and navigable. */
    readonly readonly = input<boolean, BooleanInput>(false, { alias: 'readOnly', transform: booleanAttribute });

    /** Whether a non-empty, complete code is required for native form submission. */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Initial uncontrolled value. It is normalized before first render and restored on form reset. */
    readonly defaultValue = input<string>();

    /** Editable value for Angular Forms and `[(value)]`. Null represents an empty code. */
    readonly value = model<string | null>();

    /** Parent-owned code. The parent applies accepted edits through this input. */
    readonly controlledValue = input<string>();

    /** Emitted before a user edit is committed. Call `eventDetails.cancel()` to reject the change. */
    readonly onValueChange = output<RdxOtpFieldValueChangeEvent>();

    /** Emitted with the attempted pre-normalization text when a character is rejected. */
    readonly onValueInvalid = output<string>();

    /** Emitted after a user edit fills every slot. */
    readonly onValueComplete = output<RdxOtpFieldValueCompleteEvent>();

    /** @ignore Inputs in DOM order, including those inside consumer wrappers. */
    readonly inputs = contentChildren(RdxOtpFieldInput, { descendants: true });

    /** @ignore Native input used for autofill and browser form semantics. */
    readonly nativeInput = signal<HTMLInputElement | null>(null);

    /** @ignore True when the CVA, this root, or an enclosing Field disables interaction. */
    readonly isDisabled = computed(() =>
        Boolean(this.cva.disabled() || this.disabled() || this.fieldRootContext?.disabledState())
    );

    /** @ignore Required state merged with an enclosing Field. */
    readonly isRequired = computed(() => Boolean(this.required() || this.fieldRootContext?.requiredState()));

    /** @ignore True if the current value contains at least one code point. */
    readonly isFilled = computed(() => codePoints(this.currentValue()).length > 0);

    /** @ignore True when the current value occupies every slot. */
    readonly isComplete = computed(() => codePoints(this.currentValue()).length === this.length());

    /** @ignore Index of the focused slot, or -1 when focus is outside the root. */
    readonly focusedIndex = signal(-1);

    /** @ignore Whether any slot currently has focus. */
    readonly isFocused = computed(() => this.focusedIndex() >= 0);

    /** @ignore State reflected to an enclosing Field and to each slot. */
    readonly dirtyState = computed(() => this.formUi.dirtyState() || Boolean(this.fieldRootContext?.dirtyState()));
    readonly touchedState = computed(
        () => this.formUi.touchedState() || Boolean(this.fieldRootContext?.touchedState())
    );
    readonly filledState = computed(() => this.isFilled() || Boolean(this.fieldRootContext?.filledState()));
    readonly focusedState = computed(() => this.isFocused() || Boolean(this.fieldRootContext?.focusedState()));

    /** @ignore Description and error ids supplied by an enclosing Field. */
    readonly describedBy = computed(() => {
        const field = this.fieldRootContext;
        if (!field) {
            return undefined;
        }
        const ids = [...field.descriptionIds(), ...field.errorIds()];
        return ids.length > 0 ? ids.join(' ') : undefined;
    });

    /** @ignore Roving tab stop: the focused slot, or the first empty slot when focus is outside. */
    readonly activeIndex = computed(() =>
        this.focusedIndex() >= 0
            ? this.focusedIndex()
            : Math.min(codePoints(this.currentValue()).length, this.length() - 1)
    );

    private readonly host = inject<ElementRef<HTMLDivElement>>(ElementRef);
    private readonly fieldRootContext = injectFieldRootContext(true);
    private readonly injector = inject(Injector);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly destroyRef = inject(DestroyRef);
    private readonly hasNativeInput = signal(true);
    private readonly effectiveName = computed(() => this.fieldRootContext?.name() ?? this.name());
    private readonly usesCva = computed(() => this.cva.value() !== undefined || this.ngControlState.connected());
    private readonly editableValue = computed(() => (this.usesCva() ? (this.cva.value() ?? null) : this.value()));
    private readonly parentValue = computed(() => (this.usesCva() ? undefined : this.controlledValue()));
    private readonly initialValue = signal<string | null | undefined>(undefined);
    private pendingEdit: PendingOtpEdit | undefined;
    private nativeDefaultValueSet = false;

    /** @ignore The normalized value shared by the slots and native submission. */
    readonly currentValue = computed(() => {
        const value = this.parentValue() ?? this.editableValue();
        const initialValue = this.initialValue();
        if (value !== undefined) return this.normalize(value ?? '');
        return this.normalize((initialValue === undefined ? this.defaultValue() : initialValue) ?? '');
    });

    // The text input created after render owns serialization, so the shared helper only coordinates
    // form reset and imperative submit. It never creates a duplicate hidden entry.
    private readonly nativeFormControl = useNativeFormControl({
        name: this.effectiveName,
        form: this.form,
        disabled: this.isDisabled,
        value: this.currentValue,
        serialize: serializeNativeFormValue,
        hasNativeControl: this.hasNativeInput,
        syncNativeControl: () => this.syncNativeInput(),
        defaultValue: this.currentValue,
        onReset: () => {
            const hadFocus = this.focusedIndex() >= 0;
            this.pendingEdit = undefined;
            if (this.parentValue() === undefined && !this.resetNgControl(undefined)) {
                this.value.set(this.initialValue());
            }
            this.focusedIndex.set(-1);
            // Native reset clears each slot's DOM value. The model may not change for slots whose
            // characters already match, so sync every slot after the reset and the next render.
            afterNextRender(() => this.syncSlots(), { injector: this.injector });
            if (hadFocus) {
                this.focusInput(Math.min(codePoints(this.currentValue()).length, this.length() - 1));
            }
            this.formUi.resetInteractionState?.();
        }
    });

    constructor() {
        super();

        watch([], () => {
            const value = this.editableValue();
            this.initialValue.set(value === undefined ? (this.defaultValue() ?? '') : value);
        });

        effect(() => {
            if (this.inputs().length > 0) {
                this.fieldRootContext?.setControlId(this.inputId(0));
            }
        });

        const field = this.fieldRootContext;
        if (field) {
            this.destroyRef.onDestroy(
                field.registerControlState({
                    filled: this.isFilled,
                    blurred: this.formUi.touchedState,
                    changed: this.formUi.dirtyState,
                    ownsNativeEdit: (target) =>
                        target === this.nativeInput() || this.inputs().some((slot) => slot.hostElement() === target)
                })
            );
        }

        watch([this.currentValue, () => this.parentValue() !== undefined], ([value, controlled]) => {
            const edit = this.pendingEdit;
            this.pendingEdit = undefined;
            if (controlled && edit?.value === value) {
                this.acceptEdit(edit);
            }
        });

        effect(() => {
            const focusedIndex = this.focusedIndex();
            const firstEmptyIndex = codePoints(this.currentValue()).length;
            if (focusedIndex >= 0 && focusedIndex > firstEmptyIndex) {
                untracked(() => this.focusInput(Math.min(firstEmptyIndex, this.length() - 1)));
            }
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
            const element = slot.hostElement();
            const selectCurrentCharacter = () => {
                if (element.ownerDocument.activeElement !== element || this.isDisabled()) {
                    return;
                }
                // A pending Angular value binding can still run after the focus event and collapse
                // the selection. Restore the committed character after that render, then select it.
                element.value = slot.value();
                element.select();
            };

            // Avoid a stale DOM value during the focus event, then reselect after pending bindings run.
            element.value = slot.value();
            slot.focus();
            selectCurrentCharacter();
            afterNextRender(selectCurrentCharacter, { injector: this.injector });
        }
    }

    /** @ignore Called when a slot receives a native `input` event. */
    handleSlotInput(index: number, attempted: string, event: Event): boolean {
        if (this.isDisabled() || this.readonly()) {
            return false;
        }

        const { value: accepted, rejectedCharacters } = this.normalizeWithRejection(attempted);
        if (rejectedCharacters) {
            this.onValueInvalid.emit(attempted);
        }
        const acceptedCharacters = codePoints(accepted);
        const current = codePoints(this.currentValue());
        if (codePoints(attempted).length === 0) {
            if (index >= current.length) {
                return false;
            }
            current.splice(index, 1);
            return this.commitUserValue(current.join(''), 'input-clear', event, index);
        }

        if (acceptedCharacters.length === 0) {
            return false;
        }

        const next = replaceAt(current, index, acceptedCharacters, this.length());
        return this.commitUserValue(
            next.join(''),
            'input-change',
            event,
            Math.min(index + acceptedCharacters.length, this.length() - 1)
        );
    }

    /** @ignore Handles a paste into the currently focused slot. */
    handlePaste(index: number, attempted: string, event: ClipboardEvent): void {
        if (this.isDisabled() || this.readonly()) {
            return;
        }
        const { value: accepted, rejectedCharacters } = this.normalizeWithRejection(attempted);
        if (rejectedCharacters) {
            this.onValueInvalid.emit(attempted);
        }
        const pastedCharacters = codePoints(accepted);
        const isCompletePaste = pastedCharacters.length >= this.length();
        this.commitUserValue(
            replaceAt(codePoints(this.currentValue()), index, pastedCharacters, this.length()).join(''),
            'input-paste',
            event,
            Math.min(index + pastedCharacters.length, this.length() - 1),
            isCompletePaste
        );
    }

    /** @ignore Applies a native autofill value from the hidden input. */
    handleNativeAutofill(attempted: string, event: Event): void {
        if (this.isDisabled() || this.readonly()) {
            this.syncNativeInput();
            return;
        }
        this.commitUserValue(attempted, 'input-change', event);
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
        this.commitUserValue(characters.join(''), 'keyboard', event, Math.max(0, backward ? index - 1 : removeIndex));
    }

    /** @ignore Clears the full code for the Ctrl/Cmd+Backspace shortcut. */
    clearAll(event: KeyboardEvent): void {
        if (this.isDisabled() || this.readonly() || this.currentValue() === '') {
            return;
        }
        this.commitUserValue('', 'keyboard', event, 0);
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
        this.fieldRootContext?.setFocused(true);
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
            this.fieldRootContext?.setFocused(false);
            this.fieldRootContext?.setTouched(true);
            this.formUi.markAsTouched();
        });
    }

    /** @ignore Bridges the CVA into `markAsTouched` (dual forms). */
    protected override formUiTouchTarget(): RdxFormUiTouchTarget {
        return injectControlValueAccessor<string | null>();
    }

    private commitUserValue(
        attemptedValue: string,
        reason: RdxOtpFieldChangeReason,
        event: Event,
        focusIndex?: number,
        completePaste = false
    ): boolean {
        const previousValue = this.currentValue();
        const { value: normalized, rejectedCharacters } = this.normalizeWithRejection(attemptedValue);
        const changed = normalized !== previousValue;

        if (rejectedCharacters) {
            this.onValueInvalid.emit(attemptedValue);
        }

        if (changed) {
            const trigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
            const { eventDetails } = createCancelableChangeEventDetails(reason, event, trigger);
            this.onValueChange.emit({ value: normalized, eventDetails });
            if (eventDetails.isCanceled()) {
                this.syncNativeInput();
                return false;
            }
        }

        const wasComplete = codePoints(previousValue).length === this.length();
        const nextLength = codePoints(normalized).length;
        const completed = nextLength === this.length() && (!wasComplete || completePaste) && (changed || completePaste);
        const edit: PendingOtpEdit = {
            value: normalized,
            focusIndex: focusIndex ?? Math.min(nextLength, this.length() - 1)
        };
        if (completed) {
            edit.completion = {
                value: normalized,
                reason: reason === 'input-paste' ? 'input-paste' : 'input-change',
                event
            };
        }

        if (changed) {
            if (this.parentValue() !== undefined) {
                this.pendingEdit = edit;
                this.syncNativeInput();
                return true;
            }
            if (this.usesCva()) {
                this.cva.setValue(normalized);
            } else {
                this.value.set(normalized);
            }
        }
        this.acceptEdit(edit, changed);
        return true;
    }

    private acceptEdit(edit: PendingOtpEdit, changed = true): void {
        if (changed) {
            this.formUi.markDirty();
            this.fieldRootContext?.notifyEdited();
        }
        this.focusInput(edit.focusIndex);
        this.syncNativeInput();
        if (edit.completion) {
            this.syncSlots();
            this.onValueComplete.emit(edit.completion);
            if (this.autoSubmit()) {
                this.nativeFormControl.requestSubmit();
            }
        }
    }

    private syncSlots(): void {
        for (const slot of this.inputs()) {
            const element = slot.hostElement();
            if (element.value !== slot.value()) {
                element.value = slot.value();
            }
        }
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
            codePoints(custom).length < codePoints(filtered).length ||
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

        const name = this.effectiveName();
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
        input.required = this.isRequired();
        input.setAttribute('autocomplete', this.autoComplete());
        input.inputMode = this.resolvedInputMode();
        input.value = this.currentValue();
        input.setCustomValidity(this.isFilled() && !this.isComplete() ? `Enter all ${this.length()} characters.` : '');

        if (!this.nativeDefaultValueSet) {
            input.defaultValue = this.currentValue();
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
