import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { cn, demoButton } from '../../storybook/styles';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxButtonDirective } from '../src/button.directive';
import { RdxButtonAsLinkComponent } from './button-as-link';
import { RdxButtonDisabledComponent } from './button-disabled';
import { RdxButtonLoadingComponent } from './button-loading';
import { RdxButtonSizesComponent } from './button-sizes';
import { RdxButtonVariantsComponent } from './button-variants';

// Full component source for the "Show code" panel (Vite `?raw` import).
import asLinkSource from './button-as-link?raw';
import disabledSource from './button-disabled?raw';
import loadingSource from './button-loading?raw';
import sizesSource from './button-sizes?raw';
import variantsSource from './button-variants?raw';

const source = (code: string) => ({
    docs: {
        source: {
            code: code.trim(),
            language: 'typescript',
            type: 'code'
        }
    }
});

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
    parameters: source(variantsSource),
    render: () => ({
        template: html`
            <rdx-button-variants />
        `
    })
};

export const Sizes: Story = {
    parameters: source(sizesSource),
    render: () => ({
        template: html`
            <rdx-button-sizes />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledSource),
    render: () => ({
        template: html`
            <rdx-button-disabled />
        `
    })
};

export const AsLink: Story = {
    parameters: source(asLinkSource),
    render: () => ({
        template: html`
            <rdx-button-as-link />
        `
    })
};

export const Loading: Story = {
    parameters: source(loadingSource),
    render: () => ({
        template: html`
            <rdx-button-loading />
        `
    })
};
