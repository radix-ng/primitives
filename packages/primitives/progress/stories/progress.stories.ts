import {
    RdxProgressIndicatorDirective,
    RdxProgressLabelDirective,
    RdxProgressRootDirective,
    RdxProgressTrackDirective,
    RdxProgressValueDirective
} from '@radix-ng/primitives/progress';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { ProgressCustomRangeStory } from './progress-custom-range-example';
import customRangePortableSource from './progress-custom-range-example?raw';
import { ProgressIndeterminateStory } from './progress-indeterminate-example';
import indeterminatePortableSource from './progress-indeterminate-example?raw';

import { ProgressCircularComponent } from './progress-circular';
import circularSource from './progress-circular?raw';
import { ProgressLinearComponent } from './progress-linear';
import linearSource from './progress-linear?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Primitives/Progress',
    decorators: [
        moduleMetadata({
            imports: [
                ProgressIndeterminateStory,
                ProgressCustomRangeStory,
                RdxProgressRootDirective,
                RdxProgressLabelDirective,
                RdxProgressValueDirective,
                RdxProgressTrackDirective,
                RdxProgressIndicatorDirective,
                ProgressCircularComponent,
                ProgressLinearComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(linearSource),
    render: () => ({
        template: html`
            <progress-linear />
        `
    })
};

export const Indeterminate: Story = {
    parameters: source(indeterminatePortableSource),
    render: () => ({
        template: html`
            <rdx-progress-indeterminate-example />
        `
    })
};

export const CustomRange: Story = {
    parameters: source(customRangePortableSource),
    render: () => ({
        template: html`
            <rdx-progress-custom-range-example />
        `
    })
};

export const Circular: Story = {
    parameters: source(circularSource),
    render: () => ({
        template: html`
            <progress-circular />
        `
    })
};
