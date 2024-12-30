import { provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule, MountainSnow, X } from 'lucide-angular';
import { RdxHoverCardModule } from '../index';
import { RdxTooltipAnchorComponent } from './hover-card-anchor.component';
import { RdxTooltipAnimationsComponent } from './hover-card-animations.component';
import { RdxTooltipDefaultComponent } from './hover-card-default.component';
import { RdxTooltipEventsComponent } from './hover-card-events.components';
import { RdxTooltipInitiallyOpenComponent } from './hover-card-initially-open.component';
import { RdxTooltipMultipleComponent } from './hover-card-multiple.component';
import { RdxTooltipPositioningComponent } from './hover-card-positioning.component';
import { RdxTooltipTriggeringComponent } from './hover-card-triggering.component';

const html = String.raw;

export default {
    title: 'Primitives/Tooltip',
    decorators: [
        moduleMetadata({
            imports: [
                RdxHoverCardModule,
                RdxTooltipDefaultComponent,
                RdxTooltipEventsComponent,
                RdxTooltipPositioningComponent,
                RdxTooltipTriggeringComponent,
                RdxTooltipMultipleComponent,
                RdxTooltipAnimationsComponent,
                RdxTooltipInitiallyOpenComponent,
                RdxTooltipAnchorComponent,
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
            <rdx-tooltip-default></rdx-tooltip-default>
        `
    })
};

export const Multiple: Story = {
    render: () => ({
        template: html`
            <rdx-tooltip-multiple></rdx-tooltip-multiple>
        `
    })
};

export const Events: Story = {
    render: () => ({
        template: html`
            <rdx-tooltip-events></rdx-tooltip-events>
        `
    })
};

export const Positioning: Story = {
    render: () => ({
        template: html`
            <rdx-tooltip-positioning></rdx-tooltip-positioning>
        `
    })
};

export const ExternalTriggering: Story = {
    render: () => ({
        template: html`
            <rdx-tooltip-triggering></rdx-tooltip-triggering>
        `
    })
};

export const Anchor: Story = {
    render: () => ({
        template: html`
            <rdx-tooltip-anchor></rdx-tooltip-anchor>
        `
    })
};

export const InitiallyOpen: Story = {
    render: () => ({
        template: html`
            <rdx-tooltip-initially-open></rdx-tooltip-initially-open>
        `
    })
};

export const Animations: Story = {
    render: () => ({
        template: html`
            <rdx-tooltip-animations></rdx-tooltip-animations>
        `
    })
};
