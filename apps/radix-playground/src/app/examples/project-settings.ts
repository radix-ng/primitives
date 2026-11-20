import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';
import {
    RdxSelectItem,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

const environments = [
    { value: 'development', label: 'Development' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' }
] as const;

type Environment = (typeof environments)[number]['value'];

@Component({
    selector: 'app-project-settings',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        RdxSelectRoot,
        RdxSelectLabel,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText
    ],
    template: `
        <div class="settings-preview" [open]="open()" (onOpenChange)="setOpen($event.open)" rdxDialogRoot>
            <div>
                <p class="field-caption">Deployment environment</p>
                <p class="environment-name" aria-live="polite">{{ savedLabel() }}</p>
            </div>
            <button class="primary" type="button" rdxDialogTrigger>Try the component</button>

            <ng-template rdxDialogPortal>
                <div class="backdrop" rdxDialogBackdrop></div>
                <div class="settings-dialog" rdxDialogPopup>
                    <h2 rdxDialogTitle>Project settings</h2>
                    <p class="description" rdxDialogDescription>Choose where this project should deploy.</p>
                    <form [formGroup]="settings" (ngSubmit)="save()">
                        <div class="environment-field" [items]="options" rdxSelectRoot formControlName="environment">
                            <label rdxSelectLabel>Environment</label>
                            <button class="select-trigger" type="button" rdxSelectTrigger>
                                <span #value="rdxSelectedValue" rdxSelectValue>{{ value.slotText() }}</span>
                                <span class="chevron" aria-hidden="true"></span>
                            </button>
                            <ng-template rdxSelectPortal>
                                <div class="select-positioner" [sideOffset]="6" align="start" rdxSelectPositioner>
                                    <div class="environment-popup" rdxSelectPopup>
                                        <div rdxSelectList>
                                            @for (option of options; track option.value) {
                                                <div class="option" [value]="option.value" rdxSelectItem>
                                                    <span rdxSelectItemText>{{ option.label }}</span>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </ng-template>
                        </div>
                        <div class="actions">
                            <button type="button" rdxDialogClose>Cancel</button>
                            <button class="primary" type="submit">Save settings</button>
                        </div>
                    </form>
                </div>
            </ng-template>
        </div>
    `,
    styles: `
        :host {
            display: block;
        }

        .settings-preview,
        .settings-dialog,
        .environment-popup {
            --surface: var(--card, light-dark(#fff, #202124));
            --ink: var(--foreground, light-dark(#191a19, #f3f3f7));
            --muted-ink: var(--muted-foreground, light-dark(#545854, #b3b5b6));
            --line: var(--border, light-dark(#d9dad8, #48494d));
            --subtle: var(--muted, light-dark(#eef0ee, #303135));
            background: var(--surface);
            color: var(--ink);
            border: 1px solid var(--line);
            border-radius: 0.5rem;
        }

        .settings-preview {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 1.25rem;
        }

        .field-caption,
        .description {
            margin: 0;
            color: var(--muted-ink);
            font-size: 0.875rem;
        }

        .environment-name {
            margin: 0.25rem 0 0;
            font-size: 1.125rem;
            font-weight: 600;
        }

        .backdrop {
            position: fixed;
            inset: 0;
            z-index: 1000;
            background: rgb(0 0 0 / 45%);
        }

        .settings-dialog {
            box-sizing: border-box;
            position: fixed;
            z-index: 1001;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: min(26rem, calc(100vw - 2rem));
            max-height: calc(100dvh - 2rem);
            overflow: auto;
            padding: 1.5rem;
            box-shadow: 0 12px 40px rgb(0 0 0 / 18%);
            font-family: inherit;
        }

        h2 {
            margin: 0 0 0.35rem;
            font-size: 1.25rem;
            font-weight: 650;
        }

        .environment-field {
            display: grid;
            gap: 0.4rem;
            margin-top: 1.25rem;
        }

        label {
            font-size: 0.875rem;
            font-weight: 600;
        }

        button {
            border: 1px solid var(--line);
            border-radius: 0.35rem;
            color: inherit;
            background: var(--surface);
            padding: 0.5rem 0.75rem;
            font: inherit;
            font-size: 0.875rem;
            cursor: pointer;
        }

        button:hover {
            background: var(--subtle);
        }

        .primary,
        .primary:hover {
            color: var(--surface);
            border-color: var(--ink);
            background: var(--ink);
            font-weight: 600;
        }

        button:focus-visible {
            outline: 2px solid var(--ink);
            outline-offset: 3px;
        }

        .select-trigger {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
        }

        .chevron {
            width: 0.45rem;
            height: 0.45rem;
            border-right: 1px solid currentColor;
            border-bottom: 1px solid currentColor;
            transform: translateY(-25%) rotate(45deg);
        }

        .select-positioner {
            z-index: 1002;
        }

        .environment-popup {
            box-sizing: border-box;
            width: var(--anchor-width, 10rem);
            padding: 0.25rem;
            box-shadow: 0 6px 20px rgb(0 0 0 / 16%);
        }

        .option {
            border-radius: 0.25rem;
            padding: 0.375rem 0.65rem;
            font-size: 0.875rem;
            cursor: default;
        }

        .option[data-highlighted] {
            background: var(--subtle);
        }

        .option[data-selected] {
            font-weight: 600;
        }

        .actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: end;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }
    `
})
export class ProjectSettings {
    protected readonly options = environments;
    protected readonly saved = signal<Environment>('development');
    protected readonly savedLabel = computed(() => environments.find((option) => option.value === this.saved())?.label);
    protected readonly open = signal(false);
    protected readonly settings = new FormGroup({
        environment: new FormControl<Environment>('development', { nonNullable: true })
    });

    protected setOpen(open: boolean): void {
        if (open) this.settings.reset({ environment: this.saved() });
        this.open.set(open);
    }

    protected save(): void {
        this.saved.set(this.settings.controls.environment.value);
        this.open.set(false);
    }
}
