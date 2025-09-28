import { provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
import { RdxHoverCardModule } from '../index';
import { RdxHoverCardAnchorComponent } from './hover-card-anchor.component';
import { RdxHoverCardAnimationsComponent } from './hover-card-animations.component';
import { RdxHoverCardDefaultComponent } from './hover-card-default.component';
import { RdxHoverCardEventsComponent } from './hover-card-events.components';
import { RdxHoverCardInitiallyOpenComponent } from './hover-card-initially-open.component';
import { RdxHoverCardMultipleComponent } from './hover-card-multiple.component';
import { RdxHoverCardPositioningComponent } from './hover-card-positioning.component';
import { RdxHoverCardTriggeringComponent } from './hover-card-triggering.component';

const html = String.raw;

export default {
    title: 'Primitives/Hover Card',
    decorators: [
        moduleMetadata({
            imports: [
                RdxHoverCardModule,
                RdxHoverCardDefaultComponent,
                RdxHoverCardEventsComponent,
                RdxHoverCardPositioningComponent,
                RdxHoverCardTriggeringComponent,
                RdxHoverCardMultipleComponent,
                RdxHoverCardAnimationsComponent,
                RdxHoverCardInitiallyOpenComponent,
                RdxHoverCardAnchorComponent,
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
            <rdx-hover-card-default></rdx-hover-card-default>
        `
    })
};

export const Multiple: Story = {
    render: () => ({
        template: html`
            <rdx-hover-card-multiple></rdx-hover-card-multiple>
        `
    })
};

export const Events: Story = {
    render: () => ({
        template: html`
            <rdx-hover-card-events></rdx-hover-card-events>
        `
    })
};

export const Positioning: Story = {
    render: () => ({
        template: html`
            <rdx-hover-card-positioning></rdx-hover-card-positioning>
        `
    })
};

export const ExternalTriggering: Story = {
    render: () => ({
        template: html`
            <rdx-hover-card-triggering></rdx-hover-card-triggering>
        `
    })
};

export const Anchor: Story = {
    render: () => ({
        template: html`
            <rdx-hover-card-anchor></rdx-hover-card-anchor>
        `
    })
};

export const InitiallyOpen: Story = {
    render: () => ({
        template: html`
            <rdx-hover-card-initially-open></rdx-hover-card-initially-open>
        `
    })
};

export const Animations: Story = {
    render: () => ({
        template: html`
            <rdx-hover-card-animations></rdx-hover-card-animations>
        `
    })
};
