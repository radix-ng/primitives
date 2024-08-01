import { Component } from '@angular/core';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShCardContentDirective,
    ShCardDescriptionDirective,
    ShCardDirective,
    ShCardFooterDirective,
    ShCardHeaderDirective,
    ShCardTitleDirective
} from '@radix-ng/shadcn/card';
import { ShInputDirective } from '@radix-ng/shadcn/input';
import { ShLabelDirective } from '@radix-ng/shadcn/label';
import { ShTabsModule } from '@radix-ng/shadcn/tabs';

@Component({
    standalone: true,
    imports: [
        ShInputDirective,
        ShTabsModule,
        ShCardDirective,
        ShCardHeaderDirective,
        ShCardTitleDirective,
        ShCardDescriptionDirective,
        ShCardContentDirective,
        ShLabelDirective,
        ShCardFooterDirective,
        ShButtonDirective
    ],
    template: `
        <div
            class="w-[350px]"
            shTabs
            shDefaultValue="account"
        >
            <div
                class="grid w-full grid-cols-2"
                shTabsList
            >
                <button
                    shTabsTrigger
                    shValue="account"
                >
                    Account
                </button>
                <button
                    shTabsTrigger
                    shValue="password"
                >
                    Password
                </button>
            </div>

            <div
                class="TabsContent"
                shTabsContent
                shValue="account"
            >
                <div shCard>
                    <div shCardHeader>
                        <div shCardTitle>Account</div>
                        <div shCardDescription>Make changes to your account here. Click save when you're done.</div>
                    </div>
                    <div
                        class="space-y-2"
                        shCardContent
                    >
                        <div class="space-y-1">
                            <label
                                shLabel
                                htmlFor="name"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                shInput
                                type="text"
                                value="Pedro Duarte"
                            />
                        </div>
                        <div class="space-y-1">
                            <label
                                shLabel
                                htmlFor="username"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                shInput
                                type="text"
                                value="@peduarte"
                            />
                        </div>
                    </div>
                    <div shCardFooter>
                        <button shButton>Save changes</button>
                    </div>
                </div>
            </div>

            <div
                shTabsContent
                shValue="password"
            >
                <div shCard>
                    <div shCardHeader>
                        <div shCardTitle>Password</div>
                        <div shCardDescription>Change your password here. After saving, you'll be logged out.</div>
                    </div>
                    <div
                        class="space-y-2"
                        shCardContent
                    >
                        <div class="space-y-1">
                            <label
                                shLabel
                                htmlFor="current"
                            >
                                Current password
                            </label>
                            <input
                                id="current"
                                shInput
                                type="password"
                            />
                        </div>
                        <div class="space-y-1">
                            <label
                                shLabel
                                htmlFor="new"
                            >
                                New password
                            </label>
                            <input
                                id="new"
                                shInput
                                type="password"
                            />
                        </div>
                    </div>
                    <div shCardFooter>
                        <button shButton>Save password</button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class TabsExampleComponent {}
