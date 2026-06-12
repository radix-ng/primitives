import { Component, signal } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-non-modal',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Non-modal: page scrolling and outside pointer interactions stay enabled while the drawer is open, and
                there is no backdrop.
            </p>

            <div [modal]="false" rdxDrawerRoot>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open non-modal drawer</button>

                <ng-template rdxDrawerPortal>
                    <div [class]="cn(d.popup, d.side.bottom, d.overlayAnimated)" rdxDrawerPopup>
                        <div [class]="d.grip" aria-hidden="true"></div>

                        <div [class]="d.body" rdxDrawerContent>
                            <h2 [class]="d.title" rdxDrawerTitle>Non-modal drawer</h2>
                            <p [class]="d.description" rdxDrawerDescription>
                                Keep interacting with the rest of the page; the counter below still works.
                            </p>

                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="outsideClicks.update((count) => count + 1)">
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxDrawerNonModalComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly outsideClicks = signal(0);
}
