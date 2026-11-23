import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { ToggleDefaultExample } from './toggle-default';
import defaultSource from './toggle-default?raw';
import { ToggleControlledExample, ToggleDisabledExample, TogglePressedExample } from './toggle-states';
import statesSource from './toggle-states?raw';

const source = (code: string) => ({ docs: { source: { code: code.trim(), language: 'typescript', type: 'code' } } });

export default {
    title: 'Primitives/Toggle',
    decorators: [
        moduleMetadata({
            imports: [TogglePressedExample, ToggleDisabledExample, ToggleControlledExample, ToggleDefaultExample]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({ template: '<toggle-default-example />' })
};

export const Pressed: Story = {
    parameters: source(statesSource),
    render: () => ({ template: '<toggle-pressed-example />' })
};

export const Disabled: Story = {
    parameters: source(statesSource),
    render: () => ({ template: '<toggle-disabled-example />' })
};

export const Controlled: Story = {
    parameters: source(statesSource),
    render: () => ({ template: '<toggle-controlled-example />' })
};
