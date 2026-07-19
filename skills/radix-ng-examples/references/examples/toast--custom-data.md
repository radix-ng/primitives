# Toast — Custom data

> One example from the [Toast](../components/toast.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Attach a typed `data` payload and read it back in the template for rich, app-specific toasts.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

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
            <div [class]="t.viewport" rdxToastViewport>
                @for (toast of manager.toasts(); track toast.id) {
                    <div [class]="t.root" [toast]="toast" rdxToastRoot>
                        @let data = $any(toast.data);
                        <div [class]="t.content" rdxToastContent>
                            <span
                                class="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
                                aria-hidden="true"
                            >
                                {{ data.initials }}
                            </span>
                            <div class="min-w-0 flex-1">
                                <p [class]="t.title" rdxToastTitle>{{ data.user }} mentioned you</p>
                                <p [class]="t.description" rdxToastDescription>“{{ data.message }}”</p>
                            </div>
                            <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
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
```
