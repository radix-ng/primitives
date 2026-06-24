import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';
import { injectForm, TanStackField } from '@tanstack/angular-form';
import { z } from 'zod';
import {
    cn,
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
    recipeReset,
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

type FieldRef = { api: { state: { meta: { isTouched: boolean; isValid: boolean; errors: unknown[] } } } };

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

const formSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters.'),
    area: z.string().min(1, 'Choose an area.'),
    priority: z.string().min(1, 'Choose a priority.'),
    labels: z.array(z.string()).min(1, 'Pick at least one label.'),
    notify: z.boolean(),
    details: z.string().min(10, 'Add at least 10 characters of detail.')
});

/**
 * The same complete issue form built with **TanStack Form** and **Zod**. One Zod
 * schema validates the whole form (Standard Schema); compound Radix controls are
 * bound with `[value]`/`(onValueChange)` (or `[checked]`/`(onCheckedChange)`)
 * into the field's `handleChange`. Errors surface once a field is touched and no
 * longer valid; `reset()` restores the defaults.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'tanstack-complex',
    imports: [
        TanStackField,
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
        <form [class]="form0" (submit)="$event.preventDefault(); issueForm.handleSubmit()" novalidate>
            <!-- Text input -->
            <ng-container #title="field" [tanstackField]="issueForm" [validators]="v.title" name="title">
                <div [class]="field" [invalid]="isInvalid(title)" [touched]="isTouched(title)" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Title</label>
                    <input
                        [class]="input"
                        [value]="title.api.state.value"
                        (input)="title.api.handleChange($any($event.target).value)"
                        (blur)="title.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Short summary"
                        autocomplete="off"
                    />
                    <p [class]="error" rdxFieldError>{{ messages(title) }}</p>
                </div>
            </ng-container>

            <!-- Select -->
            <ng-container #area="field" [tanstackField]="issueForm" [validators]="v.area" name="area">
                <div [class]="field" [invalid]="isInvalid(area)" [touched]="isTouched(area)" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Area</label>
                    <div
                        [value]="area.api.state.value"
                        (onValueChange)="area.api.handleChange($any($event.value))"
                        rdxSelectRoot
                    >
                        <button [class]="selectTrigger" (blur)="area.api.handleBlur()" rdxSelectTrigger>
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
                    <p [class]="error" rdxFieldError>{{ messages(area) }}</p>
                </div>
            </ng-container>

            <!-- Radio group -->
            <ng-container #priority="field" [tanstackField]="issueForm" [validators]="v.priority" name="priority">
                <div
                    [class]="field"
                    [invalid]="isInvalid(priority)"
                    [touched]="isTouched(priority)"
                    rdxFieldRoot
                    required
                >
                    <span [class]="label">Priority</span>
                    <div
                        [class]="radio.group"
                        [value]="priority.api.state.value"
                        (onValueChange)="priority.api.handleChange($any($event.value))"
                        aria-label="Priority"
                        rdxRadioRoot
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
                    <p [class]="error" rdxFieldError>{{ messages(priority) }}</p>
                </div>
            </ng-container>

            <!-- Checkbox group -->
            <ng-container #labels="field" [tanstackField]="issueForm" [validators]="v.labels" name="labels">
                <div [class]="field" [invalid]="isInvalid(labels)" [touched]="isTouched(labels)" rdxFieldRoot>
                    <span [class]="label">Labels</span>
                    <div
                        class="flex flex-col gap-2.5"
                        [value]="labels.api.state.value"
                        [allValues]="allLabels"
                        (onValueChange)="labels.api.handleChange($any($event.value))"
                        aria-label="Labels"
                        rdxCheckboxGroup
                    >
                        @for (option of labelOptions; track option.value) {
                            <label class="flex items-center gap-3">
                                <div [name]="option.value" rdxCheckboxRoot>
                                    <button
                                        [class]="checkbox.button"
                                        [attr.aria-label]="option.label"
                                        rdxCheckboxButton
                                    >
                                        <svg
                                            [class]="checkbox.indicator"
                                            rdxCheckboxIndicator
                                            size="16"
                                            lucideCheck
                                        ></svg>
                                    </button>
                                </div>
                                <span [class]="radio.label">{{ option.label }}</span>
                            </label>
                        }
                    </div>
                    <p [class]="error" rdxFieldError>{{ messages(labels) }}</p>
                </div>
            </ng-container>

            <!-- Switch -->
            <ng-container #notify="field" [tanstackField]="issueForm" name="notify">
                <div [class]="fieldRow" rdxFieldRoot>
                    <div [class]="fieldContent">
                        <span [class]="label">Email updates</span>
                        <p [class]="description">Get notified when this issue changes status.</p>
                    </div>
                    <button
                        [class]="switchClass"
                        [checked]="notify.api.state.value"
                        (onCheckedChange)="notify.api.handleChange($any($event.checked))"
                        aria-label="Email updates"
                        rdxSwitchRoot
                    >
                        <span [class]="switchThumb" rdxSwitchThumb></span>
                    </button>
                </div>
            </ng-container>

            <!-- Textarea -->
            <ng-container #details="field" [tanstackField]="issueForm" [validators]="v.details" name="details">
                <div
                    [class]="field"
                    [invalid]="isInvalid(details)"
                    [touched]="isTouched(details)"
                    rdxFieldRoot
                    required
                >
                    <label [class]="label" rdxFieldLabel>Details</label>
                    <textarea
                        [class]="textarea"
                        [value]="details.api.state.value"
                        (input)="details.api.handleChange($any($event.target).value)"
                        (blur)="details.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Steps to reproduce, expected vs. actual…"
                    ></textarea>
                    <p [class]="error" rdxFieldError>{{ messages(details) }}</p>
                </div>
            </ng-container>

            <div class="flex gap-3">
                <button [class]="submit" type="submit">Create issue</button>
                <button [class]="reset" (click)="issueForm.reset()" type="button">Reset</button>
            </div>

            @if (result()) {
                <p [class]="description">Created issue "{{ result()!.title }}" ({{ result()!.area }})</p>
            }
        </form>
    `
})
export class TanstackComplex {
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
    protected readonly reset = cn(recipeReset, 'self-start');
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

    protected readonly result = signal<z.infer<typeof formSchema> | null>(null);

    // One Zod schema is the source of truth; each field validates against its slice
    // on change (live feedback) and on submit (so a pristine submit also reports).
    protected readonly v = {
        title: { onChange: formSchema.shape.title, onSubmit: formSchema.shape.title },
        area: { onChange: formSchema.shape.area, onSubmit: formSchema.shape.area },
        priority: { onChange: formSchema.shape.priority, onSubmit: formSchema.shape.priority },
        labels: { onChange: formSchema.shape.labels, onSubmit: formSchema.shape.labels },
        details: { onChange: formSchema.shape.details, onSubmit: formSchema.shape.details }
    };

    protected readonly issueForm = injectForm({
        defaultValues: {
            title: '',
            area: '',
            priority: '',
            labels: [] as string[],
            notify: true,
            details: ''
        },
        onSubmit: ({ value }) => {
            this.result.set(value);
        }
    });

    protected isInvalid(field: FieldRef): boolean {
        const meta = field.api.state.meta;
        return meta.isTouched && !meta.isValid;
    }

    protected isTouched(field: FieldRef): boolean {
        return field.api.state.meta.isTouched;
    }

    /** Deduped Zod messages (a field may run its onChange + onSubmit validator). */
    protected messages(field: FieldRef): string {
        const meta = field.api.state.meta;
        if (!meta.isTouched) {
            return '';
        }
        const seen = new Set<string>();
        for (const error of meta.errors) {
            const message = typeof error === 'string' ? error : ((error as { message?: string })?.message ?? '');
            if (message) {
                seen.add(message);
            }
        }
        return [...seen].join(', ');
    }
}
