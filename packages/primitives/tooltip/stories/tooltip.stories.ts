import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxTooltipDefaultComponent } from './tooltip-default';
import defaultSource from './tooltip-default?raw';
import { RdxTooltipDelayComponent } from './tooltip-delay';
import delaySource from './tooltip-delay?raw';
import { RdxTooltipDisabledComponent } from './tooltip-disabled';
import disabledSource from './tooltip-disabled?raw';
import { RdxTooltipProviderComponent } from './tooltip-provider';
import providerSource from './tooltip-provider?raw';
import { RdxTooltipSliderComponent } from './tooltip-slider';
import sliderSource from './tooltip-slider?raw';
import { RdxTooltipTrackCursorComponent } from './tooltip-track-cursor';
import trackCursorSource from './tooltip-track-cursor?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

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
    title: 'Primitives/Tooltip',
    decorators: [
        moduleMetadata({
            imports: [
                RdxTooltipDefaultComponent,
                RdxTooltipProviderComponent,
                RdxTooltipDelayComponent,
                RdxTooltipDisabledComponent,
                RdxTooltipTrackCursorComponent,
                RdxTooltipSliderComponent
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
            <rdx-tooltip-default />
        `
    })
};

export const Provider: Story = {
    parameters: source(providerSource),
    render: () => ({
        template: html`
            <rdx-tooltip-provider />
        `
    })
};

export const Delay: Story = {
    parameters: source(delaySource),
    render: () => ({
        template: html`
            <rdx-tooltip-delay />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledSource),
    render: () => ({
        template: html`
            <rdx-tooltip-disabled />
        `
    })
};

export const TrackCursor: Story = {
    parameters: source(trackCursorSource),
    render: () => ({
        template: html`
            <rdx-tooltip-track-cursor />
        `
    })
};

export const Slider: Story = {
    parameters: source(sliderSource),
    render: () => ({
        template: html`
            <rdx-tooltip-slider />
        `
    })
};
