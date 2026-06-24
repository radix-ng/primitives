import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, minLength, required, validate } from '@angular/forms/signals';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
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
import {
    recipeCheckbox,
    recipeDescription,
    recipeError,
    recipeField,
    recipeFieldContent,
    recipeFieldRow,
    recipeForm,
    recipeInput,
    recipeLabel,
    recipeRadio,
    recipeSelectIndicator,
    recipeSelectItem,
    recipeSelectList,
    recipeSelectPopup,
    recipeSelectTrigger,
    recipeSubmit,
    recipeSwitch,
    recipeSwitchThumb,
    recipeTextarea
} from './forms-recipes.shared';

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
        RdxFieldDescription,
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
        RdxSwitchRoot,
        RdxSwitchThumb,
        LucideCheck,
        LucideChevronDown
    ],
    template: `
        <form [class]="form0" (onFormSubmit)="onSubmit()" rdxFormRoot>
            <!-- Text input -->
            <div [class]="field" name="title" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Title</label>
                <input
                    [class]="input"
                    [formField]="issueForm.title"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="Short summary"
                    autocomplete="off"
                />
                <p #titleError="rdxFieldError" [class]="error" rdxFieldError>{{ titleError.messages().join(' ') }}</p>
            </div>

            <!-- Select -->
            <div [class]="field" name="area" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Area</label>
                <div [formField]="issueForm.area" rdxSelectRoot rdxSignalField>
                    <button [class]="selectTrigger" rdxSelectTrigger>
                        <span #areaValue="rdxSelectedValue" rdxSelectValue placeholder="Select an area…">
                            {{ areaValue.slotText() }}
                        </span>
                        <svg lucideChevronDown size="16"></svg>
                    </button>
                    <div class="z-[100]" *rdxSelectPortal [sideOffset]="6" rdxSelectPositioner>
                        <div [class]="selectPopup" rdxSelectPopup>
                            <div [class]="selectList" rdxSelectList>
                                @for (option of areas; track option.value) {
                                    <div [class]="selectItem" [value]="option.value" rdxSelectItem>
                                        <span [class]="selectIndicator" rdxSelectItemIndicator>
                                            <svg lucideCheck size="16"></svg>
                                        </span>
                                        <span rdxSelectItemText>{{ option.label }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <p #areaError="rdxFieldError" [class]="error" rdxFieldError>{{ areaError.messages().join(' ') }}</p>
            </div>

            <!-- Radio group -->
            <div [class]="field" name="priority" rdxFieldRoot>
                <span [class]="label">Priority</span>
                <div
                    [class]="radio.group"
                    [formField]="issueForm.priority"
                    rdxRadioRoot
                    rdxSignalField
                    aria-label="Priority"
                >
                    @for (option of priorities; track option.value) {
                        <label [class]="radio.row">
                            <span [class]="radio.item" [value]="option.value" rdxRadioItem>
                                <span [class]="radio.indicator" rdxRadioIndicator></span>
                                <input rdxRadioItemInput />
                            </span>
                            <span [class]="radio.label">{{ option.label }}</span>
                        </label>
                    }
                </div>
                <p #priorityError="rdxFieldError" [class]="error" rdxFieldError>
                    {{ priorityError.messages().join(' ') }}
                </p>
            </div>

            <!-- Checkbox group -->
            <div [class]="field" name="labels" rdxFieldRoot>
                <span [class]="label">Labels</span>
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
                                <button [class]="checkbox.button" [attr.aria-label]="option.label" rdxCheckboxButton>
                                    <svg [class]="checkbox.indicator" rdxCheckboxIndicator size="16" lucideCheck></svg>
                                </button>
                            </div>
                            <span [class]="radio.label">{{ option.label }}</span>
                        </label>
                    }
                </div>
                <p #labelsError="rdxFieldError" [class]="error" rdxFieldError>{{ labelsError.messages().join(' ') }}</p>
            </div>

            <!-- Switch -->
            <div [class]="fieldRow" name="notify" rdxFieldRoot>
                <div [class]="fieldContent">
                    <span [class]="label">Email updates</span>
                    <p [class]="description">Get notified when this issue changes status.</p>
                </div>
                <button [class]="switchClass" [formField]="issueForm.notify" aria-label="Email updates" rdxSwitchRoot>
                    <span [class]="switchThumb" rdxSwitchThumb></span>
                </button>
            </div>

            <!-- Textarea -->
            <div [class]="field" name="details" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Details</label>
                <textarea
                    [class]="textarea"
                    [formField]="issueForm.details"
                    rdxFieldControl
                    rdxSignalField
                    placeholder="Steps to reproduce, expected vs. actual…"
                ></textarea>
                <p #detailsError="rdxFieldError" [class]="error" rdxFieldError>
                    {{ detailsError.messages().join(' ') }}
                </p>
            </div>

            <button [class]="submit" type="submit">Create issue</button>

            @if (result()) {
                <p [class]="description">Created issue "{{ result()!.title }}" ({{ result()!.area }})</p>
            }
        </form>
    `
})
export class SignalFormsComplex {
    protected readonly form0 = recipeForm;
    protected readonly field = recipeField;
    protected readonly fieldRow = recipeFieldRow;
    protected readonly fieldContent = recipeFieldContent;
    protected readonly label = recipeLabel;
    protected readonly input = recipeInput;
    protected readonly textarea = recipeTextarea;
    protected readonly description = recipeDescription;
    protected readonly error = recipeError;
    protected readonly submit = recipeSubmit;
    protected readonly selectTrigger = recipeSelectTrigger;
    protected readonly selectPopup = recipeSelectPopup;
    protected readonly selectList = recipeSelectList;
    protected readonly selectItem = recipeSelectItem;
    protected readonly selectIndicator = recipeSelectIndicator;
    protected readonly switchClass = recipeSwitch;
    protected readonly switchThumb = recipeSwitchThumb;
    protected readonly radio = recipeRadio;
    protected readonly checkbox = recipeCheckbox;

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
