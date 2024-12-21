import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxTabsContentDirective } from '../src/tabs-content.directive';
import { RdxTabsListDirective } from '../src/tabs-list.directive';
import { RdxTabsRootDirective } from '../src/tabs-root.directive';
import { RdxTabsTriggerDirective } from '../src/tabs-trigger.directive';

const html = String.raw;

export default {
    title: 'Primitives/Tabs',
    decorators: [
        moduleMetadata({
            imports: [
                RdxTabsRootDirective,
                RdxTabsListDirective,
                RdxTabsTriggerDirective,
                RdxTabsContentDirective
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    ${story}
                    <style>
                        /* reset */
                        button,
                        fieldset,
                        input {
                            all: unset;
                        }

                        .TabsRoot {
                            display: flex;
                            flex-direction: column;
                            width: 300px;
                            box-shadow: 0 2px 10px var(--black-a4);
                        }

                        .TabsList {
                            flex-shrink: 0;
                            display: flex;
                            border-bottom: 1px solid var(--mauve-6);
                        }

                        .TabsTrigger {
                            font-family: inherit;
                            background-color: white;
                            padding: 0 20px;
                            height: 45px;
                            flex: 1;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 15px;
                            line-height: 1;
                            color: var(--mauve-11);
                            user-select: none;
                        }
                        .TabsTrigger:first-child {
                            border-top-left-radius: 6px;
                        }
                        .TabsTrigger:last-child {
                            border-top-right-radius: 6px;
                        }
                        .TabsTrigger:hover {
                            color: var(--violet-11);
                        }
                        .TabsTrigger[data-state='active'] {
                            color: var(--violet-11);
                            box-shadow:
                                inset 0 -1px 0 0 currentColor,
                                0 1px 0 0 currentColor;
                        }
                        .TabsTrigger:focus {
                            position: relative;
                            box-shadow: 0 0 0 2px black;
                        }

                        .TabsContent {
                            flex-grow: 1;
                            padding: 20px;
                            background-color: white;
                            border-bottom-left-radius: 6px;
                            border-bottom-right-radius: 6px;
                            outline: none;
                        }
                        .TabsContent:focus {
                            box-shadow: 0 0 0 2px black;
                        }

                        .Text {
                            margin-top: 0;
                            margin-bottom: 20px;
                            color: var(--mauve-11);
                            font-size: 15px;
                            line-height: 1.5;
                        }

                        .Fieldset {
                            margin-bottom: 15px;
                            width: 100%;
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-start;
                        }

                        .Label {
                            font-size: 13px;
                            line-height: 1;
                            margin-bottom: 10px;
                            color: var(--violet-12);
                            display: block;
                        }

                        .Input {
                            flex: 1 0 auto;
                            border-radius: 4px;
                            padding: 0 10px;
                            font-size: 15px;
                            line-height: 1;
                            color: var(--violet-11);
                            box-shadow: 0 0 0 1px var(--violet-7);
                            height: 35px;
                        }
                        .Input:focus {
                            box-shadow: 0 0 0 2px var(--violet-8);
                        }

                        .Button {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 4px;
                            padding: 0 15px;
                            font-size: 15px;
                            line-height: 1;
                            font-weight: 500;
                            height: 35px;
                        }
                        .Button.green {
                            background-color: var(--green-4);
                            color: var(--green-11);
                        }
                        .Button.green:hover {
                            background-color: var(--green-5);
                        }
                        .Button.green:focus {
                            box-shadow: 0 0 0 2px var(--green-7);
                        }
                    </style>
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <div class="TabsRoot" rdxTabsRoot defaultValue="tab1">
                <div class="TabsList" rdxTabsList>
                    <button class="TabsTrigger" rdxTabsTrigger value="tab1">Account</button>
                    <button class="TabsTrigger" rdxTabsTrigger value="tab2">Password</button>
                </div>
                <div class="TabsContent" rdxTabsContent value="tab1">
                    <p class="Text">Make changes to your account here. Click save when you're done.</p>
                    <fieldset class="Fieldset">
                        <label class="Label" for="name">Name</label>
                        <input class="Input" id="name" value="Pedro Duarte" />
                    </fieldset>
                    <fieldset class="Fieldset">
                        <label class="Label" for="username">Username</label>
                        <input class="Input" id="username" value="@peduarte" />
                    </fieldset>
                    <div style="display: flex; margin-top: 20px; justify-content: flex-end; ">
                        <button class="Button green">Save changes</button>
                    </div>
                </div>
                <div class="TabsContent" rdxTabsContent value="tab2">
                    <p class="Text">Change your password here. After saving, you'll be logged out.</p>
                    <fieldset class="Fieldset">
                        <label class="Label" for="currentPassword">Current password</label>
                        <input class="Input" id="currentPassword" type="password" />
                    </fieldset>
                    <fieldset class="Fieldset">
                        <label class="Label" for="newPassword">New password</label>
                        <input class="Input" id="newPassword" type="password" />
                    </fieldset>
                    <fieldset class="Fieldset">
                        <label class="Label" for="confirmPassword">Confirm password</label>
                        <input class="Input" id="confirmPassword" type="password" />
                    </fieldset>
                    <div style="display: flex; margin-top: 20px; justify-content: flex-end;">
                        <button class="Button green">Change password</button>
                    </div>
                </div>
            </div>
        `
    })
};

export const ActivationMode: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <div class="TabsRoot" rdxTabsRoot activationMode="manual" defaultValue="tab1">
                <div class="TabsList" rdxTabsList>
                    <button class="TabsTrigger" rdxTabsTrigger value="tab1">Account</button>
                    <button class="TabsTrigger" rdxTabsTrigger value="tab2">Password</button>
                </div>
                <div class="TabsContent" rdxTabsContent value="tab1">
                    <p class="Text">Make changes to your account here. Click save when you're done.</p>
                    <fieldset class="Fieldset">
                        <label class="Label" for="name">Name</label>
                        <input class="Input" id="name" value="Pedro Duarte" />
                    </fieldset>
                    <fieldset class="Fieldset">
                        <label class="Label" for="username">Username</label>
                        <input class="Input" id="username" value="@peduarte" />
                    </fieldset>
                    <div style="display: flex; margin-top: 20px; justify-content: flex-end; ">
                        <button class="Button green">Save changes</button>
                    </div>
                </div>
                <div class="TabsContent" rdxTabsContent value="tab2">
                    <p class="Text">Change your password here. After saving, you'll be logged out.</p>
                    <fieldset class="Fieldset">
                        <label class="Label" for="currentPassword">Current password</label>
                        <input class="Input" id="currentPassword" type="password" />
                    </fieldset>
                    <fieldset class="Fieldset">
                        <label class="Label" for="newPassword">New password</label>
                        <input class="Input" id="newPassword" type="password" />
                    </fieldset>
                    <fieldset class="Fieldset">
                        <label class="Label" for="confirmPassword">Confirm password</label>
                        <input class="Input" id="confirmPassword" type="password" />
                    </fieldset>
                    <div style="display: flex; margin-top: 20px; justify-content: flex-end;">
                        <button class="Button green">Change password</button>
                    </div>
                </div>
            </div>
        `
    })
};
