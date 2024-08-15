import { Component, computed, Directive, input } from '@angular/core';
import {
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemCheckboxDirective,
    RdxDropdownMenuItemDirective,
    RdxDropdownMenuItemIndicatorDirective,
    RdxDropdownMenuLabelDirective
} from '@radix-ng/primitives/dropdown-menu';
import { RdxMenuGroupDirective, RdxMenuSeparatorDirective } from '@radix-ng/primitives/menu';
import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { LucideAngularModule } from 'lucide-angular';

const dropdownMenuContentVariants = cva(
    'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
);

@Component({
    selector: 'shDropdownMenuContent',
    standalone: true,
    template: '<ng-content></ng-content>',
    hostDirectives: [RdxDropdownMenuContentDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuContentComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(dropdownMenuContentVariants({ class: this.class() })));
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

    protected computedClass = computed(() => cn(dropdownMenuSubContentVariants({ class: this.class() })));
}

const dropdownMenuLabelVariants = cva('flex px-2 py-1.5 text-sm font-semibold', {
    variants: {
        inset: { true: 'pl-8', false: '' }
    },
    defaultVariants: {
        inset: false
    }
});

@Component({
    selector: 'shDropdownMenuLabel',
    standalone: true,
    template: '<ng-content></ng-content>',
    hostDirectives: [RdxDropdownMenuLabelDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuLabelComponent {
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

@Component({
    selector: 'shDropdownMenuItem',
    standalone: true,
    template: '<ng-content></ng-content>',
    hostDirectives: [RdxDropdownMenuItemDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuItemComponent {
    readonly class = input<string>();
    readonly inset = input<boolean>(false);

    protected computedClass = computed(() =>
        cn(dropdownMenuItemVariants({ inset: this.inset(), class: this.class() }))
    );
}

const dropdownMenuSeparatorVariants = cva('flex -mx-1 my-1 h-px bg-muted');
@Component({
    selector: 'shDropdownMenuSeparator',
    standalone: true,
    template: ``,
    hostDirectives: [RdxMenuSeparatorDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuSeparatorComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(dropdownMenuSeparatorVariants({ class: this.class() })));
}

const dropdownMenuShortcutVariants = cva('flex ml-auto text-xs tracking-widest opacity-60');
@Component({
    selector: 'shDropdownMenuShortcut',
    standalone: true,
    template: '<ng-content></ng-content>',
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuShortcutComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(dropdownMenuShortcutVariants({ class: this.class() })));
}

const dropdownMenuCheckboxItemVariants = cva(
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
);
@Directive({
    selector: '[shDropdownMenuCheckboxItem]',
    standalone: true,
    hostDirectives: [
        {
            directive: RdxDropdownMenuItemCheckboxDirective,
            inputs: ['checked'],
            outputs: ['checkedChange']
        }
    ],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuCheckboxItemDirective {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(dropdownMenuCheckboxItemVariants({ class: this.class() })));
}

@Component({
    selector: 'shDropdownMenuCheckboxItem',
    standalone: true,
    imports: [
        RdxDropdownMenuItemIndicatorDirective,
        LucideAngularModule
    ],
    template: `
        <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <div rdxDropdownMenuItemIndicator>
                <lucide-icon size="16" name="check"></lucide-icon>
            </div>
        </span>
        <ng-content />
    `,
    hostDirectives: [
        {
            directive: RdxDropdownMenuItemCheckboxDirective,
            inputs: ['checked'],
            outputs: ['checkedChange']
        }
    ],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuCheckboxItemComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(dropdownMenuCheckboxItemVariants({ class: this.class() })));
}

@Component({
    selector: 'shDropdownMenuGroup',
    standalone: true,
    template: '<ng-content></ng-content>',
    hostDirectives: [RdxMenuGroupDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuGroupComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn({ class: this.class() }));
}
