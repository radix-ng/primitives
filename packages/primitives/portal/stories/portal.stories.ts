import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxPortal } from '../src/portal';

const html = String.raw;

export default {
    title: 'Utilities/Portal',
    decorators: [
        moduleMetadata({
            imports: [RdxPortal]
        })
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <section class="font-sans">
                <div
                    class="relative h-40 w-80 overflow-hidden rounded-lg border-2 border-dashed border-violet-500 p-4 text-white"
                >
                    <h3 class="mb-2 font-semibold">Clipping box</h3>
                    <p>
                        This box has
                        <code>overflow: hidden</code>
                        . The badge is declared
                        <strong>inside</strong>
                        it, but
                        <code>rdxPortal</code>
                        moves it to
                        <code>document.body</code>
                        , so it escapes the clipping and pins to the viewport corner.
                    </p>

                    <div
                        class="fixed right-4 top-4 z-[1000] rounded-full bg-violet-500 px-4 py-2.5 font-semibold text-white shadow-lg"
                        rdxPortal
                    >
                        📦 Portaled to &lt;body&gt;
                    </div>
                </div>
            </section>
        `
    })
};

export const CustomContainer: Story = {
    render: () => ({
        template: html`
            <section class="flex gap-4 font-sans">
                <div class="min-h-[120px] flex-1 rounded-lg border-2 border-dashed border-white/40 p-4 text-white">
                    <h3 class="mb-2 font-semibold">Source</h3>
                    <p>The pill below is declared here…</p>

                    <!-- Resolved against the document via a CSS selector -->
                    <div
                        class="mt-3 inline-block rounded-full bg-green-500 px-3.5 py-2 font-semibold text-green-950"
                        container="#portal-target"
                        rdxPortal
                    >
                        🎯 …but rendered into the target container
                    </div>
                </div>

                <div
                    class="min-h-[120px] flex-1 rounded-lg border-2 border-dashed border-green-500 p-4 text-white"
                    id="portal-target"
                >
                    <h3 class="mb-2 font-semibold">Target (#portal-target)</h3>
                </div>
            </section>
        `
    })
};
