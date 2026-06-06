import { Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

const LINKS = [
    'Home',
    'Discover',
    'Library',
    'Downloads',
    'Playlists',
    'Artists',
    'Albums',
    'Podcasts',
    'Settings',
    'Account',
    'Help & feedback',
    'About'
];

@Component({
    selector: 'rdx-drawer-scrollable',
    imports: [...drawerImports],
    template: `
        <div rdxDrawerRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open menu</button>

            <ng-template rdxDrawerPortalPresence>
                <div [class]="d.portalAnimated" rdxDrawerPortal>
                    <div [class]="d.backdrop" rdxDrawerBackdrop></div>

                    <div [class]="cn(d.popup, d.side.bottom, 'h-[70vh]')" rdxDrawerPopup>
                        <div [class]="d.grip" aria-hidden="true"></div>

                        <!-- Header stays put: a swipe started here always dismisses. -->
                        <div class="border-border border-b px-6 py-3">
                            <h2 [class]="d.title" rdxDrawerTitle>Navigation</h2>
                            <p [class]="d.description" rdxDrawerDescription>
                                Scroll the list; the drawer only swipes away once the list is at the top.
                            </p>
                        </div>

                        <!-- Scroll region: a swipe started here yields to scrolling until at the edge. -->
                        <nav [class]="d.body" rdxDrawerContent>
                            <ul class="flex flex-col">
                                @for (link of links; track link) {
                                    <li>
                                        <button
                                            [class]="
                                                cn(
                                                    'text-foreground w-full rounded-md px-3 py-3 text-left text-sm',
                                                    'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none'
                                                )
                                            "
                                            rdxDrawerClose
                                        >
                                            {{ link }}
                                        </button>
                                    </li>
                                }
                            </ul>
                        </nav>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerScrollableComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly links = LINKS;
}
