import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { PresenceStoryComponent } from './presence-story.componen';

export default {
    title: 'Primitives/Presence',
    decorators: [
        moduleMetadata({
            imports: [PresenceStoryComponent]
        }),
        componentWrapperDecorator(
            (story) =>
                `<div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: (args) => ({
        props: args,
        template: `
<app-presence></app-presence>

`
    })
};
