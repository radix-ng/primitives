import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
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
        <form class="flex w-100 flex-col gap-5" (submit)="$event.preventDefault(); issueForm.handleSubmit()" novalidate>
            <!-- Text input -->
            <ng-container #title="field" [tanstackField]="issueForm" [validators]="v.title" name="title">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(title)"
                    [touched]="isTouched(title)"
                    rdxFieldRoot
                    required
                >
                    <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Title</label>
                    <input
                        class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 h-9 w-full px-3"
                        [value]="title.api.state.value"
                        (input)="title.api.handleChange($any($event.target).value)"
                        (blur)="title.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Short summary"
                        autocomplete="off"
                    />
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(title) }}</p>
                </div>
            </ng-container>

            <!-- Select -->
            <ng-container #area="field" [tanstackField]="issueForm" [validators]="v.area" name="area">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(area)"
                    [touched]="isTouched(area)"
                    rdxFieldRoot
                    required
                >
                    <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Area</label>
                    <div
                        [value]="area.api.state.value"
                        (onValueChange)="area.api.handleChange($any($event.value))"
                        rdxSelectRoot
                    >
                        <button
                            class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-full items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                            (blur)="area.api.handleBlur()"
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
                                                <svg
                                                    class="size-4 shrink-0"
                                                    lucideCheck
                                                    size="16"
                                                    aria-hidden="true"
                                                ></svg>
                                            </span>
                                            <span rdxSelectItemText>{{ option.label }}</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(area) }}</p>
                </div>
            </ng-container>

            <!-- Radio group -->
            <ng-container #priority="field" [tanstackField]="issueForm" [validators]="v.priority" name="priority">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(priority)"
                    [touched]="isTouched(priority)"
                    rdxFieldRoot
                    required
                >
                    <span class="demo-label data-[disabled]:opacity-50">Priority</span>
                    <div
                        class="flex flex-col gap-2.5"
                        [value]="priority.api.state.value"
                        (onValueChange)="priority.api.handleChange($any($event.value))"
                        aria-label="Priority"
                        rdxRadioRoot
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
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(priority) }}</p>
                </div>
            </ng-container>

            <!-- Checkbox group -->
            <ng-container #labels="field" [tanstackField]="issueForm" [validators]="v.labels" name="labels">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(labels)"
                    [touched]="isTouched(labels)"
                    rdxFieldRoot
                >
                    <span class="demo-label data-[disabled]:opacity-50">Labels</span>
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
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(labels) }}</p>
                </div>
            </ng-container>

            <!-- Switch -->
            <ng-container #notify="field" [tanstackField]="issueForm" name="notify">
                <div class="flex items-start justify-between gap-4" rdxFieldRoot>
                    <div class="flex flex-col gap-1.5">
                        <span class="demo-label data-[disabled]:opacity-50">Email updates</span>
                        <p class="text-muted-foreground text-sm">Get notified when this issue changes status.</p>
                    </div>
                    <button
                        class="demo-switch demo-focus data-[checked]:bg-primary relative inline-flex h-6 w-11 shrink-0 items-center p-0 disabled:cursor-not-allowed disabled:opacity-50"
                        [checked]="notify.api.state.value"
                        (onCheckedChange)="notify.api.handleChange($any($event.checked))"
                        aria-label="Email updates"
                        rdxSwitchRoot
                    >
                        <span
                            class="demo-switch-thumb pointer-events-none block size-5 translate-x-0.5 transition-transform data-[checked]:translate-x-[22px]"
                            rdxSwitchThumb
                        ></span>
                    </button>
                </div>
            </ng-container>

            <!-- Textarea -->
            <ng-container #details="field" [tanstackField]="issueForm" [validators]="v.details" name="details">
                <div
                    class="flex flex-col gap-1.5"
                    [invalid]="isInvalid(details)"
                    [touched]="isTouched(details)"
                    rdxFieldRoot
                    required
                >
                    <label class="demo-label data-[disabled]:opacity-50" rdxFieldLabel>Details</label>
                    <textarea
                        class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/30 min-h-24 w-full px-3 py-2"
                        [value]="details.api.state.value"
                        (input)="details.api.handleChange($any($event.target).value)"
                        (blur)="details.api.handleBlur()"
                        rdxFieldControl
                        placeholder="Steps to reproduce, expected vs. actual…"
                    ></textarea>
                    <p class="text-destructive text-sm" rdxFieldError>{{ messages(details) }}</p>
                </div>
            </ng-container>

            <div class="flex gap-3">
                <button class="demo-button demo-button-primary h-9 px-4" type="submit">Create issue</button>
                <button
                    class="demo-button demo-button-outline h-9 self-start px-4"
                    (click)="issueForm.reset()"
                    type="button"
                >
                    Reset
                </button>
            </div>

            @if (result()) {
                <p class="text-muted-foreground text-sm">
                    Created issue "{{ result()!.title }}" ({{ result()!.area }})
                </p>
            }
        </form>
    `
})
export class TanstackComplex {
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
