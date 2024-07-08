# {{ NgDocPage.title }}
**Displays the path to the current resource using a hierarchy of links.**


{{ NgDocActions.demo("BreadcrumbExampleComponent", { defaultTab: "HTML", expanded: false}) }}

## Usage

`@NgModule`
```ts
import { ShBreadcrumbModule } from '@radix-ng/shadcn/breadcrumb';
```


Or standalone `imports`

```ts
import {
    ShBreadcrumbDirective,
    ShBreadcrumbEllipsisComponent,
    ShBreadcrumbItemDirective,
    ShBreadcrumbLinkDirective,
    ShBreadcrumbListDirective,
    ShBreadcrumbPageDirective,
    ShBreadcrumbSeparatorComponent
} from '@radix-ng/shadcn/breadcrumb';
```

## Examples

### Custom separator

Use a custom component as children for `<li shBreadcrumbSeparator />` to create a custom separator.

{{ NgDocActions.demo("BreadcrumbCustomSeparatorExampleComponent", { defaultTab: "HTML", expanded: false}) }}
