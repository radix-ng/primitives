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

```html
<div class="${rootClass}" rdxTabsRoot defaultValue="account">
    <div class="${listClass}" rdxTabsList>
        <button class="${tabClass}" rdxTabsTab value="account">Account</button>
        <button class="${tabClass}" rdxTabsTab value="password">Password</button>
    </div>
    <div class="${panelClass}" rdxTabsPanel value="account">
        Make changes to your account here. Click save when you're done.
    </div>
    <div class="${panelClass}" rdxTabsPanel value="password">
        Change your password here. After saving, you'll be logged out.
    </div>
</div>
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
