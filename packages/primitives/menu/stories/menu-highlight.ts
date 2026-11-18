import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuItemHighlightedEvent,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-highlight-example',
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPortal, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid w-80 gap-4">
            <ng-container (onItemHighlighted)="highlight.set($event)" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Command preview</button>
                <div
                    class="z-50 data-[closed]:pointer-events-none"
                    *rdxMenuPortal
                    align="start"
                    sideOffset="4"
                    rdxMenuPositioner
                >
                    <div
                        class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuItem
                        >
                            Open file
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            [disabled]="true"
                            rdxMenuItem
                        >
                            Save file
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            label="Export document"
                            rdxMenuItem
                        >
                            Export…
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuItem
                        >
                            Print document
                        </button>
                    </div>
                </div>
            </ng-container>
            <p class="text-muted-foreground text-sm">Use arrow keys, type a command, or hover to preview an item.</p>
            <output class="grid gap-1 text-sm">
                <span>Highlighted: {{ highlight()?.label ?? 'none' }}</span>
                <span class="text-muted-foreground">Reason: {{ highlight()?.reason ?? 'none' }}</span>
            </output>
        </section>
    `
})
export class RdxMenuHighlightExampleComponent {
    protected readonly highlight = signal<RdxMenuItemHighlightedEvent | undefined>(undefined);
}
