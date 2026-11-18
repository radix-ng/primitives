import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSubTrigger,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-initial-focus',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex w-72 flex-col gap-4">
            <div class="text-foreground grid gap-2 text-sm">
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-first"
                        #firstToggle
                        [checked]="firstDisabled()"
                        (change)="firstDisabled.set(firstToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-first">First item disabled</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-all"
                        #allToggle
                        [checked]="allDisabled()"
                        (change)="allDisabled.set(allToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-all">All items disabled</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-nested"
                        #nestedToggle
                        [checked]="nested()"
                        (change)="nested.set(nestedToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-nested">Nested menu</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-retained"
                        #retainedToggle
                        [checked]="keepMounted()"
                        (change)="keepMounted.set(retainedToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-retained">Keep mounted</label>
                </div>
            </div>
            <ng-container rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Actions</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div class="z-50 data-[closed]:pointer-events-none" sideOffset="4" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            @if (nested()) {
                                <ng-container rdxMenuRoot>
                                    <button
                                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                        [disabled]="allDisabled()"
                                        rdxMenuSubTrigger
                                    >
                                        More commands
                                    </button>
                                    <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                        <div
                                            class="z-50 data-[closed]:pointer-events-none"
                                            side="right"
                                            sideOffset="4"
                                            rdxMenuPositioner
                                        >
                                            <div
                                                class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                                rdxMenuPopup
                                            >
                                                <button
                                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                    [disabled]="firstDisabled() || allDisabled()"
                                                    (onSelect)="selected.set('First child command')"
                                                    rdxMenuItem
                                                >
                                                    First child command
                                                </button>
                                                <button
                                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                    [disabled]="allDisabled()"
                                                    (onSelect)="selected.set('Second child command')"
                                                    rdxMenuItem
                                                >
                                                    Second child command
                                                </button>
                                            </div>
                                        </div>
                                    </ng-template>
                                </ng-container>
                            }
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                [disabled]="firstDisabled() || allDisabled()"
                                (onSelect)="selected.set('First command')"
                                rdxMenuItem
                            >
                                First command
                            </button>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                [disabled]="allDisabled()"
                                (onSelect)="selected.set('Second command')"
                                rdxMenuItem
                            >
                                Second command
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <button class="demo-button demo-button-outline h-9 px-4">After menu</button>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxMenuInitialFocusComponent {
    protected readonly firstDisabled = signal(true);
    protected readonly allDisabled = signal(false);
    protected readonly keepMounted = signal(false);
    protected readonly nested = signal(false);
    protected readonly selected = signal('none');
}
