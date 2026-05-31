import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxPortal } from '../src/portal';

const html = String.raw;

export default {
    title: 'Utilities/Portal',
    decorators: [
        moduleMetadata({
            imports: [RdxPortal]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <section class="font-sans">
                <div
                    class="border-border bg-card text-card-foreground relative h-48 w-96 overflow-hidden rounded-xl border-2 border-dashed p-5 shadow-sm"
                >
                    <h3 class="text-foreground mb-2 text-sm font-semibold">Clipping box</h3>
                    <p class="text-muted-foreground text-sm leading-6">
                        This box has
                        <code class="border-border bg-muted text-foreground rounded border px-1.5 py-0.5 text-xs">
                            overflow: hidden
                        </code>
                        . The badge is declared
                        <strong>inside</strong>
                        it, but
                        <code class="border-border bg-muted text-foreground rounded border px-1.5 py-0.5 text-xs">
                            rdxPortal
                        </code>
                        moves it to
                        <code class="border-border bg-muted text-foreground rounded border px-1.5 py-0.5 text-xs">
                            document.body
                        </code>
                        , so it escapes the clipping and pins to the viewport corner.
                    </p>

                    <div
                        class="bg-primary text-primary-foreground fixed right-4 top-4 z-[1000] rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg"
                        rdxPortal
                    >
                        Portaled to &lt;body&gt;
                    </div>
                </div>
            </section>
        `
    })
};

export const CustomContainer: Story = {
    render: () => ({
        template: html`
            <section class="flex w-full max-w-3xl gap-4 font-sans">
                <div
                    class="border-border bg-card text-card-foreground min-h-36 flex-1 rounded-xl border-2 border-dashed p-5"
                >
                    <h3 class="text-foreground mb-2 text-sm font-semibold">Source</h3>
                    <p class="text-muted-foreground text-sm leading-6">The pill below is declared here...</p>

                    <!-- Resolved against the document via a CSS selector -->
                    <div
                        class="bg-primary text-primary-foreground mt-3 inline-block rounded-full px-3.5 py-2 text-sm font-semibold shadow-sm"
                        container="#portal-target"
                        rdxPortal
                    >
                        Rendered into the target container
                    </div>
                </div>

                <div
                    class="border-primary bg-card text-card-foreground min-h-36 flex-1 rounded-xl border-2 border-dashed p-5"
                    id="portal-target"
                >
                    <h3 class="text-foreground mb-2 text-sm font-semibold">Target (#portal-target)</h3>
                </div>
            </section>
        `
    })
};
