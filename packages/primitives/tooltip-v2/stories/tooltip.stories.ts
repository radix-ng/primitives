import { provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule, MountainSnow, X } from 'lucide-angular';
import { RdxPopoverModule } from '../index';
import { RdxPopoverAnchorComponent } from './tooltip-anchor.component';
import { RdxPopoverAnimationsComponent } from './tooltip-animations.component';
import { RdxPopoverDefaultComponent } from './tooltip-default.component';
import { RdxPopoverEventsComponent } from './tooltip-events.components';
import { RdxPopoverInitiallyOpenComponent } from './tooltip-initially-open.component';
import { RdxPopoverMultipleComponent } from './tooltip-multiple.component';
import { RdxPopoverPositioningComponent } from './tooltip-positioning.component';
import { RdxPopoverTriggeringComponent } from './tooltip-triggering.component';

const html = String.raw;

export default {
    title: 'Primitives/Tooltip-v2',
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
                RdxPopoverInitiallyOpenComponent,
                RdxPopoverAnchorComponent,
                LucideAngularModule,
                LucideAngularModule.pick({ MountainSnow, X })
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

export const Anchor: Story = {
    render: () => ({
        template: html`
            <rdx-popover-anchor></rdx-popover-anchor>
        `
    })
};

export const InitiallyOpen: Story = {
    render: () => ({
        template: html`
            <rdx-popover-initially-open></rdx-popover-initially-open>
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
