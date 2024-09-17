import { Component, computed, input } from '@angular/core';
import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';

@Component({
    selector: 'shCard',
    standalone: true,
    template: '<ng-content />',
    host: {
        '[class]': "'bg-card text-card-foreground rounded-xl border shadow'"
    }
})
export class ShCardComponent {}

const cardHeaderVariants = cva('flex flex-col space-y-1.5 p-6');
@Component({
    selector: 'shCardHeader',
    standalone: true,
    template: '<ng-content />',
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShCardHeaderComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(cardHeaderVariants({ class: this.class() })));
}

@Component({
    selector: 'shCardTitle, [shCardTitle]',
    standalone: true,
    template: '<ng-content />',
    host: {
        '[class]': "'font-semibold leading-none tracking-tight'"
    }
})
export class ShCardTitleComponent {}

@Component({
    selector: 'shCardDescription',
    standalone: true,
    template: '<ng-content />',
    host: {
        '[class]': "'text-sm text-muted-foreground'"
    }
})
export class ShCardDescriptionComponent {}

@Component({
    selector: 'shCardContent',
    standalone: true,
    template: '<ng-content />',
    host: {
        '[class]': "'p-6 pt-0 block'"
    }
})
export class ShCardContentComponent {}

const cardFooterVariants = cva('flex items-center p-6 pt-0');
@Component({
    selector: 'shCardFooter',
    standalone: true,
    template: '<ng-content />',
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShCardFooterComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(cardFooterVariants({ class: this.class() })));
}
