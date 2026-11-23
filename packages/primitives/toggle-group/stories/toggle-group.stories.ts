import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { ToggleGroup } from './toggle-group';
import { ToggleGroupDefaultExample } from './toggle-group-default';
import defaultSource from './toggle-group-default?raw';
import {
    ToggleGroupDisabledExample,
    ToggleGroupDisabledItemExample,
    ToggleGroupMultipleExample
} from './toggle-group-states';
import statesSource from './toggle-group-states?raw';
import controlledSource from './toggle-group?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code: code.trim(), language: 'typescript', type: 'code' } } });

export default {
    title: 'Primitives/Toggle Group',
    decorators: [
        moduleMetadata({
            imports: [
                ToggleGroupMultipleExample,
                ToggleGroupDisabledItemExample,
                ToggleGroupDisabledExample,
                ToggleGroupDefaultExample,
                ToggleGroup
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({ template: '<toggle-group-default-example />' })
};

export const Multiple: Story = {
    parameters: source(statesSource),
    render: () => ({ template: '<toggle-group-multiple-example />' })
};

export const DisabledItem: Story = {
    parameters: source(statesSource),
    render: () => ({ template: '<toggle-group-disabled-item-example />' })
};

export const DisabledGroup: Story = {
    parameters: source(statesSource),
    render: () => ({ template: '<toggle-group-disabled-example />' })
};

export const TwoWayBinding: Story = {
    parameters: source(controlledSource),
    render: () => ({
        template: html`
            <toggle-group />
        `
    })
};
