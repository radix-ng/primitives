import { RdxDropdownMenuDirective } from '@radix-ng/primitives/dropdown-menu';
import { MenuModule } from '@radix-ng/primitives/menu';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule, Menu } from 'lucide-angular';

import { RdxDropdownMenuContentDirective } from '../src/dropdown-menu-content.directive';
import { RdxDropdownMenuItemDirective } from '../src/dropdown-menu-item.directive';
import { RdxDropdownMenuSeparatorDirective } from '../src/dropdown-menu-separator.directive';
import { RdxDropdownMenuTriggerDirective } from '../src/dropdown-menu-trigger.directive';

export default {
    title: 'Primitives/Dropdown Menu [In progress]',
    decorators: [
        moduleMetadata({
            imports: [
                MenuModule,
                RdxDropdownMenuTriggerDirective,
                RdxDropdownMenuItemDirective,
                RdxDropdownMenuSeparatorDirective,
                RdxDropdownMenuContentDirective,
                RdxDropdownMenuDirective,
                LucideAngularModule,
                LucideAngularModule.pick({ Menu })
            ]
        }),
        componentWrapperDecorator(
            (story) => `
                <div class="radix-themes light light-theme radix-themes-default-fonts rt-Flex rt-r-ai-start rt-r-jc-center rt-r-position-relative"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `
<button [DropdownMenuTrigger]="menu"
        sideOffset="4"
        alignOffset="-5"
        class="IconButton" aria-label="Customise options">
    <lucide-angular size="16" name="menu" style="height: 1.2rem;"></lucide-angular>
</button>

<ng-template #menu>
  <div class="DropdownMenuContent" DropdownMenuContent>
    <button class="DropdownMenuItem" DropdownMenuItem>
        New Tab <div class="RightSlot">⌘ T</div>
    </button>
    <button class="DropdownMenuItem" DropdownMenuItem>
        New Window <div class="RightSlot">⌘ N</div>
    </button>
    <button class="DropdownMenuItem" DropdownMenuItem disabled>
        New Incognito Window
    </button>
    <div MenubarSeparator class="DropdownMenuSeparator"></div>
    <button
        class="DropdownMenuSubTrigger"
        DropdownMenuItem
        [DropdownMenuTrigger]="share"
        [side]="'right'"
    >
        Share <div class="RightSlot">></div>
    </button>
    <div MenubarSeparator class="DropdownMenuSeparator"></div>
    <button class="DropdownMenuItem" DropdownMenuItem>
        Print… <div class="RightSlot">⌘ P</div>
    </button>
  </div>
</ng-template>

<ng-template #share>
  <div class="DropdownMenuSubContent" DropdownMenuContent>
    <button class="DropdownMenuItem" DropdownMenuItem>Undo</button>
    <button class="DropdownMenuItem" DropdownMenuItem>Redo</button>
    <div MenubarSeparator class="DropdownMenuSeparator"></div>
    <button class="DropdownMenuItem" DropdownMenuItem>Cut</button>
    <button class="DropdownMenuItem" DropdownMenuItem>Copy</button>
    <button class="DropdownMenuItem" DropdownMenuItem>Paste</button>
  </div>
</ng-template>

<style>
/* reset */
button {
  all: unset;
}

.DropdownMenuContent,
.DropdownMenuSubContent {
  flex-direction: column;
  display: inline-flex;
  min-width: 220px;
  background-color: white;
  border-radius: 6px;
  padding: 5px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  will-change: transform, opacity;
}

.DropdownMenuItem,
.DropdownMenuCheckboxItem,
.DropdownMenuRadioItem,
.DropdownMenuSubTrigger {
  font-size: 13px;
  line-height: 1;
  color: var(--violet-11);
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 25px;
  position: relative;
  padding: 0 5px 0 25px;
  user-select: none;
  outline: none;
}

.DropdownMenuItem:hover {
  background-color: var(--violet-11);
  color: white;
}

.DropdownMenuSeparator {
  height: 1px;
  background-color: var(--violet-6);
  margin: 5px;
}

.IconButton {
  font-family: inherit;
  border-radius: 100%;
  height: 35px;
  width: 35px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--violet-11);
  background-color: white;
  box-shadow: 0 2px 10px var(--black-a7);
}

.DropdownMenuSubTrigger[data-state='open'] {
  background-color: var(--violet-4);
  color: var(--violet-11);
}

.IconButton:hover {
  background-color: var(--violet-3);
}

.IconButton:focus {
  box-shadow: 0 0 0 2px black;
}

.RightSlot {
  margin-left: auto;
  padding-left: 20px;
  color: var(--mauve-9);
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: flex-end;
}

</style>
`
    })
};
