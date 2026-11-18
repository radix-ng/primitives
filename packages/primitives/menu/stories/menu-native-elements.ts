import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuLinkItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-native-elements',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuLinkItem
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex flex-col items-center gap-4">
            <ng-container rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Actions</button>
                <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                    <div
                        class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            (click)="selected.set('Button command')"
                            rdxMenuItem
                        >
                            Button command
                        </button>
                        <!-- RdxMenuItem supplies role, roving tabindex and keyboard activation. -->
                        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
                        <div
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            (click)="selected.set('Custom command')"
                            rdxMenuItem
                        >
                            Custom command
                        </div>
                        <a
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            (click)="selected.set('Open section')"
                            href="#menu-native-target"
                            rdxMenuLinkItem
                        >
                            Open section
                        </a>
                    </div>
                </div>
            </ng-container>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
            <p class="text-muted-foreground text-sm" id="menu-native-target">Link destination</p>
        </div>
    `
})
export class RdxMenuNativeElementsComponent {
    protected readonly selected = signal('none');
}
