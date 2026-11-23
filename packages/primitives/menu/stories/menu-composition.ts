import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { LucideChevronDown, LucideChevronRight } from '@lucide/angular';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'demo-menu',
    template: '<ng-content />',
    hostDirectives: [RdxMenuRoot],
    host: { class: 'contents' }
})
export class DemoMenu {}

@Component({ selector: 'button[demoMenuTrigger]', template: '<ng-content />', hostDirectives: [RdxMenuTrigger] })
export class DemoMenuTrigger {}

@Component({
    selector: 'button[demoMenuItem]',
    template: '<ng-content />',
    hostDirectives: [{ directive: RdxMenuItem, inputs: ['disabled'], outputs: ['onSelect'] }]
})
export class DemoMenuItem {}

@Component({ selector: 'button[demoMenuSubTrigger]', template: '<ng-content />', hostDirectives: [RdxMenuSubTrigger] })
export class DemoMenuSubTrigger {}

@Component({
    selector: 'demo-menu-popup',
    imports: [RdxMenuPortal, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem, RdxMenuSeparator],
    template: `
        <div
            class="z-50 data-[closed]:pointer-events-none"
            *rdxMenuPortal
            [side]="side()"
            align="start"
            sideOffset="6"
            rdxMenuPositioner
        >
            <div
                class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                rdxMenuPopup
            >
                @if (showRefresh()) {
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        (onSelect)="refresh.emit()"
                        rdxMenuItem
                    >
                        Refresh
                    </button>
                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                }
                <ng-content />
            </div>
        </div>
    `
})
export class DemoMenuPopup {
    readonly side = input<'bottom' | 'right'>('bottom');
    readonly showRefresh = input(false);
    readonly refresh = output<void>();
}

@Component({
    selector: 'rdx-menu-composition',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DemoMenu,
        DemoMenuTrigger,
        DemoMenuItem,
        DemoMenuSubTrigger,
        DemoMenuPopup,
        LucideChevronDown,
        LucideChevronRight
    ],
    template: `
        <div class="grid justify-items-center gap-4">
            <demo-menu>
                <button class="demo-button demo-button-outline h-9 px-4" demoMenuTrigger>
                    Menu actions
                    <svg class="size-4" lucideChevronDown></svg>
                </button>
                <demo-menu-popup [showRefresh]="true" (refresh)="selected.set('Refresh')">
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        (onSelect)="selected.set('Rename')"
                        demoMenuItem
                    >
                        Rename
                    </button>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        [disabled]="true"
                        demoMenuItem
                    >
                        Unavailable
                    </button>
                    <demo-menu>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            demoMenuSubTrigger
                        >
                            More options
                            <svg class="size-4" lucideChevronRight></svg>
                        </button>
                        <demo-menu-popup side="right">
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                (onSelect)="selected.set('Export file')"
                                demoMenuItem
                            >
                                Export file
                            </button>
                            <button
                                class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                (onSelect)="selected.set('Duplicate')"
                                demoMenuItem
                            >
                                Duplicate
                            </button>
                        </demo-menu-popup>
                    </demo-menu>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        (onSelect)="selected.set('Remove')"
                        demoMenuItem
                    >
                        Remove
                    </button>
                </demo-menu-popup>
            </demo-menu>
            <output class="text-muted-foreground text-sm">Last action: {{ selected() }}</output>
        </div>
    `
})
export class RdxMenuCompositionComponent {
    readonly selected = signal('None');
}
