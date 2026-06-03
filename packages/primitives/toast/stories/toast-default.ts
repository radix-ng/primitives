import { cn, demoButton, demoToast } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-default-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <button [class]="cn(b.base, b.primary, b.size.md)" (click)="notify()">Show toast</button>

        <div rdxToastPortal>
            <div rdxToastViewport [class]="t.viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    <div rdxToastRoot [class]="t.root" [toast]="toast">
                        <div rdxToastContent [class]="t.content">
                            <div class="min-w-0 flex-1">
                                <p rdxToastTitle [class]="t.title">{{ toast.title }}</p>
                                @if (toast.description) {
                                    <p rdxToastDescription [class]="t.description">{{ toast.description }}</p>
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
export class ToastDefaultExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    private count = 0;

    notify(): void {
        this.count++;
        this.manager.add({
            title: `Notification ${this.count}`,
            description: 'Your changes have been saved.'
        });
    }
}
