import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { menuImports } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-custom-container',
    imports: [menuImports],
    template: `
        <div class="flex w-80 flex-col gap-4">
            <button [class]="cn(b.base, b.outline, b.size.md)" (click)="showTarget.update(toggle)">
                {{ showTarget() ? 'Remove container' : 'Create container' }}
            </button>
            <ng-container [modal]="false" rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Actions</button>
                <ng-template [container]="target()?.nativeElement ?? null" rdxMenuPortal>
                    <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                        <div [class]="m.popup" rdxMenuPopup>
                            <div rdxMenuGroup>
                                <div id="custom-commands-label" [class]="m.groupLabel" rdxMenuGroupLabel>Commands</div>
                                <button [class]="m.item" (onSelect)="selected.set('Edit')" rdxMenuItem>Edit</button>
                                <button [class]="m.item" (onSelect)="selected.set('Duplicate')" rdxMenuItem>
                                    Duplicate
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <output class="text-muted-foreground text-sm">
                {{ target() ? 'Container ready' : 'Waiting for container' }} · Selected: {{ selected() }}
            </output>
            @if (showTarget()) {
                <div #portalTarget data-testid="menu-portal-target"></div>
            }
        </div>
    `
})
export class RdxMenuCustomContainerComponent {
    readonly cn = cn;
    readonly b = demoButton;
    readonly m = demoMenu;
    readonly showTarget = signal(false);
    readonly target = viewChild<ElementRef<HTMLElement>>('portalTarget');
    readonly selected = signal('none');
    readonly toggle = (value: boolean) => !value;
}
