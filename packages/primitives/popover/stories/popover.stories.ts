import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxPopoverAnimatedComponent } from './popover-animated';
import animatedSource from './popover-animated?raw';
import { RdxPopoverControlledComponent } from './popover-controlled';
import { RdxPopoverControlledMultipleComponent } from './popover-controlled-multiple';
import controlledMultipleSource from './popover-controlled-multiple?raw';
import controlledSource from './popover-controlled?raw';
import { RdxPopoverCustomAnchorComponent } from './popover-custom-anchor';
import customAnchorSource from './popover-custom-anchor?raw';
import { RdxPopoverDefaultComponent } from './popover-default';
import defaultSource from './popover-default?raw';
import { RdxPopoverDetachedComponent } from './popover-detached';
import detachedSource from './popover-detached?raw';
import { RdxPopoverHoverComponent } from './popover-hover';
import hoverSource from './popover-hover?raw';
import { RdxPopoverModalComponent } from './popover-modal';
import modalSource from './popover-modal?raw';
import { RdxPopoverPositioningComponent } from './popover-positioning';
import positioningSource from './popover-positioning?raw';
import { RdxPopoverViewportComponent } from './popover-viewport';
import viewportSource from './popover-viewport?raw';

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
                RdxPopoverControlledMultipleComponent,
                RdxPopoverPositioningComponent,
                RdxPopoverAnimatedComponent,
                RdxPopoverModalComponent,
                RdxPopoverCustomAnchorComponent,
                RdxPopoverDetachedComponent,
                RdxPopoverHoverComponent,
                RdxPopoverViewportComponent
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

export const ControlledMultiple: Story = {
    parameters: source(controlledMultipleSource),
    render: () => ({
        template: html`
            <rdx-popover-controlled-multiple />
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

export const Detached: Story = {
    parameters: source(detachedSource),
    render: () => ({
        template: html`
            <rdx-popover-detached />
        `
    })
};

export const Hover: Story = {
    parameters: source(hoverSource),
    render: () => ({
        template: html`
            <rdx-popover-hover />
        `
    })
};

export const Viewport: Story = {
    parameters: source(viewportSource),
    render: () => ({
        template: html`
            <rdx-popover-viewport />
        `
    })
};
