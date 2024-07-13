import { computed, Directive, input } from '@angular/core';

import { cn } from '@radix-ng/shadcn/core';

import { h1Variants, h2Variants, ulVariants } from './styles';

@Directive({
    selector: '[shH1]',
    exportAs: 'shH1',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShTypographyH1Directive {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(h1Variants({ class: this.class() })));
}

@Directive({
    selector: '[shH2]',
    exportAs: 'shH2',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShTypographyH2Directive {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(h2Variants({ class: this.class() })));
}

@Directive({
    selector: '[shUL]',
    exportAs: 'shUL',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShTypographyListDirective {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(ulVariants({ class: this.class() })));
}
