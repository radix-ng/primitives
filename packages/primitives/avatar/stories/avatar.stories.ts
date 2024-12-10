import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxAvatarFallbackDirective } from '../src/avatar-fallback.directive';
import { RdxAvatarImageDirective } from '../src/avatar-image.directive';
import { RdxAvatarRootDirective } from '../src/avatar-root.directive';

const html = String.raw;

export default {
    title: 'Primitives/Avatar',
    decorators: [
        moduleMetadata({
            imports: [RdxAvatarRootDirective, RdxAvatarImageDirective, RdxAvatarFallbackDirective]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}

                    <style>
                        .AvatarRoot {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            vertical-align: middle;
                            overflow: hidden;
                            user-select: none;
                            width: 45px;
                            height: 45px;
                            border-radius: 100%;
                            background-color: var(--black-a3);
                        }

                        .AvatarImage {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            border-radius: inherit;
                        }

                        .AvatarFallback {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background-color: white;
                            color: var(--violet-11);
                            font-size: 15px;
                            line-height: 1;
                            font-weight: 500;
                        }
                    </style>
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div style=" display: flex; gap: 20px">
                <span class="AvatarRoot" rdxAvatarRoot>
                    <img
                        class="AvatarImage"
                        rdxAvatarImage
                        src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                        alt="Colm Tuite"
                    />
                    <span class="AvatarFallback" rdxAvatarFallback [delayMs]="600">CT</span>
                </span>

                <span class="AvatarRoot" rdxAvatarRoot>
                    <img
                        class="AvatarImage"
                        rdxAvatarImage
                        src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80"
                        alt="Pedro Duarte"
                    />
                    <span class="AvatarFallback" rdxAvatarFallback [delayMs]="600">JD</span>
                </span>
                <span class="AvatarRoot" rdxAvatarRoot>
                    <span class="AvatarFallback" rdxAvatarFallback>PD</span>
                </span>
            </div>
        `
    })
};
