import { computed, Directive, inject, Input, input, signal, TemplateRef } from '@angular/core';
import { RdxDialogRef } from './dialog-ref';
import { getState, RdxDialogConfig, RdxDialogState } from './dialog.config';
import { provideRdxDialog } from './dialog.providers';
import { RdxDialogService } from './dialog.service';

let nextId = 0;

/**
 * @group Components
 */
@Directive({
    selector: '[rdxDialogTrigger]',
    standalone: true,
    providers: [provideRdxDialog()],
    host: {
        type: 'button',
        '[attr.id]': 'id()',
        '[attr.aria-haspopup]': '"dialog"',
        '[attr.aria-expanded]': 'isOpen()',
        '[attr.aria-controls]': 'dialogId()',
        '[attr.data-state]': 'state()',
        '(click)': 'onClick()'
    }
})
export class RdxDialogTriggerDirective {
    private readonly dialogService = inject(RdxDialogService);

    /**
     * @group Props
     */
    readonly id = input(`rdx-dialog-trigger-${nextId++}`);
    readonly dialogId = computed(() => `rdx-dialog-${this.id()}`);

    /**
     * @group Props
     */
    @Input({ required: true, alias: 'rdxDialogTrigger' }) dialog: TemplateRef<void>;

    /**
     * @group Props
     */
    @Input({ alias: 'rdxDialogConfig' }) dialogConfig: RdxDialogConfig<unknown>;

    readonly isOpen = signal(false);
    readonly state = computed<RdxDialogState>(() => getState(this.isOpen()));

    private currentDialogRef: RdxDialogRef | null = null;

    protected onClick() {
        this.currentDialogRef = this.dialogService.open({
            ...this.dialogConfig,
            content: this.dialog
        });

        this.isOpen.set(true);

        this.currentDialogRef.closed$.subscribe(() => {
            this.isOpen.set(false);
            this.currentDialogRef = null;
        });
    }
}
