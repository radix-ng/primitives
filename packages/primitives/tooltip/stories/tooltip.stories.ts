import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { radixPlus } from '@ng-icons/radix-icons';
import { TooltipTriggerDirective } from '../src/tooltip-trigger.directive';
import { TooltipDirective } from '../src/tooltip.directive';
import { TooltipArrowDirective } from '../src/tooltip-arrow.directive';

export default {
    title: 'Primitives/Tooltip',
    decorators: [
        moduleMetadata({
            imports: [
                NgIconComponent,
                TooltipTriggerDirective,
                TooltipDirective,
                TooltipArrowDirective
            ],
            providers: [provideIcons({ radixPlus })]
        }),
        componentWrapperDecorator(
            (story) =>
                `<div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `
<style>


/* reset */
button {
  all: unset;
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
.IconButton:hover {
  background-color: var(--violet-3);
}
.IconButton:focus {
  box-shadow: 0 0 0 2px black;
}

.TooltipContent {
  border-radius: 4px;
  padding: 10px 15px;
  font-size: 15px;
  line-height: 1;
  color: var(--violet-11);
  background-color: white;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  user-select: none;
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}
</style>
        <button class="IconButton">
            <ng-icon name="radixPlus" />
        </button>
`
    })
};
