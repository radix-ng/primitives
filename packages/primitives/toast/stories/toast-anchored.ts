import { cn, demoButton, demoToast } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';

/**
 * An anchored toast is positioned against an element with `rdxToastPositioner` (powered by popper)
 * instead of joining the stack, with a `rdxToastArrow` pointing back at the anchor. Pass the anchor
 * through the toast's `positionerProps`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-anchored-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <button [class]="cn(b.base, b.primary, b.size.md)" (click)="show($event)">Anchored toast</button>

        <div rdxToastPortal>
            <div rdxToastViewport [class]="t.viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    @if (toast.positionerProps; as positioner) {
                        <div rdxToastPositioner [anchor]="positioner.anchor" [side]="positioner.side ?? 'top'">
                            <div rdxToastRoot [class]="t.anchored" [toast]="toast">
                                <div rdxToastContent [class]="t.content">
                                    <div class="min-w-0 flex-1">
                                        <p rdxToastTitle [class]="t.title">{{ toast.title }}</p>
                                        <p rdxToastDescription [class]="t.description">{{ toast.description }}</p>
                                    </div>
                                    <button aria-label="Dismiss" rdxToastClose [class]="t.close">✕</button>
                                </div>
                            </div>
                        </div>
                    }
                }
            </div>
        </div>
    `
})
export class ToastAnchoredExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    show(event: MouseEvent): void {
        this.manager.add({
            id: 'anchored',
            title: 'Anchored toast',
            description: 'Pinned to the button, with an arrow.',
            timeout: 0,
            positionerProps: { anchor: event.currentTarget as HTMLElement, side: 'top' }
        });
    }
}
