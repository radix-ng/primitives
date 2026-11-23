import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxAvatarFallbackDirective } from '../src/avatar-fallback.directive';
import { RdxAvatarImageDirective } from '../src/avatar-image.directive';
import { RdxAvatarRootDirective } from '../src/avatar-root.directive';
import { RdxAvatarDelayComponent, RdxAvatarFallbackComponent, RdxAvatarSizesComponent } from './avatar';
import { RdxAvatarDemoComponent } from './avatar-default';
import defaultSource from './avatar-default?raw';
import variantsSource from './avatar?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code: code.trim(), language: 'typescript', type: 'code' } } });

export default {
    title: 'Primitives/Avatar',
    decorators: [
        moduleMetadata({
            imports: [
                RdxAvatarRootDirective,
                RdxAvatarImageDirective,
                RdxAvatarFallbackDirective,
                RdxAvatarDemoComponent,
                RdxAvatarSizesComponent,
                RdxAvatarFallbackComponent,
                RdxAvatarDelayComponent
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
            <rdx-avatar-demo />
        `
    })
};

export const Sizes: Story = {
    parameters: source(variantsSource),
    render: () => ({
        template: html`
            <rdx-avatar-sizes />
        `
    })
};

export const Fallback: Story = {
    parameters: source(variantsSource),
    render: () => ({
        template: html`
            <rdx-avatar-fallback />
        `
    })
};

export const DelayedFallback: Story = {
    parameters: source(variantsSource),
    render: () => ({
        template: html`
            <rdx-avatar-delay />
        `
    })
};
