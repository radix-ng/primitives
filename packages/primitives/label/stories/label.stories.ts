import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxLabelDirective } from '../src/label.directive';
import { CommonModule } from '@angular/common';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

export default {
    component: RdxLabelDirective,
    title: 'Primitives/Label',
    decorators: [
        moduleMetadata({
            imports: [RdxLabelDirective, CommonModule]
        }),
        tailwindDemoDecorator()
    ]
} as Meta<RdxLabelDirective>;

type Story = StoryObj<RdxLabelDirective>;

export const Default: Story = {
    render: (args) => ({
        props: {
            ...args
        },
        template: `
            <div class="flex items-center gap-3">
                <label class="text-foreground text-sm font-medium leading-9" rdxLabel htmlFor="uniqId">First Name</label>
                <input
                    id="uniqId"
                    type="text"
                    class="bg-background text-foreground border-border focus-visible:ring-ring h-9 w-52 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                />
            </div>
        `
    })
};
