import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { NotificationDropdownExample } from './notification-dropdown';
import notificationDropdownSource from './notification-dropdown?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: {
            code,
            language: 'typescript'
        }
    }
});

export default {
    title: 'Recipes/Notification Dropdown',
    decorators: [moduleMetadata({ imports: [NotificationDropdownExample] }), tailwindDemoDecorator()]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(notificationDropdownSource),
    render: () => ({
        template: html`
            <notification-dropdown-example />
        `
    })
};
