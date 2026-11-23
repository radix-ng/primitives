# Anatomy & parts

#### Why a primitive is several directives, and how they find each other.

Most primitives aren't a single component — they're a small family of directives you place on your
own elements. Tabs, for example, is four parts:

```html
<div rdxTabsRoot>
  <div rdxTabsList>
    <button rdxTabsTab value="1">Account</button>
    <button rdxTabsTab value="2">Password</button>
    <span rdxTabsIndicator></span>
  </div>
  <div rdxTabsPanel value="1">Account settings…</div>
  <div rdxTabsPanel value="2">Password settings…</div>
</div>
```

Here it is running — switch tabs and the active `rdxTabsTab` picks up `data-active` while the others
drop it:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-tabs-default-example',
    imports: [RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab],
    template: `
        <div class="w-80 max-w-full" rdxTabsRoot defaultValue="account">
            <div class="relative isolate z-1 -mb-px flex gap-1" rdxTabsList>
                <button
                    class="text-foreground hover:not-data-active:bg-muted focus-visible:outline-ring relative inline-flex h-8 items-center px-3 text-sm focus-visible:outline-2 focus-visible:-outline-offset-1 aria-disabled:opacity-50"
                    rdxTabsTab
                    value="account"
                >
                    Account
                </button>
                <button
                    class="text-foreground hover:not-data-active:bg-muted focus-visible:outline-ring relative inline-flex h-8 items-center px-3 text-sm focus-visible:outline-2 focus-visible:-outline-offset-1 aria-disabled:opacity-50"
                    rdxTabsTab
                    value="password"
                >
                    Password
                </button>
                <span
                    class="border-foreground bg-background absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) translate-x-(--active-tab-left) border-x border-t motion-safe:transition-[translate,width] motion-safe:duration-150"
                    rdxTabsIndicator
                ></span>
            </div>
            <div class="border-foreground text-foreground min-h-32 border p-3 text-sm" rdxTabsPanel value="account">
                Make changes to your account here. Click save when you're done.
            </div>
            <div class="border-foreground text-foreground min-h-32 border p-3 text-sm" rdxTabsPanel value="password">
                Change your password here. After saving, you'll be logged out.
            </div>
        </div>
    `
})
export class TabsDefaultStory {}
```

## Why parts instead of one component

A single `<rdx-tabs [items]="...">` component would have to own your markup: the wrapping tags, the
order, the class names, whatever extra elements you want between them. Splitting into parts hands
all of that back to you. You decide:

- **The element and tag** — `rdxTabsTab` on a `<button>`, `<a>`, or anything else.
- **The structure** — wrap a tab in a badge, put a divider in the list, nest panels however you like.
- **What's omitted** — don't want the indicator? Just leave `rdxTabsIndicator` out.

The primitive contributes behavior and accessibility to each element it's attached to; the DOM shape
stays yours.

## How parts coordinate: the Root context

The parts aren't wired together by you — there's no `[tabs]="tabsRef"` to pass around. The **Root**
creates a shared context via Angular dependency injection, and every child injects it:

```ts
// The Root provides a context object…
@Directive({
  selector: '[rdxTabsRoot]',
  providers: [provideTabsRootContext(/* … */)]
})
export class RdxTabsRoot {
  /* owns the selected value, orientation, registration of tabs… */
}

// …and each child reads it — no inputs threaded through the template.
export class RdxTabsTab {
  private readonly rootContext = injectTabsRootContext();
  protected readonly active = computed(() => this.rootContext.value() === this.value());
}
```

That's why a part only works **inside** its Root: `rdxTabsTab` placed on its own has nothing to
inject and throws. It also means parts can sit anywhere in the subtree — directly under the Root or
nested ten levels deep — and still coordinate. The pattern is identical for every family
(`injectFooRootContext` / `provideFooRootContext`); see **Guides/Inject Context** for the details.

## Naming you can rely on

Parts follow one convention, so once you know a family you can guess the rest:

| Part | Role |
| --- | --- |
| `rdx<Name>Root` | Owns shared state, provides the context |
| `rdx<Name>Trigger` / `rdxTabsTab` | The interactive control |
| `rdx<Name>Content` / `rdxTabsPanel` | The region the trigger reveals |
| `rdx<Name>List`, `Indicator`, `Title`, `Close`, … | Supporting parts, opt-in |

Each part also sets `exportAs`, so you can grab a template reference when you need its state:
`<button rdxTabsTab #tab="rdxTabsTab" value="1">`.

## Next

→ **Controlled & uncontrolled** — the Root above tracked the selected tab on its own. Next: when to
let it, and when to hold that state in your application instead.
