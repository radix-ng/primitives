import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuItemHighlightedEvent, RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-highlight-example',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid w-80 gap-4">
            <ng-container (onItemHighlighted)="highlight.set($event)" rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Command preview</button>
                <div *rdxMenuPortal [class]="m.positioner" align="start" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>Open file</button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>Save file</button>
                        <button [class]="m.item" label="Export document" rdxMenuItem>Export…</button>
                        <button [class]="m.item" rdxMenuItem>Print document</button>
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
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
