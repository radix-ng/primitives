import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
import {
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemDirective,
    RdxDropdownMenuTriggerDirective
} from '../../dropdown-menu';

import { RdxContextMenuContentDirective } from '../src/context-menu-content.directive';
import { RdxContextMenuItemCheckboxDirective } from '../src/context-menu-item-checkbox.directive';
import { RdxContextMenuItemIndicatorDirective } from '../src/context-menu-item-indicator.directive';
import { RdxContextMenuItemRadioGroupDirective } from '../src/context-menu-item-radio-group.directive';
import { RdxContextMenuItemRadioDirective } from '../src/context-menu-item-radio.directive';
import { RdxContextMenuItemDirective } from '../src/context-menu-item.directive';
import { RdxContextMenuSeparatorDirective } from '../src/context-menu-separator.directive';
import { RdxContextMenuTriggerDirective } from '../src/context-menu-trigger.directive';

export default {
    title: 'Primitives/Context Menu',
    decorators: [
        moduleMetadata({
            imports: [
                RdxContextMenuTriggerDirective,
                RdxDropdownMenuTriggerDirective,
                RdxContextMenuItemDirective,
                RdxDropdownMenuItemDirective,
                RdxContextMenuItemCheckboxDirective,
                RdxContextMenuItemRadioDirective,
                RdxContextMenuItemRadioGroupDirective,
                RdxContextMenuItemIndicatorDirective,
                RdxContextMenuSeparatorDirective,
                RdxContextMenuContentDirective,
                RdxDropdownMenuContentDirective,
                LucideAngularModule
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
<div class="context-menu-trigger"
    [rdxContextMenuTrigger]="menu">
    Right click here
</div>

<ng-template #menu>
  <div class="ContextMenuContent" rdxContextMenuContent>
    <button class="ContextMenuItem" rdxContextMenuItem>
        Back <div class="RightSlot">⌘ + [</div>
    </button>
    <button class="ContextMenuItem" rdxContextMenuItem disabled>
        Forward <div class="RightSlot">⌘ + ]</div>
    </button>
    <button class="ContextMenuItem" rdxContextMenuItem>
        Reload <div class="RightSlot">⌘ + R</div>
    </button>
    <button
        class="ContextMenuItem"
        rdxContextMenuItem
        [rdxDropdownMenuTrigger]="share"
        [side]="'right'"
    >
        More Tools <div class="RightSlot">></div>
    </button>

    <div rdxContextMenuSeparator class="ContextMenuSeparator"></div>

    <button class="ContextMenuItem" rdxContextMenuItemCheckbox [checked]="true">
        <div class="ContextMenuItemIndicator" rdxContextMenuItemIndicator>
            <lucide-icon size="16" name="check"></lucide-icon>
        </div>
        Show Bookmarks <div class="RightSlot">⌘ + B</div>
    </button>
    <button class="ContextMenuItem" rdxContextMenuItemCheckbox>
        <div class="ContextMenuItemIndicator" rdxContextMenuItemIndicator>
            <lucide-icon size="16" name="check"></lucide-icon>
        </div>
        Show Full URLs
    </button>

    <div rdxContextMenuSeparator class="ContextMenuSeparator"></div>

    <div class="ContextMenuLabel" rdxContextMenuLabel>People</div>
    <div class="ContextMenuItemRadioGroup" rdxContextMenuItemRadioGroup [value]="'1'">
        <button class="ContextMenuItem" rdxContextMenuItemRadio [value]="'1'">
            <div class="ContextMenuItemIndicator" rdxContextMenuItemIndicator>
                <lucide-icon size="16" name="dot" strokeWidth="8"></lucide-icon>
            </div>
            Pedro Duarte
        </button>
        <button class="ContextMenuItem" rdxContextMenuItemRadio [value]="'2'">
            <div class="ContextMenuItemIndicator" rdxContextMenuItemIndicator>
                <lucide-icon size="16" name="dot" strokeWidth="8"></lucide-icon>
            </div>
            Colm Tuite
        </button>
    </div>
  </div>
</ng-template>

<ng-template #share>
  <div class="DropdownMenuContent" rdxDropdownMenuContent>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>Undo</button>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>Redo</button>
    <div rdxDropdownMenuSeparator class="DropdownMenuSeparator"></div>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>Cut</button>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>Copy</button>
    <button class="DropdownMenuItem" rdxDropdownMenuItem>Paste</button>
  </div>
</ng-template>

<style>
    .context-menu-trigger {
        display: block;
        border: 2px dashed #fff;
        color: #fff;
        border-radius: 4px;
        font-size: 15px;
        -webkit-user-select: none;
        user-select: none;
        padding: 45px 0;
        width: 300px;
        text-align: center;

      &:focus: {
        outline: none;
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
      },

        &[data-state="open"]: {
            background-color: lightblue;
            /*display: flex;*/
            /*align-items: center;*/
            /*justify-content: center;*/
            /*width: 200vw;*/
            /*height: 200vh;*/
            /*gap: 20;*/
        }
    }
/* reset */
button {
  all: unset;
}

.ContextMenuContent,
.DropdownMenuContent {
  flex-direction: column;
  display: inline-flex;
  min-width: 220px;
  background-color: white;
  border-radius: 6px;
  padding: 5px;
  box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2);
  will-change: transform, opacity;
}

.ContextMenuItem,
.DropdownMenuItem,
.ContextMenuCheckboxItem,
.ContextMenuRadioItem {
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

.ContextMenuItem[data-disabled],
.DropdownMenuItem[data-disabled],
.ContextMenuCheckboxItem[data-disabled],
.ContextMenuRadioItem[data-disabled] {
  color: var(--mauve-8);
  pointer-events: none;
}
.ContextMenuItem[data-highlighted],
.DropdownMenuItem[data-highlighted],
.ContextMenuCheckboxItem[data-highlighted],
.ContextMenuRadioItem[data-highlighted] {
  background-color: var(--violet-9);
  color: var(--violet-1);
}

.DropdownMenuSeparator,
.ContextMenuSeparator {
  height: 1px;
  background-color: var(--violet-6);
  margin: 5px;
}

.ContextMenuLabel {
  padding-left: 25px;
  font-size: 12px;
  line-height: 25px;
  color: var(--mauve-11);
}

.ContextMenuItemIndicator {
  position: absolute;
  left: 4px;
  width: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ContextMenuItemRadioGroup {
  display: flex;
  flex-direction: column;
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
