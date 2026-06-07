import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { PresenceExample } from './presence';

export default {
    title: 'Utilities/Presence',
    decorators: [
        moduleMetadata({
            imports: [PresenceExample]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `<presence-example />`
    })
};
