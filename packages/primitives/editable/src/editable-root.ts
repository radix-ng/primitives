import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    linkedSignal,
    model,
    numberAttribute,
    output,
    Signal,
    signal,
    WritableSignal
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    NumberInput,
    RdxCancelableChangeEventDetails,
    RdxFormUiControlBase,
    RdxFormValueControl,
    watch
} from '@radix-ng/primitives/core';
import { RdxFocusOutside, RdxPointerDownOutside } from '@radix-ng/primitives/dismissable-layer';

export type EditableActivationMode = 'focus' | 'dblclick' | 'none';
export type EditableSubmitMode = 'blur' | 'enter' | 'none' | 'both';
export type RdxEditableValueChangeReason = 'submit' | 'none';
export type RdxEditableValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxEditableValueChangeReason>;

export interface RdxEditableValueChangeEvent {
    value: string;
    eventDetails: RdxEditableValueChangeEventDetails;
}

export type EditableRootContext = {
    disabled: Signal<boolean>;
    invalidState: Signal<boolean>;
    touchedState: Signal<boolean>;
    dirtyState: Signal<boolean>;
    value: Signal<string | undefined>;
    inputValue: WritableSignal<string | undefined>;
    placeholder: Signal<{ edit: string; preview: string }>;
    isEditing: Signal<boolean>;
    submitMode: Signal<EditableSubmitMode>;
    activationMode: Signal<EditableActivationMode>;
    edit: () => void;
    cancel: () => void;
    submit: (event?: Event) => void;
    maxLength: Signal<number | undefined>;
    required: Signal<boolean>;
    startWithEditMode: Signal<boolean>;
    isEmpty: Signal<boolean>;
    readonly: Signal<boolean>;
    selectOnFocus: Signal<boolean>;
    autoResize: Signal<boolean>;
    inputRef: WritableSignal<HTMLInputElement | undefined>;
    previewRef: WritableSignal<HTMLElement | undefined>;
    canActivateOnFocus: () => boolean;
};

export const [injectEditableRootContext, provideEditableRootContext] = createContext<EditableRootContext>(
    'EditableRoot',
    'components/editable'
);

const rootContext = (): EditableRootContext => {
    const context = inject(RdxEditableRoot);
    return {
        disabled: context.disabled,
        invalidState: context.invalidState,
        touchedState: context.touchedState,
        dirtyState: context.dirtyState,
        value: context.value,
        inputValue: context.inputValue,
        placeholder: context.$placeholder,
        isEditing: context.isEditing,
        submitMode: context.submitMode,
        activationMode: context.activationMode,
        edit: () => context.edit(),
        cancel: () => context.cancel(),
        submit: (event) => context.submit(event),
        maxLength: context.maxLength,
        required: context.required,
        startWithEditMode: context.startWithEditMode,
        isEmpty: context.isEmpty,
        readonly: context.readonly,
        autoResize: context.autoResize,
        selectOnFocus: context.selectOnFocus,
        inputRef: context.inputRef,
        previewRef: context.previewRef,
        canActivateOnFocus: () => context.canActivateOnFocus()
    };
};

/**
 * @group Components
 */
@Directive({
    selector: '[rdxEditableRoot]',
    exportAs: 'rdxEditableRoot',
    providers: [provideEditableRootContext(rootContext)],
    hostDirectives: [RdxFocusOutside, RdxPointerDownOutside],
    host: {
        '[attr.data-dismissable-layer]': '""'
    }
})
export class RdxEditableRoot extends RdxFormUiControlBase implements RdxFormValueControl<string | undefined> {
    private readonly focusOutside = inject(RdxFocusOutside);
    private readonly pointerDownOutside = inject(RdxPointerDownOutside);

    readonly value = model<string>();

    /** @ignore */
    readonly invalidState = this.formUi.invalidState;
    /** @ignore */
    readonly touchedState = this.formUi.touchedState;
    /** @ignore */
    readonly dirtyState = this.formUi.dirtyState;

    /** Uncontrolled initial value. */
    readonly defaultValue = input<string>();

    readonly placeholder = input<string>('Enter text...');

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly selectOnFocus = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly submitMode = input<EditableSubmitMode>('blur');

    readonly maxLength = input<number | undefined, NumberInput>(undefined, { transform: numberAttribute });

    /**
     * Whether to start with the edit mode active
     */
    readonly startWithEditMode = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly activationMode = input<EditableActivationMode>('focus');

    readonly autoResize = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Emitted when the value is committed (on submit). */
    readonly onValueChange = output<RdxEditableValueChangeEvent>();

    readonly isEmpty = computed(() => {
        const value = this.value();
        return value === undefined || value === null || value === '';
    });

    readonly $placeholder = computed(() => {
        const placeholder = this.placeholder();
        return { edit: placeholder, preview: placeholder };
    });

    /** Seeded from `startWithEditMode`; flipped imperatively by edit/submit/cancel. */
    readonly isEditing = linkedSignal(() => this.startWithEditMode());

    /** Working copy of the value while editing; reseeded whenever the committed value changes. */
    readonly inputValue = linkedSignal(() => this.value());

    readonly inputRef = signal<HTMLInputElement | undefined>(undefined);

    readonly previewRef = signal<HTMLElement | undefined>(undefined);

    private restoreFocusOnExit = false;

    /** True while focus is being restored programmatically, to avoid re-entering edit mode. */
    private suppressFocusActivation = false;

    constructor() {
        super();

        effect(() => {
            if (this.defaultValue() !== undefined) {
                this.value.set(this.defaultValue());
            }
        });

        watch([this.isEditing], ([value]) => {
            this.pointerDownOutside.enabled = value;
            this.focusOutside.enabled = value;
        });

        this.pointerDownOutside.pointerDownOutside.subscribe(() => this.handleDismiss());
        this.focusOutside.focusOutside.subscribe(() => this.handleDismiss());

        // Restore focus to the preview after leaving edit mode, once the input is hidden
        // and the preview is visible again. Runs after render so the DOM reflects isEditing.
        afterRenderEffect(() => {
            const editing = this.isEditing();
            if (!editing && this.restoreFocusOnExit) {
                this.restoreFocusOnExit = false;
                const preview = this.previewRef();
                if (preview) {
                    this.suppressFocusActivation = true;
                    preview.focus({ preventScroll: true });
                    this.suppressFocusActivation = false;
                }
            }
        });
    }

    canActivateOnFocus(): boolean {
        return !this.suppressFocusActivation;
    }

    /** @ignore Mark the field touched (model + `touch` output) for Signal Forms. Called on leaving edit mode. */
    markAsTouched(): void {
        this.formUi.markAsTouched();
    }

    handleDismiss() {
        if (this.isEditing()) {
            if (this.submitMode() === 'blur' || this.submitMode() === 'both') {
                this.submit();
            } else {
                this.cancel();
            }
        }
    }

    submit(event?: Event) {
        const value = this.inputValue() ?? '';
        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const { eventDetails } = createCancelableChangeEventDetails(
            event ? 'submit' : 'none',
            event ?? new Event('editable.value-change'),
            trigger
        );
        this.onValueChange.emit({ value, eventDetails });
        if (eventDetails.isCanceled()) {
            return;
        }

        const changed = (this.value() ?? '') !== value;
        this.value.set(value);
        if (changed) {
            this.formUi.markDirty();
        }
        this.markAsTouched();
        this.restoreFocusOnExit = true;
        this.isEditing.set(false);
    }

    cancel() {
        this.inputValue.set(this.value());
        this.markAsTouched();
        this.restoreFocusOnExit = true;
        this.isEditing.set(false);
    }

    edit() {
        this.inputValue.set(this.value());
        this.isEditing.set(true);
    }
}
