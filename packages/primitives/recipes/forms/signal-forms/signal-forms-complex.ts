import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, minLength, required, validate } from '@angular/forms/signals';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot } from '@radix-ng/primitives/form';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';
import { RdxSignalField } from '@radix-ng/primitives/signal-forms';
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

type Issue = {
    title: string;
    area: string;
    priority: string | null;
    labels: string[];
    notify: boolean;
    details: string;
};

const AREAS = [
    { value: 'ui', label: 'User Interface' },
    { value: 'api', label: 'API' },
    { value: 'docs', label: 'Documentation' }
];
const PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
];
const LABELS = [
    { value: 'bug', label: 'Bug' },
    { value: 'enhancement', label: 'Enhancement' },
    { value: 'question', label: 'Question' }
];

/**
 * A complete issue form covering every control type — text input, select, radio
 * group, checkbox group, switch and textarea — wired to **Signal Forms** and the
 * headless `Field` parts. Each control binds its value with a single `[formField]`
 * and gets `rdxSignalField`, so the Field's state and error surface automatically and,
 * with `rdxFormRoot`'s default `validationMode="onBlur"`, only after the field is touched
 * or the form is submitted — no manual `[invalid]`/`[touched]` per field. `rdxFormRoot`
 * records the submit attempt and blocks an invalid submit (focusing the first invalid
 * field), so the submit handler needs no `markAsTouched()`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-complex',
    imports: [
        FormField,
        RdxFormRoot,
        RdxSignalField,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldError,
        RdxSelectRoot,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        RdxRadioGroupDirective,
        RdxRadioItemDirective,
        RdxRadioIndicatorDirective,
        RdxRadioItemInputDirective,
        RdxCheckboxGroupDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxSwitchRoot,
        RdxSwitchThumb,
        LucideCheck,
        LucideChevronDown
    ],
    template: `
        <form class="flex w-100 flex-col gap-5" (onFormSubmit)="onSubmit()" rdxFormRoot>
            <!-- Text input -->
            <div class="flex flex-col gap-1.5" name="title" rdxFieldRoot>
                <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Title</label>
                <input
                    class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 h-9 w-full px-3"
                    [formField]="issueForm.title"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="Short summary"
                    autocomplete="off"
                />
                <p class="text-destructive text-sm" #titleError="rdxFieldError" rdxFieldError>
                    {{ titleError.messages().join(' ') }}
                </p>
            </div>

            <!-- Select -->
            <div class="flex flex-col gap-1.5" name="area" rdxFieldRoot>
                <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Area</label>
                <div [formField]="issueForm.area" rdxSelectRoot rdxSignalField>
                    <button
                        class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-full items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        rdxSelectTrigger
                    >
                        <span #areaValue="rdxSelectedValue" rdxSelectValue placeholder="Select an area…">
                            {{ areaValue.slotText() }}
                        </span>
                        <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true"></svg>
                    </button>
                    <div class="z-[100]" *rdxSelectPortal [sideOffset]="6" rdxSelectPositioner>
                        <div
                            class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                            rdxSelectPopup
                        >
                            <div class="p-1" rdxSelectList>
                                @for (option of areas; track option.value) {
                                    <div
                                        class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="option.value"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute start-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                        >
                                            <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true"></svg>
                                        </span>
                                        <span rdxSelectItemText>{{ option.label }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <p class="text-destructive text-sm" #areaError="rdxFieldError" rdxFieldError>
                    {{ areaError.messages().join(' ') }}
                </p>
            </div>

            <!-- Radio group -->
            <div class="flex flex-col gap-1.5" name="priority" rdxFieldRoot>
                <span class="demo-label data-[disabled]:opacity-50">Priority</span>
                <div
                    class="flex flex-col gap-2.5"
                    [formField]="issueForm.priority"
                    rdxRadioRoot
                    rdxSignalField
                    aria-label="Priority"
                >
                    @for (option of priorities; track option.value) {
                        <label class="flex items-center gap-3">
                            <span
                                class="demo-radio-item demo-focus flex size-6 items-center justify-center disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                                [value]="option.value"
                                rdxRadioItem
                            >
                                <span
                                    class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                                    rdxRadioIndicator
                                ></span>
                                <input rdxRadioItemInput />
                            </span>
                            <span class="demo-label">{{ option.label }}</span>
                        </label>
                    }
                </div>
                <p class="text-destructive text-sm" #priorityError="rdxFieldError" rdxFieldError>
                    {{ priorityError.messages().join(' ') }}
                </p>
            </div>

            <!-- Checkbox group -->
            <div class="flex flex-col gap-1.5" name="labels" rdxFieldRoot>
                <span class="demo-label data-[disabled]:opacity-50">Labels</span>
                <div
                    class="flex flex-col gap-2.5"
                    [formField]="issueForm.labels"
                    [allValues]="allLabels"
                    rdxCheckboxGroup
                    rdxSignalField
                    aria-label="Labels"
                >
                    @for (option of labelOptions; track option.value) {
                        <label class="flex items-center gap-3">
                            <div [name]="option.value" rdxCheckboxRoot>
                                <button
                                    class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                                    [attr.aria-label]="option.label"
                                    rdxCheckboxButton
                                >
                                    <svg
                                        class="text-primary flex items-center"
                                        *rdxCheckboxIndicatorPresence
                                        rdxCheckboxIndicator
                                        size="16"
                                        lucideCheck
                                    ></svg>
                                </button>
                            </div>
                            <span class="demo-label">{{ option.label }}</span>
                        </label>
                    }
                </div>
                <p class="text-destructive text-sm" #labelsError="rdxFieldError" rdxFieldError>
                    {{ labelsError.messages().join(' ') }}
                </p>
            </div>

            <!-- Switch -->
            <div class="flex items-start justify-between gap-4" name="notify" rdxFieldRoot>
                <div class="flex flex-col gap-1.5">
                    <span class="demo-label data-[disabled]:opacity-50">Email updates</span>
                    <p class="text-muted-foreground text-sm">Get notified when this issue changes status.</p>
                </div>
                <button
                    class="demo-switch h-5 w-9 p-0.5"
                    [formField]="issueForm.notify"
                    aria-label="Email updates"
                    rdxSwitchRoot
                >
                    <span
                        class="demo-switch-thumb size-3.5 data-checked:translate-x-4 rtl:data-checked:-translate-x-4"
                        rdxSwitchThumb
                    ></span>
                </button>
            </div>

            <!-- Textarea -->
            <div class="flex flex-col gap-1.5" name="details" rdxFieldRoot>
                <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Details</label>
                <textarea
                    class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 min-h-24 w-full px-3 py-2"
                    [formField]="issueForm.details"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="Steps to reproduce, expected vs. actual…"
                ></textarea>
                <p class="text-destructive text-sm" #detailsError="rdxFieldError" rdxFieldError>
                    {{ detailsError.messages().join(' ') }}
                </p>
            </div>

            <button class="demo-button demo-button-primary h-9 px-4" type="submit">Create issue</button>

            @if (result()) {
                <p class="text-muted-foreground text-sm">
                    Created issue "{{ result()!.title }}" ({{ result()!.area }})
                </p>
            }
        </form>
    `
})
export class SignalFormsComplex {
    protected readonly areas = AREAS;
    protected readonly priorities = PRIORITIES;
    protected readonly labelOptions = LABELS;
    protected readonly allLabels = LABELS.map((l) => l.value);

    protected readonly result = signal<Issue | null>(null);

    protected readonly model = signal<Issue>({
        title: '',
        area: '',
        priority: null,
        labels: [],
        notify: true,
        details: ''
    });
    protected readonly issueForm = form(this.model, (path) => {
        required(path.title, { message: 'Title is required.' });
        minLength(path.title, 5, { message: 'Title must be at least 5 characters.' });
        required(path.area, { message: 'Choose an area.' });
        required(path.priority, { message: 'Choose a priority.' });
        validate(path.labels, (ctx) =>
            ctx.value().length > 0 ? undefined : { kind: 'minLabels', message: 'Pick at least one label.' }
        );
        required(path.details, { message: 'Details are required.' });
        minLength(path.details, 10, { message: 'Add at least 10 characters of detail.' });
    });

    // `rdxFormRoot` blocks an invalid submit and reveals the errors itself — this only runs when valid.
    protected onSubmit(): void {
        this.result.set(this.model());
    }
}
