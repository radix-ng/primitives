# Base UI patterns for Angular

#### How Base UI concepts map to Angular directives.

Radix NG adapts Base UI's compound anatomy and behavior to Angular. Use this page when translating
a React example; check the corresponding primitive's Anatomy and API Reference for its exact contract.

## At a glance

| Concept               | Base UI                             | Radix NG                                                                       |
| --------------------- | ----------------------------------- | ------------------------------------------------------------------------------ |
| Composition           | React components                    | Angular directives on your markup                                              |
| State configuration   | Props                               | Signal inputs and models                                                       |
| Controlled state      | `open` and `onOpenChange`           | `[(open)]`; change notifications vary by primitive                             |
| Uncontrolled state    | `defaultOpen`                       | `[defaultOpen]`                                                                |
| Context between parts | React context                       | Angular dependency injection                                                   |
| Custom elements       | `render` prop                       | Apply a directive to a compatible host; compose wrappers with `hostDirectives` |
| Styling state         | Per-part `data-*` attributes        | Per-part `data-*` attributes                                                   |
| Forms                 | Native forms and React integrations | Angular Forms and Signal Forms                                                 |

## One anatomy, two frameworks

In Base UI, each part is a React component:

```tsx
import { Popover } from '@base-ui/react/popover';

<Popover.Root>
  <Popover.Trigger>Notifications</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner sideOffset={8}>
      <Popover.Popup>
        <Popover.Title>Notifications</Popover.Title>
        <Popover.Description>You are all caught up.</Popover.Description>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>;
```

In Radix NG, directives add the behavior to elements you supply:

```typescript
import { Component } from '@angular/core';
import { popoverImports } from '@radix-ng/primitives/popover';

@Component({
  selector: 'app-notifications',
  imports: [...popoverImports],
  template: `
    <ng-container rdxPopoverRoot>
      <button rdxPopoverTrigger>Notifications</button>
      <div *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
        <div rdxPopoverPopup>
          <h2 rdxPopoverTitle>Notifications</h2>
          <p rdxPopoverDescription>You are all caught up.</p>
        </div>
      </div>
    </ng-container>
  `
})
export class NotificationsComponent {}
```

## Differences to check when translating

- **Host elements.** Replace `render` with a directive on compatible markup. Some selectors require
  a particular native element. For reusable wrappers and projected parts, follow
  [Guides/Composition](../guides/composition.md).
- **Change events.** Base UI callbacks commonly receive event details with a reason and cancellation
  controls. Radix NG outputs vary by primitive; inspect the event type before translating a callback.
- **Part names.** Names and available parts can differ. Follow the Radix NG Anatomy rather than
  copying a React component tree literally.
- **Forms.** Use the Angular integrations described in [Guides/Forms](../guides/forms.md).

### CSP nonces and inline styles

Base UI's `CSPProvider` maps to Angular's `CSP_NONCE` token / `ngCspNonce` for the injected scrollbar
stylesheet in Scroll Area. Scroll Area also exposes `disableStyleElements` to opt out of that
stylesheet. No additional Radix NG CSP provider is needed; see
[Scroll Area](../components/scroll-area.md) for its API.

## Learn the shared concepts

- [Anatomy & parts](../learn/anatomy-and-parts.md) — how parts share context.
- [Controlled & uncontrolled](../learn/controlled-and-uncontrolled.md) — defaults and application-owned state.
- [State & data attributes](../learn/state-data-attributes.md) — styling each part's published state.
