import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-pointer',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex max-w-sm flex-col gap-4">
            <p class="text-muted-foreground text-sm">
                Hover to open. Click to keep it open, or hold the mouse button, drag onto a command and release.
            </p>
            <ng-container rdxMenuRoot>
                <button
                    [class]="cn(b.base, b.outline, b.size.md)"
                    [openOnHover]="true"
                    [delay]="180"
                    [closeDelay]="80"
                    rdxMenuTrigger
                >
                    Commands
                </button>
                <div *rdxMenuPortal [class]="m.positioner" sideOffset="8" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" (click)="selected.set('New tab')" rdxMenuItem>New tab</button>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>Unavailable</button>
                        <button [class]="m.item" (click)="selected.set('Save page')" rdxMenuItem>Save page</button>
                    </div>
                </div>
            </ng-container>
            <output class="text-muted-foreground text-sm" aria-live="polite">
                {{ selected() || 'No command selected' }}
            </output>
        </div>
    `
})
export class RdxMenuPointerComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
    protected readonly selected = signal('');
}
