import { Component } from '@angular/core';

import { RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { RdxMenuGroupDirective } from '@radix-ng/primitives/menu';
import { RdxMenuBarDirective } from '@radix-ng/primitives/menubar';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShDropdownMenuContent,
    ShDropdownMenuItem,
    ShDropdownMenuLabel,
    ShDropdownMenuSeparator,
    ShDropdownMenuShortcut
} from '@radix-ng/shadcn/dropdown-menu';

@Component({
    standalone: true,
    imports: [
        RdxMenuBarDirective,
        RdxDropdownMenuTriggerDirective,
        ShButtonDirective,
        ShDropdownMenuContent,
        ShDropdownMenuSeparator,
        ShDropdownMenuLabel,
        ShDropdownMenuItem,
        ShDropdownMenuShortcut,
        RdxMenuGroupDirective
    ],
    templateUrl: './dropdown-example.component.html'
})
export class DropdownExampleComponent {
    protected readonly RdxDropdownMenuTriggerDirective = RdxDropdownMenuTriggerDirective;
}
