import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { MenubarModule } from '../index';

export default {
    title: 'Primitives/Menubar',
    decorators: [
        moduleMetadata({
            imports: [MenubarModule]
        }),
        componentWrapperDecorator(
            (story) => `
                <div class="radix-themes light light-theme radix-themes-default-fonts"
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
<div MenuBarRoot class="MenubarRoot">
  <!-- #docregion file-trigger -->
  <button class="MenubarTrigger" MenuBarItem [MenuBarTrigger]="file">
    File
  </button>
  <button class="MenubarTrigger" MenuBarItem [MenuBarTrigger]="edit">
    Edit
  </button>
</div>

<ng-template #file>
  <div class="MenubarContent" MenuBarContent>
    <button class="MenubarItem" MenuBarItem>New Tab <div class="RightSlot">⌘ T</div></button>
    <button class="MenubarItem" MenuBarItem [MenuBarTrigger]="share">
        Share <div class="RightSlot">></div>
    </button>
    <hr />
    <button class="MenubarItem" MenuBarItem>Open</button>
    <button class="MenubarItem" MenuBarItem>Make a Copy</button>
    <hr />
  </div>
</ng-template>

<ng-template #edit>
  <div class="MenubarContent" MenuBarContent>
    <button class="MenubarItem" MenuBarItem>Undo</button>
    <button class="MenubarItem" MenuBarItem>Redo</button>
    <hr />
    <button class="MenubarItem" MenuBarItem>Cut</button>
    <button class="MenubarItem" MenuBarItem>Copy</button>
    <button class="MenubarItem" MenuBarItem>Paste</button>
  </div>
</ng-template>

<ng-template #share>
  <div class="MenubarContent" MenuBarContent>
    <button class="MenubarItem" MenuBarItem>Undo</button>
    <button class="MenubarItem" MenuBarItem>Redo</button>
    <hr />
    <button class="MenubarItem" MenuBarItem>Cut</button>
    <button class="MenubarItem" MenuBarItem>Copy</button>
    <button class="MenubarItem" MenuBarItem>Paste</button>
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

.MenubarContent,
.MenubarSubContent {
  min-width: 220px;
  background-color: white;
  border-radius: 6px;
  padding: 5px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2);
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

.RightSlot {
  margin-left: auto;
  padding-left: 20px;
  color: var(--mauve-9);
}

</style>
`
    })
};
