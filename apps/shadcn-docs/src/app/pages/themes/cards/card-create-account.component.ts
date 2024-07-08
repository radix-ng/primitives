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
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-card-create-account',
    standalone: true,
    imports: [
        ShCardDirective,
        ShCardHeaderDirective,
        ShCardTitleDirective,
        ShCardDescriptionDirective,
        ShCardContentDirective,
        ShButtonDirective,
        LucideAngularModule,
        ShLabelDirective,
        ShInputDirective,
        ShCardFooterDirective
    ],
    template: `
        <div shCard>
            <div shCardHeader class="space-y-1">
                <div shCardTitle class="text-2xl">Create an account</div>
                <div shCardDescription>Enter your email below to create your account</div>
            </div>
            <div shCardContent class="grid gap-4">
                <div class="grid grid-cols-2 gap-6">
                    <button shButton variant="outline">Github</button>
                    <button shButton variant="outline">Google</button>
                </div>
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t"></span>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span class="bg-background text-muted-foreground px-2">
                            Or continue with
                        </span>
                    </div>
                </div>
                <div class="grid gap-2">
                    <label shLabel htmlFor="email">Email</label>
                    <input shInput id="email" type="email" placeholder="m@example.com" />
                </div>
                <div class="grid gap-2">
                    <label shLabel htmlFor="password">Password</label>
                    <input shInput id="password" type="password" />
                </div>
            </div>
            <div shCardFooter>
                <button shButton class="w-full">Create account</button>
            </div>
        </div>
    `
})
export class CardCreateAccountComponent {}
