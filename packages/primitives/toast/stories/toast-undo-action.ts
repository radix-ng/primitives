import { cn, demoButton, demoToast } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, RdxToastObject, toastImports } from '@radix-ng/primitives/toast';

/**
 * `rdxToastAction` renders an in-toast action button. The label and handler are passed through the
 * toast's `actionProps`; clicking runs the handler and dismisses the toast.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-undo-action-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <div class="flex items-center gap-3">
            <button [class]="cn(b.base, b.primary, b.size.md)" (click)="archive()">Archive item</button>
            <span class="text-muted-foreground text-sm">Archived: {{ archived }}</span>
        </div>

        <div rdxToastPortal>
            <div rdxToastViewport [class]="t.viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    <div rdxToastRoot [class]="t.root" [toast]="toast">
                        <div rdxToastContent [class]="t.content">
                            <div class="min-w-0 flex-1">
                                <p rdxToastTitle [class]="t.title">{{ toast.title }}</p>
                                @if (toast.actionProps; as action) {
                                    <button rdxToastAction [class]="t.action" (click)="runAction(toast, $event)">
                                        {{ action.label }}
                                    </button>
                                }
                            </div>
                            <button aria-label="Dismiss" rdxToastClose [class]="t.close">✕</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class ToastUndoActionExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    protected archived = 0;

    archive(): void {
        this.archived++;
        this.manager.add({
            title: 'Item archived',
            actionProps: { label: 'Undo', onClick: () => this.archived-- }
        });
    }

    runAction(toast: RdxToastObject, event: MouseEvent): void {
        toast.actionProps?.onClick?.(event);
        this.manager.close(toast.id);
    }
}
