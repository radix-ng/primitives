import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxRovingFocusGroupDirective } from '../src/roving-focus-group.directive';
import { RdxRovingFocusItemDirective } from '../src/roving-focus-item.directive';
import { RovingFocusEventsComponent } from './roving-focus-events.component';

const html = String.raw;

export default {
    title: 'Primitives/RovingFocus',
    decorators: [
        moduleMetadata({
            imports: [
                RdxRovingFocusGroupDirective,
                RdxRovingFocusItemDirective,
                RovingFocusEventsComponent
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    ${story}

                    <style>
                        h2,
                        p {
                            color: #ffffff;
                        }

                        section {
                            width: 500px;
                        }

                        [rdxRovingFocusGroup] {
                            display: flex;
                            gap: 8px;
                        }

                        [rdxRovingFocusGroup][data-orientation='vertical'] {
                            width: 90px;
                            flex-direction: column;
                        }

                        [rdxRovingFocusGroup][data-orientation='horizontal'] {
                            flex-direction: row;
                        }

                        [rdxRovingFocusItem] {
                            padding: 8px 16px;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            background-color: #f9f9f9;
                            cursor: pointer;
                            transition:
                                background-color 0.2s,
                                transform 0.2s;
                        }

                        [rdxRovingFocusItem]:focus {
                            outline: none;
                            background-color: #007bff;
                            color: white;
                            transform: scale(1.05);
                        }

                        [rdxRovingFocusItem][data-disabled] {
                            cursor: not-allowed;
                            opacity: 0.5;
                            background-color: #f1f1f1;
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
            <section>
                <h2>Horizontal Navigation with Looping</h2>
                <p>
                    Use the ArrowLeft and ArrowRight keys to navigate between buttons. Ensure that when reaching the end
                    of the group, the focus cycles back to the first item (and vice versa).
                </p>
                <div rdxRovingFocusGroup [orientation]="'horizontal'" [loop]="true">
                    <button rdxRovingFocusItem>Item 1</button>
                    <button rdxRovingFocusItem>Item 2</button>
                    <button rdxRovingFocusItem>Item 3</button>
                </div>
            </section>
        `
    })
};

export const HorizontalRTL: Story = {
    render: () => ({
        template: html`
            <section>
                <h2>Horizontal Navigation in RTL Direction</h2>
                <p>
                    Use the ArrowLeft and ArrowRight keys. In RTL direction, the keys should behave inversely
                    (ArrowRight moves to the previous item, and ArrowLeft moves to the next item).
                </p>
                <div rdxRovingFocusGroup [orientation]="'horizontal'" [dir]="'rtl'" [loop]="true">
                    <button rdxRovingFocusItem>Left</button>
                    <button rdxRovingFocusItem>Center</button>
                    <button rdxRovingFocusItem>Right</button>
                </div>
            </section>
        `
    })
};

export const WithHomeAndEnd: Story = {
    render: () => ({
        template: html`
            <section>
                <h2>Navigation with "Home" and "End" Keys</h2>
                <p>
                    Press the Home key to move focus to the first item. Press the End key to move focus to the last
                    item.
                </p>
                <div rdxRovingFocusGroup [orientation]="'horizontal'" [loop]="false">
                    <button rdxRovingFocusItem>Left</button>
                    <button rdxRovingFocusItem>Center</button>
                    <button rdxRovingFocusItem>Right</button>
                </div>
            </section>
        `
    })
};

export const MixedActiveAndInactive: Story = {
    render: () => ({
        template: html`
            <section>
                <h2>Mixed Active and Inactive States</h2>
                <p>Try navigating with arrow keys. Ensure that the inactive item (Disabled) is skipped.</p>
                <div rdxRovingFocusGroup [orientation]="'horizontal'" [loop]="true">
                    <button rdxRovingFocusItem [focusable]="true">Left</button>
                    <button rdxRovingFocusItem [focusable]="false">Center</button>
                    <button rdxRovingFocusItem [focusable]="true">Right</button>
                </div>
            </section>
        `
    })
};

export const VerticalWithoutLooping: Story = {
    render: () => ({
        template: html`
            <section>
                <h2>Vertical Navigation without Looping</h2>
                <p>
                    Use the ArrowLeft and ArrowRight keys to navigate between buttons. Ensure that when reaching the end
                    of the group, the focus cycles back to the first item (and vice versa).
                </p>
                <div rdxRovingFocusGroup [orientation]="'vertical'" [loop]="false">
                    <button rdxRovingFocusItem>Item 1</button>
                    <button rdxRovingFocusItem>Item 2</button>
                    <button rdxRovingFocusItem>Item 3</button>
                </div>
            </section>
        `
    })
};

export const IgnoreShiftKey: Story = {
    render: () => ({
        template: html`
            <section>
                <h2>Ignore Shift Key (allowShiftKey)</h2>
                <p>
                    Use the ArrowLeft and ArrowRight keys to navigate between buttons. Holding the
                    <code>Shift</code>
                    key should not affect focus behavior.
                </p>
                <div rdxRovingFocusGroup [orientation]="'horizontal'" [loop]="true">
                    <button rdxRovingFocusItem allowShiftKey="true">Item 1 (Shift Allowed)</button>
                    <button rdxRovingFocusItem>Item 2 (Default)</button>
                    <button rdxRovingFocusItem allowShiftKey="true">Item 3 (Shift Allowed)</button>
                </div>
            </section>
        `
    })
};

export const EventHandling: Story = {
    render: () => ({
        template: html`
            <h2>Event Handling</h2>
            <p>
                Verify that the
                <code>entryFocus</code>
                and
                <code>currentTabStopIdChange</code>
                events are triggered during the appropriate actions.
            </p>
            <rvg-events />
        `
    })
};
