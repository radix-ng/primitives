import { Component } from '@angular/core';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShCardContentDirective,
    ShCardDirective,
    ShCardFooterDirective,
    ShCardHeaderDirective
} from '@radix-ng/shadcn/card';
import { cn } from '@radix-ng/shadcn/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-card-chat',
    standalone: true,
    imports: [
        ShCardContentDirective,
        ShCardDirective,
        ShCardHeaderDirective,
        ShButtonDirective,
        LucideAngularModule,
        ShCardFooterDirective
    ],
    template: `
        <div shCard>
            <div class="flex flex-row items-center" shCardHeader>
                <div class="flex items-center space-x-4">
                    <div>
                        <p class="text-sm font-medium leading-none">Sofia Davis</p>
                        <p class="text-muted-foreground text-sm">m&#64;example.com</p>
                    </div>
                </div>
                <button class="ml-auto rounded-full" shButton size="icon" variant="outline">
                    <lucide-angular class="h-4" name="plus"></lucide-angular>
                    <span class="sr-only">New message</span>
                </button>
            </div>
            <div shCardContent>
                <div class="space-y-4">
                    @for (message of messages; track message) {
                        <div
                            [class]="
                                cn(
                                    'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                                    message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
                                )
                            "
                        >
                            {{ message.content }}
                        </div>
                    }
                </div>
            </div>
            <div shCardFooter></div>
        </div>
    `
})
export class CardChatComponent {
    cn = cn;

    messages = [
        {
            role: 'agent',
            content: 'Hi, how can I help you today?'
        },
        {
            role: 'user',
            content: "Hey, I'm having trouble with my account."
        },
        {
            role: 'agent',
            content: 'What seems to be the problem?'
        },
        {
            role: 'user',
            content: "I can't log in."
        }
    ];
}
