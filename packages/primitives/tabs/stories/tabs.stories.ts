import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { RdxTabsContentDirective } from '../src/tabs-content.directive';
import { RdxTabsListDirective } from '../src/tabs-list.directive';
import { RdxTabsRootDirective } from '../src/tabs-root.directive';
import { RdxTabsTriggerDirective } from '../src/tabs-trigger.directive';

export default {
    title: 'Primitives/Tabs',
    decorators: [
        moduleMetadata({
            imports: [
                RdxTabsRootDirective,
                RdxTabsListDirective,
                RdxTabsTriggerDirective,
                RdxTabsContentDirective
            ]
        }),
        componentWrapperDecorator(
            (story) =>
                `
                    <div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: (args) => ({
        props: args,
        template: `
<div TabsRoot class="TabsRoot">
    <div TabsList class="TabsList">
        <button TabsTrigger value="tab1" class="TabsTrigger">Tab 1</button>
        <button TabsTrigger value="tab2" class="TabsTrigger">Tab 2</button>
    </div>
    <div TabsContent class="TabsContent" value="tab1">Content 1</div>
    <div TabsContent class="TabsContent" value="tab2">Content 2</div>
</div>

<style>
/* reset */
button,
fieldset,
input {
    all: unset;
}

.TabsRoot {
    display: flex;
    flex-direction: column;
    width: 300px;
    box-shadow: 0 2px 10px var(--black-a4);
}

.TabsList {
    flex-shrink: 0;
    display: flex;
    border-bottom: 1px solid var(--mauve-6);
}

.TabsTrigger {
    font-family: inherit;
    background-color: white;
    padding: 0 20px;
    height: 45px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    line-height: 1;
    color: var(--mauve-11);
    user-select: none;
}
.TabsTrigger:first-child {
    border-top-left-radius: 6px;
}
.TabsTrigger:last-child {
    border-top-right-radius: 6px;
}
.TabsTrigger:hover {
    color: var(--violet-11);
}
.TabsTrigger[data-state='active'] {
    color: var(--violet-11);
    box-shadow:
        inset 0 -1px 0 0 currentColor,
        0 1px 0 0 currentColor;
}
.TabsTrigger:focus {
    position: relative;
    box-shadow: 0 0 0 2px black;
}

.TabsContent {
    flex-grow: 1;
    padding: 20px;
    background-color: white;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    outline: none;
}
.TabsContent:focus {
    box-shadow: 0 0 0 2px black;
}
</style>
`
    })
};
