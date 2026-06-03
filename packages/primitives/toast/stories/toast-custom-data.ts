import { cn, demoButton, demoToast } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';

interface MentionData {
    user: string;
    initials: string;
    message: string;
}

/**
 * Toasts carry an arbitrary, typed `data` payload that templates can read back — useful for rich,
 * app-specific content beyond title/description. Here each toast renders an avatar and a mention.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-custom-data-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <button [class]="cn(b.base, b.primary, b.size.md)" (click)="mention()">New mention</button>

        <div rdxToastPortal>
            <div rdxToastViewport [class]="t.viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    <div rdxToastRoot [class]="t.root" [toast]="toast">
                        @let data = $any(toast.data);
                        <div rdxToastContent [class]="t.content">
                            <span
                                class="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
                                aria-hidden="true"
                            >
                                {{ data.initials }}
                            </span>
                            <div class="min-w-0 flex-1">
                                <p rdxToastTitle [class]="t.title">{{ data.user }} mentioned you</p>
                                <p rdxToastDescription [class]="t.description">“{{ data.message }}”</p>
                            </div>
                            <button aria-label="Dismiss" rdxToastClose [class]="t.close">✕</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class ToastCustomDataExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    private readonly people: MentionData[] = [
        { user: 'Ada Lovelace', initials: 'AL', message: 'Can you review the toast PR?' },
        { user: 'Alan Turing', initials: 'AT', message: 'Shipped the stacking fix 🎉' },
        { user: 'Grace Hopper', initials: 'GH', message: 'Found a bug in the timer logic.' }
    ];

    private next = 0;

    mention(): void {
        const person = this.people[this.next % this.people.length];
        this.next++;
        this.manager.add<MentionData>({ title: `${person.user} mentioned you`, data: person });
    }
}
