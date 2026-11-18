import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxPopoverArrow,
    RdxPopoverBackdrop,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverModal,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-modal',
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverBackdrop,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        LucideX
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="flex flex-wrap justify-center gap-2">
                @for (option of options; track option.label) {
                    <button
                        class="demo-button h-8 px-3 text-xs"
                        [class]="modal() === option.value ? 'demo-button-primary' : 'demo-button-outline'"
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
                <button class="demo-button demo-button-outline h-9 px-4" rdxPopoverTrigger>Open popover</button>

                <ng-template rdxPopoverPortal>
                    @if (modal() === true) {
                        <div class="bg-foreground/10 fixed inset-0" rdxPopoverBackdrop></div>
                    }
                    <div class="z-50" sideOffset="8" rdxPopoverPositioner>
                        <div class="demo-surface relative w-80 p-4" rdxPopoverPopup>
                            <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                            <h2 class="demo-popover-title" rdxPopoverTitle>Modal behavior</h2>
                            <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                Switch modes, use Tab to move between controls, then try the outside button.
                            </p>

                            <label class="mt-4 grid gap-1 text-xs font-medium">
                                Name
                                <input class="demo-input h-9 w-full px-3" placeholder="Focused when opened" />
                            </label>

                            <button class="demo-button demo-button-primary mt-3 h-8 px-3 text-xs" type="button">
                                Save changes
                            </button>

                            <button
                                class="demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0"
                                aria-label="Close"
                                rdxPopoverClose
                            >
                                <svg aria-hidden="true" lucideX size="14" />
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <button
                class="demo-button demo-button-secondary h-8 px-3 text-xs"
                (click)="outsideClicks.update((count) => count + 1)"
            >
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxPopoverModalComponent {
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
