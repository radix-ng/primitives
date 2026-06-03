import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { EditableAutoResizeExample } from './editable-auto-resize';
import autoResizeSource from './editable-auto-resize?raw';
import { EditableDefaultExample } from './editable-default';
import defaultSource from './editable-default?raw';
import { EditableDoubleClickExample } from './editable-double-click';
import doubleClickSource from './editable-double-click?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Primitives/Editable',
    decorators: [
        moduleMetadata({
            imports: [EditableDefaultExample, EditableDoubleClickExample, EditableAutoResizeExample]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <editable-default-example />
        `
    })
};

export const DoubleClick: Story = {
    parameters: source(doubleClickSource),
    render: () => ({
        template: html`
            <editable-double-click-example />
        `
    })
};

export const AutoResize: Story = {
    parameters: source(autoResizeSource),
    render: () => ({
        template: html`
            <editable-auto-resize-example />
        `
    })
};
