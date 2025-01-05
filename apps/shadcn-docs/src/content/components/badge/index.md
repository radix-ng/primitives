**Displays a badge or a component that looks like a badge.**

{{ NgDocActions.demo("BadgeExampleComponent", { expanded: false}) }}

## Usage

```ts
import { ShBadgeDirective } from '@radix-ng/shadcn/badge';
```

```html
<div shBadge variant="outline">Badge</div>
```

### Link

You can use the `badgeVariants` helper to create a link that looks like a badge.

```ts
import { badgeVariants } from '@radix-ng/shadcn/badge';
```

```html
<a [class]="badgeVariants({ variant: 'outline' })">Secondary</a>
```

## Examples

### Secondary

{{ NgDocActions.demo("BadgeExampleSecondaryComponent", { expanded: false}) }}

### Destructive

{{ NgDocActions.demo("BadgeExampleDestructiveComponent", { expanded: false}) }}

### Link

{{ NgDocActions.demo("BadgeExampleLinkComponent", { expanded: false}) }}
