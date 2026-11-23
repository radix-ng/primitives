import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'separator-default-example',
    imports: [RdxSeparatorRootDirective],
    template: `
        <nav class="flex flex-wrap gap-4 text-sm whitespace-nowrap" aria-label="Main">
            <a
                class="text-foreground focus-visible:outline-ring decoration-neutral-300 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 dark:decoration-neutral-700"
                href="#"
            >
                Home
            </a>
            <a
                class="text-foreground focus-visible:outline-ring decoration-neutral-300 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 dark:decoration-neutral-700"
                href="#"
            >
                Pricing
            </a>
            <a
                class="text-foreground focus-visible:outline-ring decoration-neutral-300 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 dark:decoration-neutral-700"
                href="#"
            >
                Blog
            </a>
            <a
                class="text-foreground focus-visible:outline-ring decoration-neutral-300 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 dark:decoration-neutral-700"
                href="#"
            >
                Support
            </a>
            <div
                class="w-px self-stretch bg-neutral-300 dark:bg-neutral-700"
                rdxSeparatorRoot
                orientation="vertical"
            ></div>
            <a
                class="text-foreground focus-visible:outline-ring decoration-neutral-300 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 dark:decoration-neutral-700"
                href="#"
            >
                Log in
            </a>
            <a
                class="text-foreground focus-visible:outline-ring decoration-neutral-300 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 dark:decoration-neutral-700"
                href="#"
            >
                Sign up
            </a>
        </nav>
    `
})
export class SeparatorDefaultExample {}
