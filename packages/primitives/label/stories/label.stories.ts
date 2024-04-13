import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LabelDirective } from '../src/label.directive';
import { CommonModule } from '@angular/common';

export default {
    component: LabelDirective,
    title: 'Primitives/Label',
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
  background-color: color(display-p3 0 0 0/0.3);
  box-shadow: 0 0 0 1px color(display-p3 0 0 0/0.7);
}

label {
    color: white;
    font-size: 15px;
    line-height: 35px;
    font-weight: 500;
}
</style>

<label rdxLabel >First Name </label>
<input type="text" class="Input" id="uniqId" />

`
    })
};
