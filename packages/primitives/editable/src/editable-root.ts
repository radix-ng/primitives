import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    model,
    OnInit,
    Signal,
    signal,
    WritableSignal
} from '@angular/core';
import { createContext, watch } from '@radix-ng/primitives/core';
import { RdxFocusOutside, RdxPointerDownOutside } from '@radix-ng/primitives/dismissible-layer';

type EditableRootContext = {
    disabled: Signal<boolean>;
    value: Signal<string | null | undefined>;
    inputValue: WritableSignal<string | undefined>;
    placeholder: Signal<{ edit: string; preview: string }>;
    isEditing: Signal<boolean>;
    submitMode: Signal<SubmitMode>;
    activationMode: Signal<ActivationMode>;
    edit: () => void;
    cancel: () => void;
    submit: () => void;
    startWithEditMode: Signal<boolean>;
    isEmpty: Signal<boolean>;
    readonly: Signal<boolean>;
    selectOnFocus: Signal<boolean>;
    autoResize: Signal<boolean>;
    inputRef: WritableSignal<HTMLInputElement | undefined>;
};

export const [injectEditableRootContext, provideEditableRootContext] =
    createContext<EditableRootContext>('EditableRoot');

const rootContext = (): EditableRootContext => {
    const context = inject(RdxEditableRoot);
    return {
        disabled: context.disabled,
        value: context.value,
        inputValue: context.inputValue,
        placeholder: context.$placeholder as Signal<{ edit: string; preview: string }>,
        isEditing: context.isEditing,
        submitMode: context.submitMode,
        activationMode: context.activationMode,
        edit: context.edit,
        cancel: context.cancel,
        submit: context.submit,
        startWithEditMode: context.startWithEditMode,
        isEmpty: context.isEmpty,
        readonly: context.readonly,
        autoResize: context.autoResize,
        selectOnFocus: context.selectOnFocus,
        inputRef: context.inputRef
    };
};

type ActivationMode = 'focus' | 'dblclick' | 'none';
type SubmitMode = 'blur' | 'enter' | 'none' | 'both';

/**
 * @group Components
 */
@Directive({
    selector: '[rdxEditableRoot]',
    exportAs: 'rdxEditableRoot',
    providers: [provideEditableRootContext(rootContext)],
    hostDirectives: [RdxFocusOutside, RdxPointerDownOutside],
    host: {}
})
export class RdxEditableRoot implements OnInit {
    private readonly focusOutside = inject(RdxFocusOutside);
    private readonly pointerDownOutside = inject(RdxPointerDownOutside);

    readonly value = model<string>();

    readonly placeholder = input<string>('Enter text...');

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly selectOnFocus = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly submitMode = input<SubmitMode>('blur');

    /**
     * Whether to start with the edit mode active
     */
    readonly startWithEditMode = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly activationMode = input<ActivationMode>('focus');

    readonly autoResize = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly isEmpty = computed(() => this.value() === '');

    readonly $placeholder = computed(() => {
        return typeof this.placeholder() === 'string'
            ? { edit: this.placeholder(), preview: this.placeholder() }
            : this.placeholder();
    });

    readonly isEditing = signal(this.startWithEditMode() ?? false);

    readonly inputValue = signal(this.value());

    readonly inputRef = signal<HTMLInputElement | undefined>(undefined);

    constructor() {
        watch([this.value], ([value]) => {
            if (value) {
                this.inputValue.set(this.value());
            }
        });

        this.pointerDownOutside.enabled = this.isEditing();
        this.focusOutside.enabled = this.isEditing();

        this.pointerDownOutside.pointerDownOutside.subscribe(() => this.handleDismiss());
        this.focusOutside.focusOutside.subscribe(() => this.handleDismiss());
    }

    ngOnInit() {
        this.isEditing.set(this.startWithEditMode() ?? false);
        this.inputValue.set(this.value());
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

    submit() {
        this.value.set(this.inputValue());
        this.isEditing.set(false);
    }

    cancel() {
        this.isEditing.set(false);
    }

    edit() {
        this.isEditing.set(true);
        this.inputValue.set(this.value());
    }
}
