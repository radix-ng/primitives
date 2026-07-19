# Popover — Modal behavior

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Set `modal` on `rdxPopoverRoot` to block outside interaction, or use `"trap-focus"` to keep focus
inside while leaving document scrolling and outside pointer interactions available.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports, RdxPopoverModal } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoInput, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-modal',
    imports: [...popoverImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="flex flex-wrap justify-center gap-2">
                @for (option of options; track option.label) {
                    <button
                        [class]="cn(b.base, modal() === option.value ? b.primary : b.outline, b.size.sm)"
                        (click)="modal.set(option.value)"
                    >
                        {{ option.label }}
                    </button>
                }
            </div>

            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                {{ description() }}
            </p>

            <ng-container [modal]="modal()" rdxPopoverRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Open popover</button>

                <ng-template rdxPopoverPortal>
                    @if (modal() === true) {
                        <div [class]="p.backdrop" rdxPopoverBackdrop></div>
                    }
                    <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                        <div [class]="p.popup" rdxPopoverPopup>
                            <span [class]="p.arrow" rdxPopoverArrow></span>
                            <h2 [class]="p.title" rdxPopoverTitle>Modal behavior</h2>
                            <p [class]="p.description" rdxPopoverDescription>
                                Switch modes, use Tab to move between controls, then try the outside button.
                            </p>

                            <label class="mt-4 grid gap-1 text-xs font-medium">
                                Name
                                <input [class]="input" placeholder="Focused when opened" />
                            </label>

                            <button [class]="cn(b.base, b.primary, b.size.sm, 'mt-3')" type="button">
                                Save changes
                            </button>

                            <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                                <svg aria-hidden="true" lucideX size="14" />
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="outsideClicks.update((count) => count + 1)">
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxPopoverModalComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly input = demoInput;
    protected readonly p = demoPopover;
    protected readonly modal = signal<RdxPopoverModal>(true);
    protected readonly outsideClicks = signal(0);
    protected readonly options: Array<{ label: string; value: RdxPopoverModal }> = [
        { label: 'Non-modal', value: false },
        { label: 'Modal', value: true },
        { label: 'Trap focus', value: 'trap-focus' }
    ];

    protected description() {
        switch (this.modal()) {
            case true:
                return 'Modal: outside pointer interactions and document scrolling are blocked. Focus is trapped because the popup contains a close button.';
            case 'trap-focus':
                return 'Trap focus: keyboard focus stays inside, while document scrolling and outside pointer interactions remain available.';
            default:
                return 'Non-modal: outside pointer interactions and document scrolling remain available.';
        }
    }
}
```
