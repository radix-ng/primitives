import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import {
    SelectAlignedPosition,
    SelectAlignedPositionWithScroll,
    SelectDefault,
    SelectDefaultWithScroll
} from './select';

const html = String.raw;

export default {
    title: 'Primitives/Select2',
    decorators: [
        moduleMetadata({
            imports: [SelectDefault, SelectDefaultWithScroll, SelectAlignedPosition, SelectAlignedPositionWithScroll]
        }),
        tailwindDemoDecorator()
    ],
    argTypes: {
        align: {
            options: ['start', 'center', 'end'],
            control: { type: 'select' }
        },
        sideOffset: {
            control: { type: 'number' }
        }
    }
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    args: {
        disabled: false,
        sideOffset: 5,
        align: 'start'
    },
    render: (args) => ({
        props: args,
        template: html`
            <select-default [align]="align" [sideOffset]="sideOffset" />
        `
    })
};

export const DefaultWithScroll: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <select-default-with-scroll />
        `
    })
};

export const AlignedPosition: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <select-aligned-position />
        `
    })
};

export const AlignedPositionWithScroll: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <select-aligned-position-with-scroll />
        `
    })
};
