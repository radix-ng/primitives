import { provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
import { RdxTooltipModule } from '../index';
import { RdxTooltipAnchorComponent } from './tooltip-anchor.component';
import { RdxTooltipAnimationsComponent } from './tooltip-animations.component';
import { RdxTooltipDefaultComponent } from './tooltip-default.component';
import { RdxTooltipEventsComponent } from './tooltip-events.components';
import { RdxTooltipInitiallyOpenComponent } from './tooltip-initially-open.component';
import { RdxTooltipMultipleComponent } from './tooltip-multiple.component';
import { RdxTooltipPositioningComponent } from './tooltip-positioning.component';
import { RdxTooltipTriggeringComponent } from './tooltip-triggering.component';

const html = String.raw;

export default {
    title: 'Primitives/Tooltip',
    decorators: [
        moduleMetadata({
            imports: [
                RdxTooltipModule,
                RdxTooltipDefaultComponent,
                RdxTooltipEventsComponent,
                RdxTooltipPositioningComponent,
                RdxTooltipTriggeringComponent,
                RdxTooltipMultipleComponent,
                RdxTooltipAnimationsComponent,
                RdxTooltipInitiallyOpenComponent,
                RdxTooltipAnchorComponent,
                LucideAngularModule
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
