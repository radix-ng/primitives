# Portal

#### Renders its host element into a different part of the DOM (`document.body` by default).

The badge is declared inside a clipping box, yet `rdxPortal` renders it under `document.body`, so it escapes
`overflow: hidden` and pins to the viewport corner.

```html
<section class="font-sans">
    <div
        class="border-border bg-card text-card-foreground relative h-48 w-96 overflow-hidden rounded-xl border-2 border-dashed p-5 shadow-sm"
    >
        <h3 class="text-foreground mb-2 text-sm font-semibold">Clipping box</h3>
        <p class="text-muted-foreground text-sm leading-6">
            This box has
            <code class="border-border bg-muted text-foreground rounded border px-1.5 py-0.5 text-xs">
                overflow: hidden
            </code>
            . The badge is declared
            <strong>inside</strong>
            it, but
            <code class="border-border bg-muted text-foreground rounded border px-1.5 py-0.5 text-xs">
                rdxPortal
            </code>
            moves it to
            <code class="border-border bg-muted text-foreground rounded border px-1.5 py-0.5 text-xs">
                document.body
            </code>
            , so it escapes the clipping and pins to the viewport corner.
        </p>

        <div
            class="bg-primary text-primary-foreground fixed top-4 right-4 z-[1000] rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg"
            rdxPortal
        >
            Portaled to &lt;body&gt;
        </div>
    </div>
</section>
```

## Features

- ✅ Teleports the element it is attached to out of the normal document flow.
- ✅ Appends to `document.body` by default, or to a custom container element.
- ✅ Reactive container — changing the target moves the element to the new container.
- ✅ Restores the element to its original position when destroyed.
- ✅ SSR safe — does nothing on the server.

## Anatomy

`rdxPortal` is an attribute directive applied directly to the element you want to teleport.

```html
<div rdxPortal>This content is moved to the document body.</div>
```

## Basic Usage

Add `rdxPortal` to any element. On the browser it is detached from its current position and appended to
`document.body`, leaving a comment node behind as an anchor so it can be put back on destroy.

```typescript
import { Component } from '@angular/core';
import { RdxPortal } from '@radix-ng/primitives/portal';

@Component({
    selector: 'app-example',
    imports: [RdxPortal],
    template: `
        <div class="card">
            <h2>Card</h2>

            <!-- Rendered under <body>, not inside .card -->
            <div rdxPortal class="overlay">Portaled content</div>
        </div>
    `
})
export class ExampleComponent {}
```

## Custom Container

Use the `container` input to portal into a specific element instead of `document.body`. It accepts an
`ElementRef`, a native `HTMLElement`, or a CSS selector string (resolved against the document). When a
selector matches nothing, it falls back to `document.body`. The move is reactive: if the bound container
changes later, the element is relocated to the new one.

```html
<section class="flex w-full max-w-3xl gap-4 font-sans">
    <div
        class="border-border bg-card text-card-foreground min-h-36 flex-1 rounded-xl border-2 border-dashed p-5"
    >
        <h3 class="text-foreground mb-2 text-sm font-semibold">Source</h3>
        <p class="text-muted-foreground text-sm leading-6">The pill below is declared here...</p>

        <!-- Resolved against the document via a CSS selector -->
        <div
            class="bg-primary text-primary-foreground mt-3 inline-block rounded-full px-3.5 py-2 text-sm font-semibold shadow-sm"
            container="#portal-target"
            rdxPortal
        >
            Rendered into the target container
        </div>
    </div>

    <div
        class="border-primary bg-card text-card-foreground min-h-36 flex-1 rounded-xl border-2 border-dashed p-5"
        id="portal-target"
    >
        <h3 class="text-foreground mb-2 text-sm font-semibold">Target (#portal-target)</h3>
    </div>
</section>
```

```typescript
import { Component, ElementRef, viewChild } from '@angular/core';
import { RdxPortal } from '@radix-ng/primitives/portal';

@Component({
    selector: 'app-example',
    imports: [RdxPortal],
    template: `
        <div #host class="portal-host"></div>

        <!-- ElementRef -->
        <div rdxPortal [container]="host()">Rendered inside .portal-host</div>

        <!-- Native element -->
        <div rdxPortal [container]="host().nativeElement">…</div>

        <!-- CSS selector -->
        <div rdxPortal container=".portal-host">…</div>
    `
})
export class ExampleComponent {
    readonly host = viewChild.required('host', { read: ElementRef });
}
```

You can also change the container imperatively via the exported instance:

```html
<div rdxPortal #portal="rdxPortal">…</div>
```

```typescript
portal.setContainer(someElementRef);
```

## Notes

- The directive moves **the element it is attached to**, so place `rdxPortal` on the element you want to teleport.
- On destroy the element is returned to its original position (tracked by an internal comment anchor), so Angular
  can tear the view down cleanly.
- The default container is `document.body`; the provided `container` takes precedence when set.

## API Reference

### RdxPortal
