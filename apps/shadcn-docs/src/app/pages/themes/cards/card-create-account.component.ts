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
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-card-create-account',
    standalone: true,
    imports: [
        ShCardComponent,
        ShCardHeaderComponent,
        ShCardTitleComponent,
        ShCardDescriptionComponent,
        ShCardContentComponent,
        ShButtonDirective,
        LucideAngularModule,
        ShLabelDirective,
        ShInputDirective,
        ShCardFooterComponent
    ],
    template: `
        <div shCard>
            <div class="space-y-1" shCardHeader>
                <div class="text-2xl" shCardTitle>Create an account</div>
                <div shCardDescription>Enter your email below to create your account</div>
            </div>
            <div class="grid gap-4" shCardContent>
                <div class="grid grid-cols-2 gap-6">
                    <button shButton variant="outline">Github</button>
                    <button shButton variant="outline">Google</button>
                </div>
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t"></span>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span class="bg-background text-muted-foreground px-2">Or continue with</span>
                    </div>
                </div>
                <div class="grid gap-2">
                    <label shLabel htmlFor="email">Email</label>
                    <input id="email" shInput type="email" placeholder="m@example.com" />
                </div>
                <div class="grid gap-2">
                    <label shLabel htmlFor="password">Password</label>
                    <input id="password" shInput type="password" />
                </div>
            </div>
            <div shCardFooter>
                <button class="w-full" shButton>Create account</button>
            </div>
        </div>
    `
})
export class CardCreateAccountComponent {}
