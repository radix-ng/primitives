# Drawer — Indent effect

> One example from the [Drawer](../components/drawer.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Wrap content in `rdxDrawerProvider` (or call `provideRdxDrawerProvider()` at the app root) and mark a
background layer with `rdxDrawerIndentBackground` and the foreground page with `rdxDrawerIndent`.
Both gain `[data-active]`, `--drawer-swipe-progress`, `--nested-drawers`, and
`--drawer-frontmost-height` while any drawer is open, so the page-scale effect follows the closing
gesture.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxDrawerBackdrop,
    RdxDrawerClose,
    RdxDrawerContent,
    RdxDrawerDescription,
    RdxDrawerIndent,
    RdxDrawerIndentBackground,
    RdxDrawerPopup,
    RdxDrawerPortal,
    RdxDrawerProviderDirective,
    RdxDrawerRoot,
    RdxDrawerTitle,
    RdxDrawerTrigger,
    RdxDrawerViewport
} from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-page-scale',
    imports: [
        RdxDrawerProviderDirective,
        RdxDrawerRoot,
        RdxDrawerTrigger,
        RdxDrawerPortal,
        RdxDrawerBackdrop,
        RdxDrawerViewport,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription,
        RdxDrawerClose,
        RdxDrawerIndent,
        RdxDrawerIndentBackground
    ],
    template: `
        <div class="w-full" rdxDrawerProvider>
            <div class="relative w-full overflow-hidden [--bleed:3rem]" #portalContainer>
                <div class="bg-foreground absolute inset-0" rdxDrawerIndentBackground></div>

                <div
                    class="border-border bg-background text-foreground relative min-h-80 origin-top [transform:scale(1)_translateY(0)] border p-4 [transition-duration:calc(var(--duration-demo-drawer-page-transform)*var(--indent-transition)),calc(var(--duration-demo-drawer-page-radius)*var(--indent-transition))] will-change-transform [--indent-radius:calc(1rem*(1-var(--drawer-swipe-progress)))] [--indent-transition:calc(1-clamp(0,calc(var(--drawer-swipe-progress)*100000),1))] [transition:var(--transition-demo-drawer-page)] data-[active]:[transform:scale(calc(0.98+(0.02*var(--drawer-swipe-progress))))_translateY(calc(0.5rem*(1-var(--drawer-swipe-progress))))] data-[active]:rounded-tl-[var(--indent-radius)] data-[active]:rounded-tr-[var(--indent-radius)]"
                    rdxDrawerIndent
                >
                    <div class="flex min-h-80 items-center justify-center">
                        <div [modal]="false" rdxDrawerRoot>
                            <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDrawerTrigger>
                                Open drawer
                            </button>

                            <ng-template [container]="portalContainer" rdxDrawerPortal>
                                <div
                                    class="bg-foreground/20 ease-demo-drawer-swipe absolute inset-0 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-(--duration-demo-drawer-swipe) data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                                    rdxDrawerBackdrop
                                ></div>

                                <div class="absolute inset-0 z-20 flex items-end justify-center" rdxDrawerViewport>
                                    <div
                                        class="border-border bg-card text-card-foreground -mb-[var(--bleed)] max-h-[calc(80vh+var(--bleed))] w-full [transform:translateY(var(--drawer-swipe-movement-y))] overflow-y-auto overscroll-contain border-t px-6 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+var(--bleed))] shadow-lg outline-none [transition:var(--transition-demo-drawer-swipe)] data-[ending-style]:[transform:translateY(calc(100%-var(--bleed)+2px))] data-[starting-style]:[transform:translateY(calc(100%-var(--bleed)+2px))] data-[swiping]:select-none data-[swiping]:[transition:none]"
                                        rdxDrawerPopup
                                    >
                                        <div class="bg-muted mx-auto mb-4 h-1 w-12"></div>
                                        <div class="mx-auto w-full max-w-lg" rdxDrawerContent>
                                            <h2 class="demo-dialog-title text-center" rdxDrawerTitle>Notifications</h2>
                                            <p
                                                class="text-muted-foreground mt-1.5 mb-6 text-center text-sm"
                                                rdxDrawerDescription
                                            >
                                                You are all caught up. Good job!
                                            </p>
                                            <div class="flex justify-center gap-3">
                                                <button
                                                    class="demo-button demo-button-outline h-8 px-3 text-xs"
                                                    rdxDrawerClose
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ng-template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class RdxDrawerPageScaleComponent {}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
