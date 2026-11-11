import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-context-menu-areas',
    imports: [RdxContextMenuModule, RdxMenuModule, LucideChevronRight],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid max-w-full gap-4">
            <ng-container rdxContextMenuRoot>
                @if (nested()) {
                    <div [class]="cn(area, 'grid gap-4 p-6')" tabindex="0" rdxContextMenuTrigger>
                        Outer area
                        <div [class]="area" tabindex="0" rdxContextMenuTrigger>Inner area</div>
                    </div>
                } @else {
                    <div class="grid gap-4 sm:grid-cols-2">
                        <div [class]="area" tabindex="0" rdxContextMenuTrigger>First area</div>
                        <div [class]="area" tabindex="0" rdxContextMenuTrigger>Second area</div>
                    </div>
                }
                <ng-template rdxMenuPortal>
                    <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                        <div [class]="cn(m.popup, 'min-w-44!')" rdxMenuPopup>
                            <div [class]="m.item" (onSelect)="selected.set('Open')" rdxMenuItem>Open</div>
                            <div [class]="m.item" (onSelect)="selected.set('Duplicate')" rdxMenuItem>Duplicate</div>
                            <ng-container rdxMenuRoot>
                                <div
                                    [class]="cn(m.item, 'data-[popup-open]:bg-muted justify-between')"
                                    rdxMenuSubTrigger
                                >
                                    Share
                                    <svg class="size-4 shrink-0" lucideChevronRight></svg>
                                </div>
                                <ng-template rdxMenuPortal>
                                    <div
                                        [class]="m.positioner"
                                        side="right"
                                        align="start"
                                        sideOffset="8"
                                        alignOffset="-4"
                                        rdxMenuPositioner
                                    >
                                        <div [class]="cn(m.popup, 'min-w-40!')" rdxMenuPopup>
                                            <div [class]="m.item" (onSelect)="selected.set('Copy link')" rdxMenuItem>
                                                Copy link
                                            </div>
                                            <div
                                                [class]="m.item"
                                                (onSelect)="selected.set('Send by email')"
                                                rdxMenuItem
                                            >
                                                Send by email
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground text-sm">Right-click an area to open the shared menu.</p>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxContextMenuAreasComponent {
    readonly nested = input(false);
    protected readonly selected = signal('none');
    protected readonly cn = cn;
    protected readonly m = demoMenu;
    protected readonly area =
        'border-border text-muted-foreground flex min-h-28 min-w-40 items-center justify-center rounded-md border-2 border-dashed p-4 text-sm select-none focus-visible:outline-2 focus-visible:outline-ring';
}
