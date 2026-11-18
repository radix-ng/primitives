import {
    RdxTabsIndicator,
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsPanelPresence,
    RdxTabsRoot,
    RdxTabsTab
} from '@radix-ng/primitives/tabs';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { TabsActivateOnFocusStory } from './tabs-activate-on-focus-example';
import activateOnFocusPortableSource from './tabs-activate-on-focus-example?raw';
import { TabsAnimatedExample } from './tabs-animated';
import animatedSource from './tabs-animated?raw';
import { TabsControlledExample } from './tabs-controlled';
import controlledSource from './tabs-controlled?raw';
import { TabsDefaultStory } from './tabs-default-example';
import defaultPortableSource from './tabs-default-example?raw';
import { TabsDisabledStory } from './tabs-disabled-example';
import disabledPortableSource from './tabs-disabled-example?raw';
import { TabsIndicatorExample } from './tabs-indicator';
import indicatorSource from './tabs-indicator?raw';
import { TabsKeyframesExample } from './tabs-keyframes';
import keyframesSource from './tabs-keyframes?raw';
import { TabsObjectValuesExample } from './tabs-object-values';
import objectValuesSource from './tabs-object-values?raw';
import { TabsProjectedWrapperExample } from './tabs-projected-wrapper';
import projectedWrapperSource from './tabs-projected-wrapper?raw';
import { TabsVerticalStory } from './tabs-vertical-example';
import verticalPortableSource from './tabs-vertical-example?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Primitives/Tabs',
    decorators: [
        moduleMetadata({
            imports: [
                TabsDefaultStory,
                TabsActivateOnFocusStory,
                TabsVerticalStory,
                TabsDisabledStory,
                RdxTabsRoot,
                RdxTabsList,
                RdxTabsTab,
                RdxTabsPanel,
                RdxTabsPanelPresence,
                RdxTabsIndicator,
                TabsIndicatorExample,
                TabsAnimatedExample,
                TabsKeyframesExample,
                TabsProjectedWrapperExample,
                TabsObjectValuesExample,
                TabsControlledExample
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultPortableSource),
    render: () => ({
        template: html`
            <rdx-tabs-default-example />
        `
    })
};

export const ActivateOnFocus: Story = {
    parameters: source(activateOnFocusPortableSource),
    render: () => ({
        template: html`
            <rdx-tabs-activate-on-focus-example />
        `
    })
};

export const Vertical: Story = {
    parameters: source(verticalPortableSource),
    render: () => ({
        template: html`
            <rdx-tabs-vertical-example />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledPortableSource),
    render: () => ({
        template: html`
            <rdx-tabs-disabled-example />
        `
    })
};

export const Indicator: Story = {
    parameters: source(indicatorSource),
    render: () => ({
        template: html`
            <tabs-indicator-example />
        `
    })
};

export const Animated: Story = {
    parameters: source(animatedSource),
    render: () => ({
        template: html`
            <tabs-animated-example />
        `
    })
};

export const KeyframeUnmount: Story = {
    parameters: source(keyframesSource),
    render: () => ({
        template: html`
            <tabs-keyframes-example />
        `
    })
};

export const ProjectedThroughWrapper: Story = {
    parameters: source(projectedWrapperSource),
    render: () => ({
        template: html`
            <tabs-projected-wrapper-example />
        `
    })
};

export const ObjectValues: Story = {
    parameters: source(objectValuesSource),
    render: () => ({
        template: html`
            <tabs-object-values-example />
        `
    })
};

export const Controlled: Story = {
    parameters: source(controlledSource),
    render: () => ({
        template: html`
            <tabs-controlled-example />
        `
    })
};
