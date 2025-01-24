import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Check, Dot, LucideAngularModule } from 'lucide-angular';
import { MenubarModule } from '../index';

const html = String.raw;

export default {
    title: 'Primitives/Menubar',
    decorators: [
        moduleMetadata({
            imports: [MenubarModule, LucideAngularModule, LucideAngularModule.pick({ Check, Dot })]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="radix-themes light light-theme radix-themes-default-fonts rt-Flex rt-r-ai-start rt-r-jc-center rt-r-position-relative"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div class="MenubarRoot" RdxMenuBarRoot>
                <div
                    class="MenubarTrigger"
                    RdxMenuBarItem
                    RdxMenuBarTrigger
                    align="start"
                    sideOffset="5"
                    alignOffset="-3"
                    [menuTriggerFor]="file"
                >
                    File
                </div>
                <div
                    class="MenubarTrigger"
                    align="start"
                    sideOffset="5"
                    alignOffset="-3"
                    RdxMenuBarItem
                    RdxMenuBarTrigger
                    [menuTriggerFor]="edit"
                >
                    Edit
                </div>
                <div
                    class="MenubarTrigger"
                    align="start"
                    sideOffset="5"
                    alignOffset="-3"
                    RdxMenuBarItem
                    RdxMenuBarTrigger
                    [menuTriggerFor]="view"
                >
                    View
                </div>
                <div
                    class="MenubarTrigger"
                    align="start"
                    sideOffset="5"
                    alignOffset="-3"
                    RdxMenuBarItem
                    RdxMenuBarTrigger
                    [menuTriggerFor]="profiles"
                >
                    Profiles
                </div>
            </div>

            <ng-template #file>
                <div class="MenubarContent" RdxMenuBarContent>
                    <div class="MenubarItem" RdxMenuBarItem>
                        New Tab
                        <div class="RightSlot">⌘ T</div>
                    </div>
                    <div class="MenubarItem" RdxMenuBarItem>
                        New Window
                        <div class="RightSlot">⌘ N</div>
                    </div>
                    <div class="MenubarItem" RdxMenuBarItem disabled>New Incognito Window</div>
                    <div class="MenubarSeparator" RdxMenuBarSeparator></div>
                    <div class="MenubarItem" RdxMenuBarItem RdxMenuBarTrigger [menuTriggerFor]="share">
                        Share
                        <div class="RightSlot">></div>
                    </div>
                    <div class="MenubarSeparator" RdxMenuBarSeparator></div>
                    <div class="MenubarItem" RdxMenuBarItem>
                        Print…
                        <div class="RightSlot">⌘ P</div>
                    </div>
                </div>
            </ng-template>

            <ng-template #profiles>
                <div class="MenubarContent" RdxMenuBarContent>
                    <div RdxMenuBarRadioGroup>
                        <div class="MenubarRadioItem inset" RdxMenuBarItemRadio>
                            <lucide-icon
                                class="MenubarItemIndicator"
                                size="16"
                                strokeWidth="5"
                                RdxMenuBarItemIndicator
                                name="dot"
                            />
                            Andy
                        </div>
                        <div class="MenubarRadioItem inset" RdxMenuBarItemRadio checked>
                            <lucide-icon
                                class="MenubarItemIndicator"
                                size="16"
                                strokeWidth="5"
                                RdxMenuBarItemIndicator
                                name="dot"
                            />
                            Luis
                        </div>
                    </div>
                    <div class="MenubarSeparator" RdxMenuBarSeparator></div>
                    <div class="MenubarItem inset" RdxMenuBarItem>Edit</div>
                </div>
            </ng-template>

            <ng-template #view>
                <div class="MenubarContent" RdxMenuBarContent>
                    <div class="MenubarCheckboxItem inset" RdxMenuBarCheckboxItem>
                        <lucide-icon class="MenubarItemIndicator" RdxMenuBarItemIndicator size="16" name="check" />
                        Always Show Bookmarks Bar
                    </div>
                    <div class="MenubarCheckboxItem inset" RdxMenuBarCheckboxItem [checked]="true">
                        <lucide-icon class="MenubarItemIndicator" RdxMenuBarItemIndicator size="16" name="check" />
                        Always Show Full URLs
                    </div>
                    <div class="MenubarSeparator" RdxMenuBarSeparator></div>
                    <div class="MenubarItem inset" RdxMenuBarItem>
                        Reload
                        <div class="RightSlot">⌘ R</div>
                    </div>
                    <div class="MenubarItem inset" RdxMenuBarItem disabled>
                        Force Reload
                        <div class="RightSlot">⇧ ⌘ R</div>
                    </div>
                    <div class="MenubarSeparator" RdxMenuBarSeparator></div>
                    <div class="MenubarItem inset" RdxMenuBarItem>Toggle Fullscreen</div>
                    <div class="MenubarSeparator" RdxMenuBarSeparator></div>
                    <div class="MenubarItem inset" RdxMenuBarItem>Hide Sidebar</div>
                </div>
            </ng-template>

            <ng-template #edit>
                <div class="MenubarContent" RdxMenuBarContent>
                    <div class="MenubarItem" RdxMenuBarItem>
                        Undo
                        <div class="RightSlot">⌘ Z</div>
                    </div>
                    <div class="MenubarItem" RdxMenuBarItem>
                        Redo
                        <div class="RightSlot">⇧ ⌘ Z</div>
                    </div>
                    <div class="MenubarSeparator" RdxMenuBarSeparator></div>
                    <div class="MenubarItem" RdxMenuBarItem>Cut</div>
                    <div class="MenubarItem" RdxMenuBarItem>Copy</div>
                    <div class="MenubarItem" RdxMenuBarItem>Paste</div>
                </div>
            </ng-template>

            <ng-template #share>
                <div class="MenubarSubContent" RdxMenuBarContent>
                    <div class="MenubarItem" RdxMenuBarItem>Undo</div>
                    <div class="MenubarItem" RdxMenuBarItem>Redo</div>
                    <div class="MenubarSeparator" RdxMenuBarSeparator></div>
                    <div class="MenubarItem" RdxMenuBarItem>Cut</div>
                    <div class="MenubarItem" RdxMenuBarItem>Copy</div>
                    <div class="MenubarItem" RdxMenuBarItem>Paste</div>
                </div>
            </ng-template>

            <style>
                /* reset */
                button {
                    all: unset;
                }

                .MenubarRoot {
                    display: flex;
                    background-color: white;
                    padding: 3px;
                    border-radius: 6px;
                    box-shadow: 0 2px 10px var(--black-a7);
                }

                .MenubarTrigger {
                    padding: 8px 12px;
                    outline: none;
                    user-select: none;
                    font-weight: 500;
                    line-height: 1;
                    border-radius: 4px;
                    color: var(--violet-11);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2px;
                }

                .MenubarTrigger[data-highlighted],
                .MenubarTrigger[data-state='open'] {
                    background-color: var(--violet-4);
                }

                .MenubarContent,
                .MenubarSubContent {
                    min-width: 220px;
                    background-color: white;
                    border-radius: 6px;
                    padding: 5px;
                    box-shadow:
                        0px 10px 38px -10px rgba(22, 23, 24, 0.35),
                        0px 10px 20px -15px rgba(22, 23, 24, 0.2);
                    animation-duration: 400ms;
                    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                    will-change: transform, opacity;
                }

                .MenubarItem,
                .MenubarSubTrigger,
                .MenubarCheckboxItem,
                .MenubarRadioItem {
                    all: unset;
                    font-size: 13px;
                    line-height: 1;
                    color: var(--violet-11);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    height: 25px;
                    padding: 0 10px;
                    position: relative;
                    user-select: none;
                }

                .MenubarItem.inset,
                .MenubarSubTrigger.inset,
                .MenubarCheckboxItem.inset,
                .MenubarRadioItem.inset {
                    padding-left: 20px;
                }

                .MenubarItem[data-state='open'],
                .MenubarSubTrigger[data-state='open'] {
                    background-color: var(--violet-4);
                    color: var(--violet-11);
                }

                .MenubarItem[data-highlighted],
                .MenubarSubTrigger[data-highlighted],
                .MenubarCheckboxItem[data-highlighted],
                .MenubarRadioItem[data-highlighted] {
                    background-image: linear-gradient(135deg, var(--violet-9) 0%, var(--violet-10) 100%);
                    color: var(--violet-1);
                }

                .MenubarItem[data-disabled],
                .MenubarSubTrigger[data-disabled],
                .MenubarCheckboxItem[data-disabled],
                .MenubarRadioItem[data-disabled] {
                    color: var(--mauve-8);
                    pointer-events: none;
                }

                .MenubarItemIndicator {
                    position: absolute;
                    left: 0;
                    width: 20px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .MenubarSeparator {
                    height: 1px;
                    background-color: var(--violet-6);
                    margin: 5px;
                }

                .RightSlot {
                    margin-left: auto;
                    padding-left: 20px;
                    color: var(--mauve-9);
                }

                [data-highlighted] > .RightSlot {
                    color: white;
                }

                [data-disabled] > .RightSlot {
                    color: var(--mauve-8);
                }
            </style>
        `
    })
};
