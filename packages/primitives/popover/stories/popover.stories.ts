import { provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule, MountainSnowIcon, X } from 'lucide-angular';
import { RdxPopoverModule } from '../index';
import { RdxPopoverAnimationsComponent } from './popover-animations.component';
import { RdxPopoverDefaultComponent } from './popover-default.component';
import { RdxPopoverEventsComponent } from './popover-events.components';
import { RdxPopoverMultipleComponent } from './popover-multiple.component';
import { RdxPopoverPositioningComponent } from './popover-positioning.component';
import { RdxPopoverTriggeringComponent } from './popover-triggering.component';

const html = String.raw;

export default {
    title: 'Primitives/Popover',
    decorators: [
        moduleMetadata({
            imports: [
                RdxPopoverModule,
                RdxPopoverDefaultComponent,
                RdxPopoverEventsComponent,
                RdxPopoverPositioningComponent,
                RdxPopoverTriggeringComponent,
                RdxPopoverMultipleComponent,
                RdxPopoverAnimationsComponent,
                LucideAngularModule,
                LucideAngularModule.pick({ MountainSnowIcon, X })
            ],
            providers: [provideAnimations()]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <rdx-popover-default></rdx-popover-default>
        `
    })
};

export const Multiple: Story = {
    render: () => ({
        template: html`
            <rdx-popover-multiple></rdx-popover-multiple>
        `
    })
};

export const Events: Story = {
    render: () => ({
        template: html`
            <rdx-popover-events></rdx-popover-events>
        `
    })
};

export const Positioning: Story = {
    render: () => ({
        template: html`
            <rdx-popover-positioning></rdx-popover-positioning>
        `
    })
};

export const ExternalTriggering: Story = {
    render: () => ({
        template: html`
            <rdx-popover-triggering></rdx-popover-triggering>
        `
    })
};

export const Animations: Story = {
    render: () => ({
        template: html`
            <rdx-popover-animations></rdx-popover-animations>
        `
    })
};
