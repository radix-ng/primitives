/* eslint-disable @angular-eslint/directive-selector */
import { computed, Directive, input } from '@angular/core';

import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { ClassValue } from 'clsx';

// For wrapper use: class="relative w-full overflow-auto"
const tableVariants = cva('w-full caption-bottom text-sm');
@Directive({
    selector: 'table[Table]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class TableDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => cn(tableVariants(), this.userClass()));
}

const theadVariants = cva('[&_tr]:border-b');
@Directive({
    selector: 'thead[TableHeader]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class TableHeaderDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => cn(theadVariants(), this.userClass()));
}

const tbodyVariants = cva('[&_tr:last-child]:border-0');
@Directive({
    selector: 'tbody[TableBody]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class TableBodyDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => cn(tbodyVariants(), this.userClass()));
}

const tfootVariants = cva('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0');
@Directive({
    selector: 'tfoot[TableFooter]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class TableFooterDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => cn(tfootVariants(), this.userClass()));
}

const trVariants = cva(
    'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'
);
@Directive({
    selector: 'tr[TableRow]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class TableRowDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => cn(trVariants(), this.userClass()));
}

const thVariants = cva(
    'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'
);
@Directive({
    selector: 'th[TableHead]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class TableHeadDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => cn(thVariants(), this.userClass()));
}

const tdVariants = cva('p-4 align-middle [&:has([role=checkbox])]:pr-0');
@Directive({
    selector: 'td[TableCell]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class TableCellDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => cn(tdVariants(), this.userClass()));
}

const captionVariants = cva('mt-4 text-sm text-muted-foreground');
@Directive({
    selector: 'caption[TableCaption]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class TableCaptionDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => cn(captionVariants(), this.userClass()));
}
