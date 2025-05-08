import { CommonModule } from '@angular/common';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxLabelDirective } from '../src/label.directive';

export default {
    component: RdxLabelDirective,
    title: 'Primitives/Label',
    decorators: [
        moduleMetadata({
            imports: [RdxLabelDirective, CommonModule]
        }),
        componentWrapperDecorator(
            (story) =>
                `<div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ]
} as Meta<RdxLabelDirective>;

type Story = StoryObj<RdxLabelDirective>;

export const Default: Story = {
    render: (args) => ({
        props: {
            ...args
        },
        template: `
<label rdxLabel htmlFor="uniqId">First Name </label>
<input type="text" class="Input" id="uniqId" />

<style>
input {
  all: unset;
}

.Input {
  width: 200px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0 10px;
  margin-left: 10px;
  height: 35px;
  font-size: 15px;
  line-height: 1;
  color: white;
  background-color: var(--black-a5);
  box-shadow: 0 0 0 1px var(--black-a9);
}

.Input:focus {
  box-shadow: 0 0 0 2px black;
}
.Input::selection {
  background-color: var(--black-a9);
  color: white;
}

label {
    color: white;
    font-size: 15px;
    line-height: 35px;
    font-weight: 500;
}
</style>
`
    })
};
