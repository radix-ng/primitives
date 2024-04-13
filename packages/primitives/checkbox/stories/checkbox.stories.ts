import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommonModule } from '@angular/common';

import { CheckboxComponent } from './checkbox.component';
import { BADGE } from '../../.storybook/helpers/bages-config';

export default {
    component: CheckboxComponent,
    title: 'Primitives/Checkbox',
    parameters: {
        badges: [BADGE.SOON]
    },
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
