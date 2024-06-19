import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { RdxCollapsibleExternalTriggeringComponent } from './collapsible-external-triggering.component';

export default {
    component: RdxCollapsibleExternalTriggeringComponent,
    title: 'Primitives/Collapsible/External Triggering',
    parameters: {
        controls: {
            exclude: RdxCollapsibleExternalTriggeringComponent
        }
    },
    decorators: [
        moduleMetadata({
            imports: [RdxCollapsibleExternalTriggeringComponent]
        })
    ]
} as Meta<RdxCollapsibleExternalTriggeringComponent>;

type Story = StoryObj<RdxCollapsibleExternalTriggeringComponent>;

export const Default: Story = {
    render: () => ({
        template: `
            <div class="radix-themes light light-theme radix-themes-default-fonts"
                data-accent-color="indigo"
                data-radius="medium"
                data-scaling="100%"
            >
                <rdx-collapsible-external-triggering></rdx-collapsible-external-triggering>
            </div>
        `
    })
};
