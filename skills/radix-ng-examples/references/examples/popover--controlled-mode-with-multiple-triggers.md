# Popover — Controlled mode with multiple triggers

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Bind both `[(open)]` and `[(triggerId)]` when application state should choose the active anchor.
`onOpenChange` reports the trigger element, trigger id, source event, and change reason.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports, RdxPopoverOpenChange } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-controlled-multiple',
    imports: [...popoverImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <ng-container
                [(open)]="open"
                [(triggerId)]="triggerId"
                (onOpenChange)="handleOpenChange($event)"
                rdxPopoverRoot
            >
                <div class="flex flex-wrap justify-center gap-2">
                    @for (item of items; track item.id) {
                        <button
                            [class]="cn(b.base, b.outline, b.size.sm)"
                            [id]="item.id"
                            [payload]="item"
                            rdxPopoverTrigger
                        >
                            {{ item.label }}
                        </button>
                    }

                    <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="openProgrammatically()">
                        Open programmatically
                    </button>
                </div>

                <div *rdxPopoverPortal [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                    <div [class]="p.popup" rdxPopoverPopup>
                        <span [class]="p.arrow" rdxPopoverArrow></span>
                        <h2 [class]="p.title" rdxPopoverTitle>{{ activeItem()?.label }}</h2>
                        <p [class]="p.description" rdxPopoverDescription>
                            The externally controlled trigger id is {{ triggerId() }}.
                        </p>
                        <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                            <svg aria-hidden="true" lucideX size="14" />
                        </button>
                    </div>
                </div>
            </ng-container>

            <p class="text-muted-foreground text-center text-xs">
                State: {{ open() ? 'open' : 'closed' }} · Trigger: {{ triggerId() ?? 'none' }} · Reason:
                {{ lastReason() }}
            </p>
        </div>
    `
})
export class RdxPopoverControlledMultipleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly open = signal(false);
    protected readonly triggerId = signal<string | null>(null);
    protected readonly lastReason = signal('none');
    protected readonly items = [
        { id: 'notifications', label: 'Notifications' },
        { id: 'activity', label: 'Activity' },
        { id: 'profile', label: 'Profile' }
    ];

    protected activeItem() {
        return this.items.find((item) => item.id === this.triggerId());
    }

    protected openProgrammatically() {
        this.triggerId.set('activity');
        this.open.set(true);
    }

    protected handleOpenChange(change: RdxPopoverOpenChange) {
        this.lastReason.set(change.reason);
    }
}
```
