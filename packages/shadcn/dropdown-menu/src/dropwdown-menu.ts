import { Component, computed, Directive, input } from '@angular/core';
import {
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemCheckboxDirective,
    RdxDropdownMenuItemDirective,
    RdxDropdownMenuItemIndicatorDirective,
    RdxDropdownMenuItemRadioDirective,
    RdxDropdownMenuItemRadioGroupDirective,
    RdxDropdownMenuLabelDirective
} from '@radix-ng/primitives/dropdown-menu';
import { RdxMenuGroupDirective, RdxMenuSeparatorDirective } from '@radix-ng/primitives/menu';
import { cn } from '@radix-ng/shadcn/core';
import { LucideAngularModule } from 'lucide-angular';
import {
    dropdownMenuCheckboxItemVariants,
    dropdownMenuContentVariants,
    dropdownMenuItemVariants,
    dropdownMenuLabelVariants,
    dropdownMenuRadioItemVariants,
    dropdownMenuSeparatorVariants,
    dropdownMenuShortcutVariants,
    dropdownMenuSubContentVariants
} from './styles';

@Component({
    selector: 'shDropdownMenuContent',
    standalone: true,
    template: '<ng-content />',
    hostDirectives: [RdxDropdownMenuContentDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuContentComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(dropdownMenuContentVariants({ class: this.class() })));
}

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

@Component({
    selector: 'shDropdownMenuLabel',
    standalone: true,
    template: '<ng-content />',
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

@Component({
    selector: 'shDropdownMenuItem',
    standalone: true,
    template: '<ng-content />',
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

@Component({
    selector: 'shDropdownMenuShortcut',
    standalone: true,
    template: '<ng-content />',
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuShortcutComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(dropdownMenuShortcutVariants({ class: this.class() })));
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
                <lucide-icon class="flex" size="16" name="check" />
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
    selector: 'shDropdownMenuRadioItem',
    standalone: true,
    imports: [
        LucideAngularModule,
        RdxDropdownMenuItemIndicatorDirective
    ],
    template: `
        <div class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <div rdxDropdownMenuItemIndicator>
                <lucide-icon class="flex fill-current" size="16" strokeWidth="8" name="dot" />
            </div>
        </div>
        <ng-content />
    `,
    hostDirectives: [
        {
            directive: RdxDropdownMenuItemRadioDirective,
            inputs: ['value'],
            outputs: ['checkedChange']
        }
    ],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuRadioItemComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(dropdownMenuRadioItemVariants({ class: this.class() })));
}

@Component({
    selector: 'shDropdownMenuRadioGroup',
    standalone: true,
    template: '<ng-content />',
    hostDirectives: [
        {
            directive: RdxDropdownMenuItemRadioGroupDirective,
            inputs: ['value:value'],
            outputs: ['valueChange']
        }
    ],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuRadioGroupComponent {
    readonly class = input<string>();
    readonly value = input<string>();

    protected computedClass = computed(() => cn({ class: this.class() }));
}

@Component({
    selector: 'shDropdownMenuGroup',
    standalone: true,
    template: '<ng-content />',
    hostDirectives: [RdxMenuGroupDirective],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShDropdownMenuGroupComponent {
    readonly class = input<string>();

    protected computedClass = computed(() => cn({ class: this.class() }));
}
