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
            <section class="portal-demo">
                <div class="portal-demo__box">
                    <h3>Clipping box</h3>
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

                    <div class="portal-demo__badge" rdxPortal>📦 Portaled to &lt;body&gt;</div>
                </div>
            </section>

            <style>
                .portal-demo {
                    font-family: sans-serif;
                }
                .portal-demo__box {
                    position: relative;
                    width: 320px;
                    height: 160px;
                    padding: 16px;
                    overflow: hidden;
                    border: 2px dashed #8b5cf6;
                    border-radius: 8px;
                    color: #e5e7eb;
                }
                .portal-demo__box h3 {
                    margin: 0 0 8px;
                }
                .portal-demo__badge {
                    position: fixed;
                    top: 16px;
                    right: 16px;
                    z-index: 1000;
                    padding: 10px 16px;
                    border-radius: 9999px;
                    background: #8b5cf6;
                    color: #fff;
                    font-weight: 600;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
                }
            </style>
        `
    })
};

export const CustomContainer: Story = {
    render: () => ({
        template: html`
            <section class="portal-demo">
                <div class="portal-demo__panel">
                    <h3>Source</h3>
                    <p>The pill below is declared here…</p>

                    <!-- Resolved against the document via a CSS selector -->
                    <div class="portal-demo__pill" container="#portal-target" rdxPortal>
                        🎯 …but rendered into the target container
                    </div>
                </div>

                <div class="portal-demo__panel portal-demo__panel--target" id="portal-target">
                    <h3>Target (#portal-target)</h3>
                </div>
            </section>

            <style>
                .portal-demo {
                    display: flex;
                    gap: 16px;
                    font-family: sans-serif;
                }
                .portal-demo__panel {
                    flex: 1;
                    min-height: 120px;
                    padding: 16px;
                    border: 2px dashed #6b7280;
                    border-radius: 8px;
                    color: #e5e7eb;
                }
                .portal-demo__panel--target {
                    border-color: #22c55e;
                }
                .portal-demo__panel h3 {
                    margin: 0 0 8px;
                }
                .portal-demo__pill {
                    display: inline-block;
                    margin-top: 12px;
                    padding: 8px 14px;
                    border-radius: 9999px;
                    background: #22c55e;
                    color: #052e16;
                    font-weight: 600;
                }
            </style>
        `
    })
};
