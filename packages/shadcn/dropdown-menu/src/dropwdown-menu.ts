import { computed, Directive, input } from '@angular/core';

import {
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemDirective,
    RdxDropdownMenuLabelDirective
} from '@radix-ng/primitives/dropdown-menu';
import { RdxMenuSeparatorDirective } from '@radix-ng/primitives/menu';
import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';

const dropdownMenuContentVariants = cva(
    'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
);

@Directive({
    selector: '[shDropdownMenuContent]',
    standalone: true,
    hostDirectives: [RdxDropdownMenuContentDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuContent {
    readonly class = input<string>();

    protected computedClass = computed(() =>
        cn(dropdownMenuContentVariants({ class: this.class() }))
    );
}

const dropdownMenuSubContentVariants = cva(
    'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
);

@Directive({
    selector: '[shDropdownMenuSubContent]',
    standalone: true,
    hostDirectives: [RdxDropdownMenuContentDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuSubContent {
    readonly class = input<string>();

    protected computedClass = computed(() =>
        cn(dropdownMenuSubContentVariants({ class: this.class() }))
    );
}

const dropdownMenuLabelVariants = cva('px-2 py-1.5 text-sm font-semibold', {
    variants: {
        inset: { true: 'pl-8', false: '' }
    },
    defaultVariants: {
        inset: false
    }
});

@Directive({
    selector: '[shDropdownMenuLabel]',
    standalone: true,
    hostDirectives: [RdxDropdownMenuLabelDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuLabel {
    readonly class = input<string>();
    readonly inset = input<boolean>(false);

    protected computedClass = computed(() =>
        cn(dropdownMenuLabelVariants({ inset: this.inset(), class: this.class() }))
    );
}

const dropdownMenuItemVariants = cva(
    'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    {
        variants: {
            inset: { true: 'pl-8', false: '' }
        },
        defaultVariants: {
            inset: false
        }
    }
);

@Directive({
    selector: '[shDropdownMenuItem]',
    standalone: true,
    hostDirectives: [RdxDropdownMenuItemDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuItem {
    readonly class = input<string>();
    readonly inset = input<boolean>(false);

    protected computedClass = computed(() =>
        cn(dropdownMenuItemVariants({ inset: this.inset(), class: this.class() }))
    );
}

const dropdownMenuSeparatorVariants = cva('-mx-1 my-1 h-px bg-muted');
@Directive({
    selector: '[shDropdownMenuSeparator]',
    standalone: true,
    hostDirectives: [RdxMenuSeparatorDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuSeparator {
    readonly class = input<string>();

    protected computedClass = computed(() =>
        cn(dropdownMenuSeparatorVariants({ class: this.class() }))
    );
}

const dropdownMenuShortcutVariants = cva('ml-auto text-xs tracking-widest opacity-60');
@Directive({
    selector: '[shDropdownMenuShortcut]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuShortcut {
    readonly class = input<string>();

    protected computedClass = computed(() =>
        cn(dropdownMenuShortcutVariants({ class: this.class() }))
    );
}
