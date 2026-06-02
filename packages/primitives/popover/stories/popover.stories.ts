import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxPopoverAnimatedComponent } from './popover-animated';
import animatedSource from './popover-animated?raw';
import { RdxPopoverControlledComponent } from './popover-controlled';
import controlledSource from './popover-controlled?raw';
import { RdxPopoverCustomAnchorComponent } from './popover-custom-anchor';
import customAnchorSource from './popover-custom-anchor?raw';
import { RdxPopoverDefaultComponent } from './popover-default';
import defaultSource from './popover-default?raw';
import { RdxPopoverModalComponent } from './popover-modal';
import modalSource from './popover-modal?raw';
import { RdxPopoverPositioningComponent } from './popover-positioning';
import positioningSource from './popover-positioning?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: {
            code,
            language: 'typescript'
        }
    }
});

export default {
    title: 'Primitives/Popover',
    decorators: [
        moduleMetadata({
            imports: [
                RdxPopoverDefaultComponent,
                RdxPopoverControlledComponent,
                RdxPopoverPositioningComponent,
                RdxPopoverAnimatedComponent,
                RdxPopoverModalComponent,
                RdxPopoverCustomAnchorComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <rdx-popover-default />
        `
    })
};

export const Controlled: Story = {
    parameters: source(controlledSource),
    render: () => ({
        template: html`
            <rdx-popover-controlled />
        `
    })
};

export const Positioning: Story = {
    parameters: source(positioningSource),
    render: () => ({
        template: html`
            <rdx-popover-positioning />
        `
    })
};

export const Animated: Story = {
    parameters: source(animatedSource),
    render: () => ({
        template: html`
            <rdx-popover-animated />
        `
    })
};

export const Modal: Story = {
    parameters: source(modalSource),
    render: () => ({
        template: html`
            <rdx-popover-modal />
        `
    })
};

export const CustomAnchor: Story = {
    parameters: source(customAnchorSource),
    render: () => ({
        template: html`
            <rdx-popover-custom-anchor />
        `
    })
};
