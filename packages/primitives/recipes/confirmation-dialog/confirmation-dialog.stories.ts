import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { ConfirmationDialogExample } from './confirmation-dialog';
import confirmationDialogSource from './confirmation-dialog?raw';

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
    title: 'Recipes/Confirmation Dialog',
    decorators: [moduleMetadata({ imports: [ConfirmationDialogExample] }), tailwindDemoDecorator()]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(confirmationDialogSource),
    render: () => ({
        template: html`
            <confirmation-dialog-example />
        `
    })
};
