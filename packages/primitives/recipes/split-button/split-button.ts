import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

/**
 * Split Button — a primary action joined to a menu of related actions.
 *
 * Composition only: the `button` primitive drives the primary action, and the `menu` primitive
 * (Root / Trigger / Positioner / Popup / Item) drives the secondary actions. The two `<button>`
 * elements share a rounded shell so they read as one control while staying independently focusable.
 */
@Component({
    selector: 'split-button-example',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxButtonDirective,
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator,
        LucideChevronDown
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="inline-flex rounded-md shadow-sm">
                <button class="demo-button demo-button-primary h-9 rounded-r-none px-4" (click)="run('Save')" rdxButton>
                    Save
                </button>

                <ng-container rdxMenuRoot>
                    <button
                        class="demo-button demo-button-primary border-primary-foreground/20 size-9 rounded-l-none border-l p-0"
                        aria-label="More save options"
                        rdxMenuTrigger
                    >
                        <svg lucideChevronDown size="16"></svg>
                    </button>

                    <div
                        class="z-50 data-[closed]:pointer-events-none"
                        *rdxMenuPortal
                        sideOffset="6"
                        align="end"
                        rdxMenuPositioner
                    >
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="run('Save and duplicate')"
                                rdxMenuItem
                            >
                                Save and duplicate
                            </button>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="run('Save as template')"
                                rdxMenuItem
                            >
                                Save as template
                            </button>
                            <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                (onSelect)="run('Save and close')"
                                rdxMenuItem
                            >
                                Save and close
                            </button>
                        </div>
                    </div>
                </ng-container>
            </div>

            <p class="text-muted-foreground text-sm">
                Last action:
                <span class="text-foreground font-medium">{{ lastAction() }}</span>
            </p>
        </div>
    `
})
export class SplitButtonExample {
    protected readonly lastAction = signal('—');

    protected run(action: string): void {
        this.lastAction.set(action);
    }
}
