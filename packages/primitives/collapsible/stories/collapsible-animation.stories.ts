import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';

import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { RdxCollapsibleAnimationComponent } from './collapsible-animation.component';

export default {
    component: RdxCollapsibleAnimationComponent,
    title: 'Primitives/Collapsible/Animation',
    parameters: {
        controls: {
            exclude: RdxCollapsibleAnimationComponent
        }
    },
    decorators: [
        moduleMetadata({
            imports: [RdxCollapsibleAnimationComponent, BrowserAnimationsModule],
            providers: [provideAnimations()]
        })
    ]
} as Meta<RdxCollapsibleAnimationComponent>;

type Story = StoryObj<RdxCollapsibleAnimationComponent>;

export const Default: Story = {
    render: () => ({
        template: `
<div class="radix-themes light light-theme radix-themes-default-fonts"
    data-accent-color="indigo"
    data-radius="medium"
    data-scaling="100%"
>
    <rdx-collapsible-animation></rdx-collapsible-animation>
</div>
`
    })
};
