import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxCheckboxComponent } from '../src/checkbox';

export default {
    component: RdxCheckboxComponent,
    title: 'Components/Checkbox',
    parameters: {
        controls: {
            exclude: RdxCheckboxComponent
        }
    },
    decorators: [
        moduleMetadata({
            imports: [RdxCheckboxComponent]
        })
    ]
} as Meta<RdxCheckboxComponent>;

type Story = StoryObj<RdxCheckboxComponent>;

export const Default: Story = {
    render: () => ({
        template: `
<div class="light light-theme CheckboxGroupRoot">
    <rdx-checkbox>Check Item</rdx-checkbox>
    <rdx-checkbox></rdx-checkbox>
    <rdx-checkbox></rdx-checkbox>
</div>
`
    })
};
