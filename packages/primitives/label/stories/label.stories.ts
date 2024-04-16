import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LabelDirective } from '../src/label.directive';
import { CommonModule } from '@angular/common';
import { labelExclude } from '../../.docs/utils/storybook';

export default {
    component: LabelDirective,
    title: 'Primitives/Label',
    parameters: {
        controls: {
            exclude: labelExclude
        }
    },
    decorators: [
        moduleMetadata({
            imports: [LabelDirective, CommonModule]
        })
    ]
} as Meta<LabelDirective>;

type Story = StoryObj<LabelDirective>;

export const Default: Story = {
    render: (args) => ({
        props: {
            ...args
        },
        template: `
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

<div class="light light-theme">
    <label rdxLabel htmlFor="uniqId">First Name </label>
    <input type="text" class="Input" id="uniqId" />
</div>
`
    })
};
