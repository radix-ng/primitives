import { Component, computed, Directive, Input, input } from '@angular/core';
import {
    RdxTabsContentDirective,
    RdxTabsListDirective,
    RdxTabsRootDirective,
    RdxTabsTriggerDirective
} from '@radix-ng/primitives/tabs';
import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';

// TabsPrimitive.Root
@Directive({
    selector: 'sh-tabs,[shTabs]',
    standalone: true,
    hostDirectives: [{ directive: RdxTabsRootDirective, inputs: ['defaultValue: shDefaultValue'] }]
})
export class ShTabsDirective {
    @Input() shDefaultValue?: string;
}

// TabsPrimitive.List
const tabsListVariants = cva(
    'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground'
);
@Directive({
    selector: 'sh-tabs-list,[shTabsList]',
    standalone: true,
    hostDirectives: [RdxTabsListDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShTabsListDirective {
    readonly class = input<string>();
    protected computedClass = computed(() => cn(tabsListVariants(), this.class()));
}

const tabsTriggerVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
);
@Directive({
    selector: '[shTabsTrigger]',
    standalone: true,
    hostDirectives: [{ directive: RdxTabsTriggerDirective, inputs: ['value: shValue'] }],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShTabsTriggerDirective {
    readonly shValue = input.required<string>();

    readonly class = input<string>();
    protected computedClass = computed(() => cn(tabsTriggerVariants(), this.class()));
}

const tabsContentVariants = cva(
    'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
);
@Component({
    selector: 'sh-tabs-content,[shTabsContent]',
    imports: [RdxTabsContentDirective],
    template: `
        <div [class]="computedClass()" [value]="shValue()" rdxTabsContent>
            <ng-content />
        </div>
    `
})
export class ShTabsContentComponent {
    readonly shValue = input.required<string>();

    readonly classContent = input<string>();
    protected computedClass = computed(() => cn(tabsContentVariants(), this.classContent()));
}
