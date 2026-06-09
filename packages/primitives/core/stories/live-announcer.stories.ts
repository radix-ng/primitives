import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { LiveAnnouncerExample } from './live-announcer';
import liveAnnouncerSource from './live-announcer?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Utilities/LiveAnnouncer',
    decorators: [
        moduleMetadata({
            imports: [LiveAnnouncerExample]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(liveAnnouncerSource),
    render: () => ({
        template: html`
            <live-announcer-example />
        `
    })
};
