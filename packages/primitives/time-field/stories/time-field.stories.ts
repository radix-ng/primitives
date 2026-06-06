import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { TimeFieldDefaultExample } from './time-field-default';
import defaultSource from './time-field-default?raw';
import { TimeFieldDisabledExample } from './time-field-disabled';
import disabledSource from './time-field-disabled?raw';
import { TimeFieldGranularityExample } from './time-field-granularity';
import granularitySource from './time-field-granularity?raw';
import { TimeFieldHourCycleExample } from './time-field-hour-cycle';
import hourCycleSource from './time-field-hour-cycle?raw';
import { TimeFieldLocalizationExample } from './time-field-localization';
import localizationSource from './time-field-localization?raw';
import { TimeFieldReadonlyExample } from './time-field-readonly';
import readonlySource from './time-field-readonly?raw';
import { TimeFieldValidationExample } from './time-field-validation';
import validationSource from './time-field-validation?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Primitives/Time Field',
    decorators: [
        moduleMetadata({
            imports: [
                TimeFieldDefaultExample,
                TimeFieldHourCycleExample,
                TimeFieldGranularityExample,
                TimeFieldDisabledExample,
                TimeFieldReadonlyExample,
                TimeFieldValidationExample,
                TimeFieldLocalizationExample
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
            <time-field-default-example />
        `
    })
};

export const HourCycle: Story = {
    parameters: source(hourCycleSource),
    render: () => ({
        template: html`
            <time-field-hour-cycle-example />
        `
    })
};

export const Granularity: Story = {
    parameters: source(granularitySource),
    render: () => ({
        template: html`
            <time-field-granularity-example />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledSource),
    render: () => ({
        template: html`
            <time-field-disabled-example />
        `
    })
};

export const Readonly: Story = {
    parameters: source(readonlySource),
    render: () => ({
        template: html`
            <time-field-readonly-example />
        `
    })
};

export const Validation: Story = {
    parameters: source(validationSource),
    render: () => ({
        template: html`
            <time-field-validation-example />
        `
    })
};

export const Localization: Story = {
    parameters: source(localizationSource),
    render: () => ({
        template: html`
            <time-field-localization-example />
        `
    })
};
