import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { cn, demoButton } from '../../storybook/styles';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxButtonDirective } from '../src/button.directive';
import {
    RdxButtonAsLinkComponent,
    RdxButtonDisabledComponent,
    RdxButtonLoadingComponent,
    RdxButtonSizesComponent,
    RdxButtonVariantsComponent
} from './button';

const html = String.raw;

export default {
    title: 'Primitives/Button',
    decorators: [
        moduleMetadata({
            imports: [
                RdxButtonDirective,
                RdxButtonVariantsComponent,
                RdxButtonSizesComponent,
                RdxButtonDisabledComponent,
                RdxButtonAsLinkComponent,
                RdxButtonLoadingComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        props: { cn, b: demoButton },
        template: html`
            <button rdxButton [class]="cn(b.base, b.primary, b.size.md)">Button</button>
        `
    })
};

export const Variants: Story = {
    render: () => ({
        template: html`
            <rdx-button-variants />
        `
    })
};

export const Sizes: Story = {
    render: () => ({
        template: html`
            <rdx-button-sizes />
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        template: html`
            <rdx-button-disabled />
        `
    })
};

export const AsLink: Story = {
    render: () => ({
        template: html`
            <rdx-button-as-link />
        `
    })
};

export const Loading: Story = {
    render: () => ({
        template: html`
            <rdx-button-loading />
        `
    })
};
