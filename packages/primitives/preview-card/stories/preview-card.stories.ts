import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxPreviewCardControlledMultipleComponent } from './preview-card-controlled-multiple';
import controlledMultipleSource from './preview-card-controlled-multiple?raw';
import { RdxPreviewCardDefaultComponent } from './preview-card-default';
import defaultSource from './preview-card-default?raw';
import { RdxPreviewCardDetachedComponent } from './preview-card-detached';
import detachedSource from './preview-card-detached?raw';
import { RdxPreviewCardPositioningComponent } from './preview-card-positioning';
import positioningSource from './preview-card-positioning?raw';
import { RdxPreviewCardViewportComponent } from './preview-card-viewport';
import viewportSource from './preview-card-viewport?raw';

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
    title: 'Primitives/Preview Card',
    decorators: [
        moduleMetadata({
            imports: [
                RdxPreviewCardDefaultComponent,
                RdxPreviewCardControlledMultipleComponent,
                RdxPreviewCardDetachedComponent,
                RdxPreviewCardPositioningComponent,
                RdxPreviewCardViewportComponent
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
            <rdx-preview-card-default />
        `
    })
};

export const ControlledMultiple: Story = {
    parameters: source(controlledMultipleSource),
    render: () => ({
        template: html`
            <rdx-preview-card-controlled-multiple />
        `
    })
};

export const Detached: Story = {
    parameters: source(detachedSource),
    render: () => ({
        template: html`
            <rdx-preview-card-detached />
        `
    })
};

export const Positioning: Story = {
    parameters: source(positioningSource),
    render: () => ({
        template: html`
            <rdx-preview-card-positioning />
        `
    })
};

export const Viewport: Story = {
    parameters: source(viewportSource),
    render: () => ({
        template: html`
            <rdx-preview-card-viewport />
        `
    })
};
