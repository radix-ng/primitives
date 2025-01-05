{{ NgDocActions.demo("TabsExampleComponent", { defaultTab: "HTML", expanded: false}) }}

## Usage

```typescript
import {
  ShTabsContentDirective,
  ShTabsDirective,
  ShTabsListDirective,
  ShTabsTriggerDirective
} from '@radix-ng/shadcn/tabs';
```

or use `@NgModule`

```typescript
import { ShTabsModule } from '@radix-ng/shadcn/tabs';
```

```html
<div class="w-[400px]" shTabs shDefaultValue="account">
  <div shTabsList>
    <div shTabsTrigger shValue="account">Account</div>
    <div shTabsTrigger shValue="password">Password</div>
  </div>
  <div shTabsContent shValue="account">Make changes to your account here.</div>
  <div shTabsContent shValue="password">Change your password here.</div>
</div>
```
