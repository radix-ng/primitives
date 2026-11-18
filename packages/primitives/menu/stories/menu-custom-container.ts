import { Component, ElementRef, signal, viewChild } from '@angular/core';
import {
    RdxMenuGroup,
    RdxMenuGroupLabel,
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-custom-container',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuGroup,
        RdxMenuGroupLabel
    ],
    template: `
        <div class="flex w-80 flex-col gap-4">
            <button class="demo-button demo-button-outline h-9 px-4" (click)="showTarget.update(toggle)">
                {{ showTarget() ? 'Remove container' : 'Create container' }}
            </button>
            <ng-container [modal]="false" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Actions</button>
                <ng-template [container]="target()?.nativeElement ?? null" rdxMenuPortal>
                    <div class="z-50 data-[closed]:pointer-events-none" sideOffset="4" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            <div rdxMenuGroup>
                                <div
                                    class="demo-menu-group-label px-2 py-1.5"
                                    id="custom-commands-label"
                                    rdxMenuGroupLabel
                                >
                                    Commands
                                </div>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    (onSelect)="selected.set('Edit')"
                                    rdxMenuItem
                                >
                                    Edit
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    (onSelect)="selected.set('Duplicate')"
                                    rdxMenuItem
                                >
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
    readonly showTarget = signal(false);
    readonly target = viewChild<ElementRef<HTMLElement>>('portalTarget');
    readonly selected = signal('none');
    readonly toggle = (value: boolean) => !value;
}
