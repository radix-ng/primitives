import { componentWrapperDecorator } from '@storybook/angular';

const html = String.raw;

export interface TailwindDemoDecoratorOptions {
    size?: 'default' | 'tall';
}

export const tailwindDemoDecorator = (
    options: TailwindDemoDecoratorOptions = {}
): ReturnType<typeof componentWrapperDecorator> => {
    const sizing =
        options.size === 'tall'
            ? 'min-h-[760px] items-start justify-center gap-6 p-6'
            : 'h-[500px] items-center justify-center gap-20 p-8';

    return componentWrapperDecorator(
        (story) => html`
            <div
                class="border-border bg-background text-foreground ${sizing} flex rounded-xl border"
                data-demo="tailwind"
            >
                ${story}
            </div>
        `
    );
};
