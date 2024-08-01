import { NgIf } from '@angular/common';
import { Component, computed, Directive, input } from '@angular/core';
import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { LucideAngularModule } from 'lucide-angular';

// Breadcrumb ----------------------------------------------------------------------
@Directive({
    selector: 'nav[shBreadcrumb]',
    standalone: true,
    host: {
        '[attr.aria-label]': '"breadcrumb"'
    }
})
export class ShBreadcrumbDirective {}

// BreadcrumbList ----------------------------------------------------------------------
const breadcrumbListVariants = cva(
    'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5'
);
@Directive({
    selector: 'ol[shBreadcrumbList]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShBreadcrumbListDirective {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(breadcrumbListVariants({ class: this.class() })));
}

// BreadcrumbItem ----------------------------------------------------------------------
const breadcrumbItemVariants = cva('inline-flex items-center gap-1.5');
@Directive({
    selector: 'li[shBreadcrumbItem]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShBreadcrumbItemDirective {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(breadcrumbItemVariants({ class: this.class() })));
}

// BreadcrumbLink ----------------------------------------------------------------------
const breadcrumbLinkVariants = cva('transition-colors hover:text-foreground');
@Directive({
    selector: '[shBreadcrumbLink], a[shBreadcrumbLink]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShBreadcrumbLinkDirective {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(breadcrumbLinkVariants({ class: this.class() })));
}

// BreadcrumbPage ----------------------------------------------------------------------
const breadcrumbPageVariants = cva('font-normal text-foreground');
@Directive({
    selector: 'span[shBreadcrumbPage]',
    standalone: true,
    host: {
        role: 'link',
        '[attr.aria-disabled]': 'true',
        '[attr.aria-current]': '"page"',
        '[class]': 'computedClass()'
    }
})
export class ShBreadcrumbPageDirective {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(breadcrumbPageVariants({ class: this.class() })));
}

// BreadcrumbSeparator ----------------------------------------------------------------------
const breadcrumbSeparatorVariants = cva('');
@Component({
    selector: 'li[shBreadcrumbSeparator]',
    standalone: true,
    imports: [LucideAngularModule, NgIf],
    template: `
        <ng-container>
            <span #ref><ng-content></ng-content></span>
        </ng-container>
        <ng-container *ngIf="ref.children.length == 0">
            <lucide-angular
                class="flex h-3.5"
                name="ChevronRight"
                size="16"
            ></lucide-angular>
        </ng-container>
    `,
    host: {
        role: 'presentation',
        '[attr.aria-hidden]': 'true',
        '[class]': 'computedClass()'
    }
})
export class ShBreadcrumbSeparatorComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(breadcrumbSeparatorVariants({ class: this.class() })));
}

// BreadcrumbEllipsis ----------------------------------------------------------------------
const breadcrumbEllipsisVariants = cva('flex h-9 w-9 items-center justify-center');
@Component({
    selector: 'span[shBreadcrumbEllipsis]',
    standalone: true,
    imports: [LucideAngularModule],
    template: `
        <!--        <span role="presentation" aria-hidden="true" [class]="computedClass()">-->
        <lucide-angular
            class="h-4 w-4"
            name="MoreHorizontal"
        ></lucide-angular>
        <span class="sr-only">More</span>
        <!--        </span>-->
    `,
    host: {
        role: 'presentation',
        '[attr.aria-hidden]': 'true',
        '[class]': 'computedClass()'
    }
})
export class ShBreadcrumbEllipsisComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(breadcrumbEllipsisVariants({ class: this.class() })));
}
