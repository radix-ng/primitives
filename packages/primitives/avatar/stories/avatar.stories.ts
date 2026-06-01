import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxAvatarFallbackDirective } from '../src/avatar-fallback.directive';
import { RdxAvatarImageDirective } from '../src/avatar-image.directive';
import { RdxAvatarRootDirective } from '../src/avatar-root.directive';
import {
    RdxAvatarDelayComponent,
    RdxAvatarDemoComponent,
    RdxAvatarFallbackComponent,
    RdxAvatarSizesComponent
} from './avatar';

const html = String.raw;

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
    render: () => ({
        template: html`
            <rdx-avatar-demo />
        `
    })
};

export const Sizes: Story = {
    render: () => ({
        template: html`
            <rdx-avatar-sizes />
        `
    })
};

export const Fallback: Story = {
    render: () => ({
        template: html`
            <rdx-avatar-fallback />
        `
    })
};

export const DelayedFallback: Story = {
    render: () => ({
        template: html`
            <rdx-avatar-delay />
        `
    })
};
