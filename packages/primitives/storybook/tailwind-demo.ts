import { componentWrapperDecorator } from '@storybook/angular';

const html = String.raw;

export const tailwindDemoDecorator = () =>
    componentWrapperDecorator(
        (story) => html`
            <div
                class="border-border bg-background text-foreground flex h-[500px] items-center justify-center gap-20 rounded-xl border p-8"
                data-demo="tailwind"
            >
                ${story}
            </div>
        `
    );
