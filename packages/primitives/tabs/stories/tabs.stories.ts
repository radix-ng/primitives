import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxTabsContentDirective } from '../src/tabs-content.directive';
import { RdxTabsListDirective } from '../src/tabs-list.directive';
import { RdxTabsRootDirective } from '../src/tabs-root.directive';
import { RdxTabsTriggerDirective } from '../src/tabs-trigger.directive';

const html = String.raw;

export default {
    title: 'Primitives/Tabs',
    decorators: [
        moduleMetadata({
            imports: [RdxTabsRootDirective, RdxTabsListDirective, RdxTabsTriggerDirective, RdxTabsContentDirective]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <div
                class="border-border bg-background text-foreground overflow-hidden rounded-xl border shadow-sm"
                rdxTabsRoot
                defaultValue="tab1"
            >
                <div class="border-border bg-muted/30 border-b" rdxTabsList>
                    <button
                        class="bg-background text-foreground data-[state=inactive]:text-muted-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium outline-none transition-colors first:rounded-tl-xl last:rounded-tr-xl focus-visible:ring-2 data-[state=inactive]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                        rdxTabsTrigger
                        type="button"
                        value="tab1"
                    >
                        Account
                    </button>
                    <button
                        class="bg-background text-foreground data-[state=inactive]:text-muted-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium outline-none transition-colors first:rounded-tl-xl last:rounded-tr-xl focus-visible:ring-2 data-[state=inactive]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                        rdxTabsTrigger
                        type="button"
                        value="tab2"
                    >
                        Password
                    </button>
                </div>
                <div class="bg-background p-6 outline-none" rdxTabsContent value="tab1">
                    <p class="text-foreground text-sm leading-6">
                        Make changes to your account here. Click save when you're done.
                    </p>
                    <fieldset class="mt-5 flex flex-col gap-2">
                        <label class="text-foreground text-sm font-medium" for="name">Name</label>
                        <input
                            class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                            id="name"
                            value="Pedro Duarte"
                        />
                    </fieldset>
                    <fieldset class="mt-5 flex flex-col gap-2">
                        <label class="text-foreground text-sm font-medium" for="username">Username</label>
                        <input
                            class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                            id="username"
                            value="@peduarte"
                        />
                    </fieldset>
                    <div class="mt-5 flex justify-end">
                        <button
                            class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition-colors"
                            type="button"
                        >
                            Save changes
                        </button>
                    </div>
                </div>
                <div class="bg-background p-6 outline-none" rdxTabsContent value="tab2">
                    <p class="text-foreground text-sm leading-6">
                        Change your password here. After saving, you'll be logged out.
                    </p>
                    <fieldset class="mt-5 flex flex-col gap-2">
                        <label class="text-foreground text-sm font-medium" for="currentPassword">
                            Current password
                        </label>
                        <input
                            class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                            id="currentPassword"
                            type="password"
                        />
                    </fieldset>
                    <fieldset class="mt-5 flex flex-col gap-2">
                        <label class="text-foreground text-sm font-medium" for="newPassword">New password</label>
                        <input
                            class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                            id="newPassword"
                            type="password"
                        />
                    </fieldset>
                    <fieldset class="mt-5 flex flex-col gap-2">
                        <label class="text-foreground text-sm font-medium" for="confirmPassword">
                            Confirm password
                        </label>
                        <input
                            class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                            id="confirmPassword"
                            type="password"
                        />
                    </fieldset>
                    <div class="mt-5 flex justify-end">
                        <button
                            class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition-colors"
                            type="button"
                        >
                            Change password
                        </button>
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
            <div
                class="border-border bg-background text-foreground overflow-hidden rounded-xl border shadow-sm"
                rdxTabsRoot
                activationMode="manual"
                defaultValue="tab1"
            >
                <div class="border-border bg-muted/30 border-b" rdxTabsList>
                    <button
                        class="bg-background text-foreground data-[state=inactive]:text-muted-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium outline-none transition-colors first:rounded-tl-xl last:rounded-tr-xl focus-visible:ring-2 data-[state=inactive]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                        rdxTabsTrigger
                        type="button"
                        value="tab1"
                    >
                        Account
                    </button>
                    <button
                        class="bg-background text-foreground data-[state=inactive]:text-muted-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium outline-none transition-colors first:rounded-tl-xl last:rounded-tr-xl focus-visible:ring-2 data-[state=inactive]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                        rdxTabsTrigger
                        type="button"
                        value="tab2"
                    >
                        Password
                    </button>
                </div>
                <div class="bg-background p-6 outline-none" rdxTabsContent value="tab1">
                    <p class="text-foreground text-sm leading-6">
                        Make changes to your account here. Click save when you're done.
                    </p>
                    <fieldset class="mt-5 flex flex-col gap-2">
                        <label class="text-foreground text-sm font-medium" for="name">Name</label>
                        <input
                            class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                            id="name"
                            value="Pedro Duarte"
                        />
                    </fieldset>
                    <fieldset class="mt-5 flex flex-col gap-2">
                        <label class="text-foreground text-sm font-medium" for="username">Username</label>
                        <input
                            class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                            id="username"
                            value="@peduarte"
                        />
                    </fieldset>
                    <div class="mt-5 flex justify-end">
                        <button
                            class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition-colors"
                            type="button"
                        >
                            Save changes
                        </button>
                    </div>
                </div>
                <div class="bg-background p-6 outline-none" rdxTabsContent value="tab2">
                    <p class="text-foreground text-sm leading-6">
                        Change your password here. After saving, you'll be logged out.
                    </p>
                    <fieldset class="mt-5 flex flex-col gap-2">
                        <label class="text-foreground text-sm font-medium" for="currentPassword">
                            Current password
                        </label>
                        <input
                            class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                            id="currentPassword"
                            type="password"
                        />
                    </fieldset>
                    <fieldset class="mt-5 flex flex-col gap-2">
                        <label class="text-foreground text-sm font-medium" for="newPassword">New password</label>
                        <input
                            class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                            id="newPassword"
                            type="password"
                        />
                    </fieldset>
                    <fieldset class="mt-5 flex flex-col gap-2">
                        <label class="text-foreground text-sm font-medium" for="confirmPassword">
                            Confirm password
                        </label>
                        <input
                            class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                            id="confirmPassword"
                            type="password"
                        />
                    </fieldset>
                    <div class="mt-5 flex justify-end">
                        <button
                            class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition-colors"
                            type="button"
                        >
                            Change password
                        </button>
                    </div>
                </div>
            </div>
        `
    })
};

export const Disabled: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <section>
                <h2>Disabled</h2>
                <p>Enabling disabled property of a Tab prevents user interaction.</p>
                <div
                    class="border-border bg-background text-foreground overflow-hidden rounded-xl border shadow-sm"
                    rdxTabsRoot
                    activationMode="manual"
                    defaultValue="tab1"
                >
                    <div class="border-border bg-muted/30 border-b" rdxTabsList>
                        <button
                            class="bg-background text-foreground data-[state=inactive]:text-muted-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium outline-none transition-colors first:rounded-tl-xl last:rounded-tr-xl focus-visible:ring-2 data-[state=inactive]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                            rdxTabsTrigger
                            type="button"
                            value="tab1"
                        >
                            Account
                        </button>
                        <button
                            class="bg-background text-foreground data-[state=inactive]:text-muted-foreground focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium outline-none transition-colors first:rounded-tl-xl last:rounded-tr-xl focus-visible:ring-2 data-[state=inactive]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                            rdxTabsTrigger
                            disabled
                            type="button"
                            value="tab2"
                        >
                            Password
                        </button>
                    </div>
                    <div class="bg-background p-6 outline-none" rdxTabsContent value="tab1">
                        <p class="text-foreground text-sm leading-6">
                            Make changes to your account here. Click save when you're done.
                        </p>
                        <fieldset class="mt-5 flex flex-col gap-2">
                            <label class="text-foreground text-sm font-medium" for="name">Name</label>
                            <input
                                class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                                id="name"
                                value="Pedro Duarte"
                            />
                        </fieldset>
                        <fieldset class="mt-5 flex flex-col gap-2">
                            <label class="text-foreground text-sm font-medium" for="username">Username</label>
                            <input
                                class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                                id="username"
                                value="@peduarte"
                            />
                        </fieldset>
                        <div class="mt-5 flex justify-end">
                            <button
                                class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition-colors"
                                type="button"
                            >
                                Save changes
                            </button>
                        </div>
                    </div>
                    <div class="bg-background p-6 outline-none" rdxTabsContent value="tab2">
                        <p class="text-foreground text-sm leading-6">
                            Change your password here. After saving, you'll be logged out.
                        </p>
                        <fieldset class="mt-5 flex flex-col gap-2">
                            <label class="text-foreground text-sm font-medium" for="currentPassword">
                                Current password
                            </label>
                            <input
                                class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                                id="currentPassword"
                                type="password"
                            />
                        </fieldset>
                        <fieldset class="mt-5 flex flex-col gap-2">
                            <label class="text-foreground text-sm font-medium" for="newPassword">New password</label>
                            <input
                                class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                                id="newPassword"
                                type="password"
                            />
                        </fieldset>
                        <fieldset class="mt-5 flex flex-col gap-2">
                            <label class="text-foreground text-sm font-medium" for="confirmPassword">
                                Confirm password
                            </label>
                            <input
                                class="bg-background text-foreground border-border focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
                                id="confirmPassword"
                                type="password"
                            />
                        </fieldset>
                        <div class="mt-5 flex justify-end">
                            <button
                                class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition-colors"
                                type="button"
                            >
                                Change password
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `
    })
};
