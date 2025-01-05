import { Component } from '@angular/core';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShCardComponent,
    ShCardContentComponent,
    ShCardDescriptionComponent,
    ShCardFooterComponent,
    ShCardHeaderComponent,
    ShCardTitleComponent
} from '@radix-ng/shadcn/card';
import { ShInputDirective } from '@radix-ng/shadcn/input';
import { ShLabelDirective } from '@radix-ng/shadcn/label';
import { ShTabsModule } from '@radix-ng/shadcn/tabs';

@Component({
    standalone: true,
    imports: [
        ShInputDirective,
        ShTabsModule,
        ShCardComponent,
        ShCardHeaderComponent,
        ShCardTitleComponent,
        ShCardDescriptionComponent,
        ShCardContentComponent,
        ShLabelDirective,
        ShCardFooterComponent,
        ShButtonDirective
    ],
    template: `
        <sh-tabs class="w-[350px]" shDefaultValue="account">
            <sh-tabs-list class="grid w-full grid-cols-2">
                <button shTabsTrigger shValue="account">Account</button>
                <button shTabsTrigger shValue="password">Password</button>
            </sh-tabs-list>

            <sh-tabs-content shValue="account">
                <shCard class="block">
                    <shCardHeader>
                        <shCardTitle>Account</shCardTitle>
                        <shCardDescription>
                            Make changes to your account here. Click save when you're done.
                        </shCardDescription>
                    </shCardHeader>
                    <shCardContent class="space-y-2">
                        <div class="space-y-1">
                            <label shLabel htmlFor="name">Name</label>
                            <input id="name" shInput type="text" value="Pedro Duarte" />
                        </div>
                        <div class="space-y-1">
                            <label shLabel htmlFor="username">Username</label>
                            <input id="username" shInput type="text" value="@peduarte" />
                        </div>
                    </shCardContent>
                    <shCardFooter>
                        <button shButton>Save changes</button>
                    </shCardFooter>
                </shCard>
            </sh-tabs-content>

            <sh-tabs-content shValue="password">
                <shCard class="block">
                    <shCardHeader>
                        <shCardTitle>Password</shCardTitle>
                        <shCardDescription>
                            Change your password here. After saving, you'll be logged out.
                        </shCardDescription>
                    </shCardHeader>
                    <div class="space-y-2" shCardContent>
                        <div class="space-y-1">
                            <label shLabel htmlFor="current">Current password</label>
                            <input id="current" shInput type="password" />
                        </div>
                        <div class="space-y-1">
                            <label shLabel htmlFor="new">New password</label>
                            <input id="new" shInput type="password" />
                        </div>
                    </div>
                    <shCardFooter>
                        <button shButton>Save password</button>
                    </shCardFooter>
                </shCard>
            </sh-tabs-content>
        </sh-tabs>
    `
})
export class TabsExampleComponent {}
