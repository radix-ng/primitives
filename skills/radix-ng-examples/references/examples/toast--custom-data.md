# Toast — Custom data

> One example from the [Toast](../components/toast.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Attach a typed `data` payload and read it back in the template for rich, app-specific toasts.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    provideRdxToastManager,
    RdxToastClose,
    RdxToastContent,
    RdxToastDescription,
    RdxToastManager,
    RdxToastPortal,
    RdxToastRoot,
    RdxToastTitle,
    RdxToastViewport
} from '@radix-ng/primitives/toast';

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
    imports: [
        RdxToastPortal,
        RdxToastViewport,
        RdxToastRoot,
        RdxToastContent,
        RdxToastTitle,
        RdxToastDescription,
        RdxToastClose
    ],
    providers: [provideRdxToastManager()],
    template: `
        <button class="demo-button demo-button-primary h-9 px-4" (click)="mention()">New mention</button>

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
                        @let data = $any(toast.data);
                        <div
                            class="demo-surface relative flex [transform:translate3d(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px),0)] items-start gap-3 p-4 pr-9 shadow-lg [transition:var(--transition-demo-toast-swipe)] group-data-[swiping]:[transition:none]"
                            rdxToastContent
                        >
                            <span
                                class="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
                                aria-hidden="true"
                            >
                                {{ data.initials }}
                            </span>
                            <div class="min-w-0 flex-1">
                                <p class="demo-toast-title" rdxToastTitle>{{ data.user }} mentioned you</p>
                                <p class="text-muted-foreground mt-1 text-sm" rdxToastDescription>
                                    “{{ data.message }}”
                                </p>
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
export class ToastCustomDataExample {
    protected readonly manager = inject(RdxToastManager);

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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
