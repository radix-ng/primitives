import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommonModule } from '@angular/common';

import { CheckboxComponent } from './checkbox.component';

export default {
    component: CheckboxComponent,
    title: 'Checkbox',
    decorators: [
        moduleMetadata({
            imports: [CheckboxComponent, CommonModule]
        })
    ]
} as Meta<CheckboxComponent>;

type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {
    render: () => ({
        template: `
        <rdx-checkbox></rdx-checkbox>

`
    })
};
