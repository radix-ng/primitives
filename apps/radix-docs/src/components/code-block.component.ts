import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    standalone: true,
    template: `
        <div>
            Hello From Angular Component
            <button
                class="bg-primary dark:bg-primary/10 focus-visible:ring-ring border-primary text-primary-foreground dark:text-primary mr-2 hidden h-8 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 lg:inline-flex"
            >
                Click me
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class CodeBlockComponent {}
