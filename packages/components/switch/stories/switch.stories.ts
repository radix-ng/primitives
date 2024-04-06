import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommonModule } from '@angular/common';

import { SwitchComponent } from './switch.component';

export default {
    component: SwitchComponent,
    title: 'Switch',
    decorators: [
        moduleMetadata({
            imports: [SwitchComponent, CommonModule]
        })
    ]
} as Meta<SwitchComponent>;

type Story = StoryObj<SwitchComponent>;

export const Default: Story = {
    render: (args) => ({
        template: `
        <kbq-switch></kbq-switch>
        `
    })
};
