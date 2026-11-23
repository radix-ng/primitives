import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    provideRdxToastManager,
    RdxToastAction,
    RdxToastClose,
    RdxToastContent,
    RdxToastManager,
    RdxToastObject,
    RdxToastPortal,
    RdxToastRoot,
    RdxToastTitle,
    RdxToastViewport
} from '@radix-ng/primitives/toast';

/**
 * `rdxToastAction` renders an in-toast action button. The label and handler are passed through the
 * toast's `actionProps`; clicking runs the handler and dismisses the toast.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-undo-action-example',
    imports: [
        RdxToastPortal,
        RdxToastViewport,
        RdxToastRoot,
        RdxToastContent,
        RdxToastTitle,
        RdxToastClose,
        RdxToastAction
    ],
    providers: [provideRdxToastManager()],
    template: `
        <div class="flex items-center gap-3">
            <button class="demo-button demo-button-primary h-9 px-4" (click)="archive()">Archive item</button>
            <span class="text-muted-foreground text-sm">Archived: {{ archived }}</span>
        </div>

        <div rdxToastPortal>
            <div
                class="fixed right-4 bottom-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] outline-none [--toast-gap:0.75rem]"
                rdxToastViewport
            >
                @for (toast of manager.toasts(); track toast.id) {
                    <div
                        class="group data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out absolute right-0 bottom-0 [z-index:calc(50-var(--toast-index))] w-full origin-bottom [transform:translateY(calc(var(--toast-index)*-0.75rem))_scale(calc(1-var(--toast-index)*0.05))] [opacity:calc(1-var(--toast-index)*0.3)] [transition:var(--transition-demo-toast-stack)] data-[expanded]:[transform:translateY(calc((var(--toast-offset-y)+var(--toast-index)*var(--toast-gap))*-1))] data-[expanded]:opacity-100 data-[front]:opacity-100"
                        [toast]="toast"
                        rdxToastRoot
                    >
                        <div
                            class="demo-popup relative flex [transform:translate3d(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px),0)] items-start gap-3 p-4 pr-9 [transition:var(--transition-demo-toast-swipe)] group-data-[swiping]:[transition:none]"
                            rdxToastContent
                        >
                            <div class="min-w-0 flex-1">
                                <p class="demo-toast-title" rdxToastTitle>{{ toast.title }}</p>
                                @if (toast.actionProps; as action) {
                                    <button
                                        class="demo-button demo-button-outline mt-3 h-8 px-3 text-xs"
                                        (click)="runAction(toast, $event)"
                                        rdxToastAction
                                    >
                                        {{ action.label }}
                                    </button>
                                }
                            </div>
                            <button
                                class="demo-button demo-button-ghost absolute top-2 right-2 size-6 p-0"
                                aria-label="Dismiss"
                                rdxToastClose
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class ToastUndoActionExample {
    protected readonly manager = inject(RdxToastManager);

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
