import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { BadgeDirective } from '../badge.directive';

export default {
    component: BadgeDirective,
    title: 'Badge',
    decorators: [
        moduleMetadata({
            imports: [BadgeDirective]
        })
    ]
} as Meta<BadgeDirective>;

type Story = StoryObj<BadgeDirective>;

export const Default: Story = {
    render: (args) => ({
        props: {
            ...args,
            customStyles: {
                default: {
                    color: 'white',
                    backgroundColor: 'blue',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    width: '100px'
                },
                secondary: {
                    color: 'black',
                    backgroundColor: 'lightgrey',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    width: '100px'
                }
            }
        },
        template: `
<style>

</style>
<div kbqBadge variant="default" [styles]="customStyles">Default Badge</div>

<div kbqBadge variant="secondary" [styles]="customStyles">Default Badge</div>
`
    })
};
