import { demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { toolbarImports } from '@radix-ng/primitives/toolbar';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-menu',
    imports: [...toolbarImports, RdxMenuModule, LucideChevronDown],
    template: `
        <div
            class="border-border bg-background flex items-center gap-1 rounded-lg border p-1 shadow-sm"
            rdxToolbarRoot
            aria-label="Toolbar with menu"
        >
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Bold
            </button>
            <button
                class="${'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2'}"
                rdxToolbarButton
            >
                Italic
            </button>

            <div class="bg-border mx-1 h-5 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
                <button
                    class="text-foreground hover:bg-muted focus-visible:ring-ring data-[popup-open]:bg-muted inline-flex h-8 items-center justify-center gap-1 rounded-md px-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                    rdxToolbarButton
                    rdxMenuTrigger
                >
                    More
                    <svg lucideChevronDown size="14"></svg>
                </button>

                @if (menu.open()) {
                    <div sideOffset="6" rdxMenuPositioner [class]="m.positioner">
                        <div rdxMenuPopup [class]="m.popup">
                            <button rdxMenuItem [class]="m.item">Undo</button>
                            <button rdxMenuItem [class]="m.item">Redo</button>
                            <div rdxMenuSeparator [class]="m.separator"></div>
                            <button rdxMenuItem [class]="m.item">Clear formatting</button>
                        </div>
                    </div>
                }
            </ng-container>
        </div>
    `
})
export class ToolbarWithMenuExample {
    protected readonly m = demoMenu;
}
