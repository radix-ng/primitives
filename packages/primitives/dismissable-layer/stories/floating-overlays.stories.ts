import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FloatingOverlaysExplainer } from './floating-overlays';
import explainerSource from './floating-overlays?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Utilities/Floating Overlays',
    decorators: [
        moduleMetadata({ imports: [FloatingOverlaysExplainer] }),
        // The explainer is a full-page article, not a centered widget, so it uses its own auto-height
        // wrapper instead of the shared `tailwindDemoDecorator` (whose fixed 500px frame would clip it).
        // `data-demo="tailwind"` is kept on the outermost container so the Tailwind reset + theme
        // variables still apply.
        componentWrapperDecorator(
            (story) => html`
                <div class="bg-background text-foreground w-full p-6 sm:p-10" data-demo="tailwind">${story}</div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(explainerSource),
    render: () => ({
        template: html`
            <floating-overlays-explainer />
        `
    })
};
