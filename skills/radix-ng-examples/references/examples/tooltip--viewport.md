# Tooltip — Viewport

> One example from the [Tooltip](../components/tooltip.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Share a tooltip across several triggers and animate the popup as its content and size change.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideHeadphones, LucideTimer, LucideTrash } from '@lucide/angular';
import {
    createRdxTooltipHandle,
    RdxTooltip,
    RdxTooltipArrow,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipProvider,
    RdxTooltipTrigger,
    RdxTooltipViewport
} from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-viewport-example',
    imports: [
        RdxTooltip,
        RdxTooltipArrow,
        RdxTooltipPopup,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipProvider,
        RdxTooltipTrigger,
        RdxTooltipViewport,
        LucideHeadphones,
        LucideTimer,
        LucideTrash
    ],
    template: `
        <div class="flex" rdxTooltipProvider>
            @for (action of actions; track action.id) {
                <button
                    class="demo-button demo-button-outline data-popup-open:bg-muted size-8 p-0 not-first:border-l-0"
                    [handle]="handle"
                    [id]="action.id"
                    [payload]="action.description"
                    [attr.aria-label]="action.label"
                    rdxTooltipTrigger
                    type="button"
                >
                    @switch (action.id) {
                        @case ('preview') {
                            <svg aria-hidden="true" lucideHeadphones size="16" />
                        }
                        @case ('timer') {
                            <svg aria-hidden="true" lucideTimer size="16" />
                        }
                        @case ('delete') {
                            <svg aria-hidden="true" lucideTrash size="16" />
                        }
                    }
                </button>
            }

            <ng-container #root="rdxTooltip" [handle]="handle" rdxTooltip>
                <div
                    class="z-50 h-[var(--positioner-height,auto)] w-[var(--positioner-width,max-content)] max-w-(--available-width) data-instant:transition-none motion-safe:transition-[top,left,right,bottom] motion-safe:duration-350 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
                    *rdxTooltipPortal
                    sideOffset="11"
                    rdxTooltipPositioner
                >
                    <div
                        class="demo-popup relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] max-w-72 origin-(--transform-origin) px-2 py-1 text-sm data-ending-style:scale-90 data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-90 data-starting-style:opacity-0 motion-safe:transition-[width,height,scale,opacity] motion-safe:duration-350 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
                        rdxTooltipPopup
                    >
                        <span
                            class="h-1.5 w-3 data-instant:transition-none motion-safe:transition-[left,top] motion-safe:duration-350 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
                            rdxTooltipArrow
                            aria-hidden="true"
                        >
                            <span class="demo-popup-arrow block size-full"></span>
                        </span>

                        <div
                            class="relative overflow-clip data-[activation-direction~='left']:[&>[data-current][data-starting-style]]:-translate-x-1/2 data-[activation-direction~='right']:[&>[data-current][data-starting-style]]:translate-x-1/2 data-[activation-direction~='left']:[&>[data-previous][data-ending-style]]:translate-x-1/2 data-[activation-direction~='right']:[&>[data-previous][data-ending-style]]:-translate-x-1/2"
                            rdxTooltipViewport
                        >
                            <div
                                class="w-max max-w-68 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:transition-[translate,opacity] motion-safe:duration-[350ms,175ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] [[data-instant]_&]:transition-none"
                            >
                                {{ root.payload() }}
                            </div>
                        </div>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxTooltipViewportExampleComponent {
    protected readonly handle = createRdxTooltipHandle<string>();
    protected readonly actions = [
        { id: 'preview', label: 'Preview audio', description: 'Listen to audio preview' },
        { id: 'timer', label: 'Set a timer', description: 'Set a timer' },
        { id: 'delete', label: 'Delete', description: 'Delete: This action cannot be undone' }
    ];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
