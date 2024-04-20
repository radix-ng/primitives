import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ProgressIndicatorDirective } from '../src/progress-indicator.directive';
import { ProgressDirective } from '../src/progress.directive';

export default {
    title: 'Primitives/Progress',
    decorators: [
        moduleMetadata({
            imports: [ProgressDirective, ProgressIndicatorDirective]
        }),
        componentWrapperDecorator(
            (story) =>
                `<div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ],
    argTypes: {
        progress: {
            options: ['10', '30', '70', '95'],
            control: { type: 'select' }
        }
    }
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    args: {
        progress: 70
    },
    render: (args) => ({
        props: args,
        template: `
<style>
.ProgressRoot {
  position: relative;
  overflow: hidden;
  background: var(--black-a9);
  border-radius: 99999px;
  width: 300px;
  height: 25px;

  /* Fix overflow clipping in Safari */
  /* https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0 */
  transform: translateZ(0);
}

.ProgressIndicator {
  background-color: white;
  width: 100%;
  height: 100%;
  transition: transform 660ms cubic-bezier(0.65, 0, 0.35, 1);
}
</style>

<div rdxProgress [rdxProgressValue]="progress" class="ProgressRoot">
    <div rdxProgressIndicator
        [style.transform]="'translateX(-' + (100 - progress) +'%)'"
        class="ProgressIndicator"
    ></div>
</div>

`
    })
};
