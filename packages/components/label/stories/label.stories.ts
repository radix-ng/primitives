import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LabelDirective } from '../label.directive';
import { StylexClassnameDirective } from '../../core';
import stylex from '@stylexjs/stylex';
import { CommonModule } from '@angular/common';

export default {
    component: LabelDirective,
    title: 'Label',
    decorators: [
        moduleMetadata({
            imports: [LabelDirective, StylexClassnameDirective, CommonModule]
        })
    ]
} as Meta<LabelDirective>;

type Story = StoryObj<LabelDirective>;

const styles = stylex.create({
    label: {
        fontSize: 15,
        lineHeight: 35,
        fontWeight: 700
    }
});

export const Default: Story = {
    render: (args) => ({
        props: {
            ...args,
            styles: styles
        },
        template: `
<style>

input {
  width: 200px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0 10px;
  height: 24px;
  font-size: 15px;
  line-height: 1
}
</style>

    <label kbqLabel [kbqStylexProps]="styles">First Name
        <input type="text" id="uniqId" />
    </label>

`
    })
};
