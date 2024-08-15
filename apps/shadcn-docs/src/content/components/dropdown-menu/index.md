# {{ NgDocPage.title }}

{{ NgDocActions.demo("DropdownExampleComponent", { expanded: false}) }}

## Usage


```ts
import { RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShDropdownMenuContentComponent,
    ShDropdownMenuGroupComponent,
    ShDropdownMenuItemComponent,
    ShDropdownMenuLabelComponent,
    ShDropdownMenuSeparatorComponent,
    ShDropdownMenuShortcutComponent
} from '@radix-ng/shadcn/dropdown-menu';
```

```html
<button [rdxDropdownMenuTrigger]="menu" shButton variant="outline">Open</button>

<ng-template #menu>
    <shDropdownMenuContent>
        <shDropdownMenuLabel>My Account</shDropdownMenuLabel>
        <shDropdownMenuSeparator />
        <shDropdownMenuItem>Profile</shDropdownMenuItem>
        <shDropdownMenuItem>Billing</shDropdownMenuItem>
        <shDropdownMenuItem>Keyboard shortcuts</shDropdownMenuItem>
    </shDropdownMenuContent>
</ng-template>
```

## Examples

### Checkbox

{{ NgDocActions.demo("DropdownExampleCheckboxComponent", { expanded: false}) }}
