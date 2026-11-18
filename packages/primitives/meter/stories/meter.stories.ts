import {
    RdxMeterIndicatorDirective,
    RdxMeterLabelDirective,
    RdxMeterRootDirective,
    RdxMeterTrackDirective,
    RdxMeterValueDirective
} from '@radix-ng/primitives/meter';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { MeterAriaValueTextStory } from './meter-aria-value-text-example';
import ariaValueTextPortableSource from './meter-aria-value-text-example?raw';
import { MeterCustomRangeStory } from './meter-custom-range-example';
import customRangePortableSource from './meter-custom-range-example?raw';

import { MeterStorageComponent } from './meter';
import storageSource from './meter?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Primitives/Meter',
    decorators: [
        moduleMetadata({
            imports: [
                MeterCustomRangeStory,
                MeterAriaValueTextStory,
                RdxMeterRootDirective,
                RdxMeterLabelDirective,
                RdxMeterValueDirective,
                RdxMeterTrackDirective,
                RdxMeterIndicatorDirective,
                MeterStorageComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(storageSource),
    render: () => ({
        template: html`
            <meter-storage />
        `
    })
};

export const CustomRange: Story = {
    parameters: source(customRangePortableSource),
    render: () => ({
        template: html`
            <rdx-meter-custom-range-example />
        `
    })
};

export const AriaValueText: Story = {
    parameters: source(ariaValueTextPortableSource),
    render: () => ({
        template: html`
            <rdx-meter-aria-value-text-example />
        `
    })
};
