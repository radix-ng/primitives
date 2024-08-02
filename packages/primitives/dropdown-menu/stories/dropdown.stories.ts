import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Check, LucideAngularModule, Menu } from 'lucide-angular';

import { RdxDropdownMenuContentDirective } from '../src/dropdown-menu-content.directive';
import { RdxDropdownMenuItemCheckboxDirective } from '../src/dropdown-menu-item-checkbox.directive';
import { RdxDropdownMenuItemIndicatorDirective } from '../src/dropdown-menu-item-indicator.directive';
import { RdxDropdownMenuItemDirective } from '../src/dropdown-menu-item.directive';
import { RdxDropdownMenuSeparatorDirective } from '../src/dropdown-menu-separator.directive';
import { RdxDropdownMenuTriggerDirective } from '../src/dropdown-menu-trigger.directive';
import { DropdownMenuItemCheckboxExampleComponent } from './dropdown-menu-item-checkbox.component';

export default {
    title: 'Primitives/Dropdown Menu [In progress]',
    decorators: [
        moduleMetadata({
            imports: [
                RdxDropdownMenuTriggerDirective,
                RdxDropdownMenuItemDirective,
                RdxDropdownMenuItemCheckboxDirective,
                RdxDropdownMenuItemIndicatorDirective,
                RdxDropdownMenuSeparatorDirective,
                RdxDropdownMenuContentDirective,
                LucideAngularModule,
                LucideAngularModule.pick({ Menu, Check }),
                DropdownMenuItemCheckboxExampleComponent
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
<button [rdxDropdownMenuTrigger]="menu"
        sideOffset="4"
        alignOffset="-5"
        class="IconButton" aria-label="Customise options">
    <lucide-angular size="16" name="menu" style="height: 1.2rem;"></lucide-angular>
</button>

<ng-template #menu>
  <div class="DropdownMenuContent" rdxDropdownMenuContent>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>
        New Tab <div class="RightSlot">⌘ T</div>
    </button>
    <button class="DropdownMenuItem" rdxDropdownMenuItem disabled>
        New Window <div class="RightSlot">⌘ N</div>
    </button>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>
        New Incognito Window
    </button>
    <div rdxDropdownMenuSeparator class="DropdownMenuSeparator"></div>
    <div class="DropdownMenuLabel" rdxDropdownMenuLabel>
        Label
    </div>
    <button
        class="DropdownMenuItem DropdownMenuSubTrigger"
        rdxDropdownMenuItem
        [rdxDropdownMenuTrigger]="share"
        [side]="'right'"
    >
        Share <div class="RightSlot">></div>
    </button>
    <div rdxDropdownMenuSeparator class="DropdownMenuSeparator"></div>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>
        Print… <div class="RightSlot">⌘ P</div>
    </button>
  </div>
</ng-template>

<ng-template #share>
  <div class="DropdownMenuSubContent" rdxDropdownMenuContent>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>Undo</button>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>Redo</button>
    <div rdxDropdownMenuSeparator class="DropdownMenuSeparator"></div>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>Cut</button>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>Copy</button>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>Paste</button>
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

.DropdownMenuItem[data-disabled],
.DropdownMenuCheckboxItem[data-disabled],
.DropdownMenuRadioItem[data-disabled] {
  color: var(--mauve-8);
  pointer-events: none;
}
.DropdownMenuItem[data-highlighted],
.DropdownMenuCheckboxItem[data-highlighted],
.DropdownMenuRadioItem[data-highlighted] {
  background-color: var(--violet-9);
  color: var(--violet-1);
}

.DropdownMenuSeparator {
  height: 1px;
  background-color: var(--violet-6);
  margin: 5px;
}

.DropdownMenuLabel {
  padding-left: 25px;
  font-size: 12px;
  line-height: 25px;
  color: var(--mauve-11);
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

.DropdownMenuItemIndicator {
  position: absolute;
  left: 4px;
  width: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

export const DropdownMenuItemCheckbox: Story = {
    name: 'Checkbox',
    render: () => ({
        template: `<dropdown-menu-item-checkbox/>`
    })
};
