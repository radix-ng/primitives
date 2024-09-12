import { computed, Directive, inject, Input, input, signal, TemplateRef } from '@angular/core';
import { RdxDialogRef } from './dialog-ref';
import { RdxDialogConfig, RdxDialogState } from './dialog.config';
import { provideRdxDialog } from './dialog.providers';
import { RdxDialogService } from './dialog.service';

let nextId = 0;

// Primitive.button
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
    #dialogService = inject(RdxDialogService);

    readonly id = input(`rdx-dialog-trigger-${nextId++}`);
    readonly dialogId = computed(() => `rdx-dialog-${this.id()}`);

    @Input({ required: true, alias: 'rdxDialogTrigger' }) dialog: TemplateRef<void>;

    @Input({ alias: 'rdxDialogConfig' }) dialogConfig: RdxDialogConfig<unknown>;

    isOpen = computed(() => this.isOpenSignal());
    state = computed<RdxDialogState>(() => (this.isOpen() ? 'open' : 'closed'));

    private isOpenSignal = signal(false);
    private currentDialogRef: RdxDialogRef | null = null;

    protected onClick() {
        this.currentDialogRef = this.#dialogService.open({
            ...this.dialogConfig,
            content: this.dialog
        });

        this.isOpenSignal.set(true);

        this.currentDialogRef.closed$.subscribe(() => {
            this.isOpenSignal.set(false);
            this.currentDialogRef = null;
        });
    }
}
