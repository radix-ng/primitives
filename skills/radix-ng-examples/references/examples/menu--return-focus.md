# Menu — Return focus

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

`finalFocus` accepts an element, `false`, or a callback receiving the closing interaction type.
Escape honors that policy; `false` leaves focus unrestored. Forward Tab preserves its native
destination even with an explicit target. Shift+Tab requests a cancelable return to the owner;
a veto keeps the current item focused. Canceling forward focus-out keeps the menu open, and its
portal guards determine whether focus enters a parent control or returns to the menu.

The example exposes separate parent/child policies and focus-out cancellation. Call
`change.eventDetails.cancel()` in `onOpenChange` to veto the request.

```typescript
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { RdxInteractionType, RdxReturnFocus } from '@radix-ng/primitives/floating-focus-manager';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSubTrigger,
    RdxMenuTrigger,
    type RdxMenuOpenChange
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-focus-return',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid w-80 gap-4">
            <div class="grid gap-2 text-sm">
                <label for="menu-root-return">Parent return focus</label>
                <select
                    class="demo-input h-9 w-full px-3"
                    id="menu-root-return"
                    #rootChoice
                    [value]="rootMode()"
                    (change)="rootMode.set(rootChoice.value)"
                >
                    <option value="auto">Automatic</option>
                    <option value="none">None</option>
                    <option value="custom">Return target</option>
                    <option value="callback-default">Callback: default target</option>
                    <option value="callback-skip">Callback: skip return</option>
                </select>
                <label for="menu-child-return">Child return focus</label>
                <select
                    class="demo-input h-9 w-full px-3"
                    id="menu-child-return"
                    #childChoice
                    [value]="childMode()"
                    (change)="childMode.set(childChoice.value)"
                >
                    <option value="auto">Automatic</option>
                    <option value="none">None</option>
                    <option value="custom">Parent field</option>
                    <option value="callback-default">Callback: default target</option>
                    <option value="callback-skip">Callback: skip return</option>
                </select>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-veto-parent"
                        #parentVeto
                        [checked]="cancelParent()"
                        (change)="cancelParent.set(parentVeto.checked)"
                        type="checkbox"
                    />
                    <label for="menu-veto-parent">Cancel parent focus-out</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-veto-child"
                        #childVeto
                        [checked]="cancelChild()"
                        (change)="cancelChild.set(childVeto.checked)"
                        type="checkbox"
                    />
                    <label for="menu-veto-child">Cancel child focus-out</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-return-retained"
                        #retained
                        [checked]="keepMounted()"
                        (change)="keepMounted.set(retained.checked)"
                        type="checkbox"
                    />
                    <label for="menu-return-retained">Keep mounted</label>
                </div>
            </div>
            <button class="demo-button demo-button-outline h-9 px-4" #returnTarget>Return target</button>
            <ng-container (onOpenChange)="change('Parent', $event)" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Focus policies</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div class="z-50 data-[closed]:pointer-events-none" sideOffset="4" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            [finalFocus]="policy(rootMode(), returnTarget)"
                            rdxMenuPopup
                        >
                            @if (childMode() === 'custom') {
                                <input
                                    class="demo-input h-9 w-full px-3"
                                    #parentField
                                    aria-label="Child return target"
                                    placeholder="Child return target"
                                />
                            }
                            <ng-container (onOpenChange)="change('Child', $event)" rdxMenuRoot>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuSubTrigger
                                >
                                    More commands
                                </button>
                                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                    <div
                                        class="z-50 data-[closed]:pointer-events-none"
                                        side="right"
                                        sideOffset="4"
                                        rdxMenuPositioner
                                    >
                                        <div
                                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                            [finalFocus]="policy(childMode(), parentField()?.nativeElement)"
                                            rdxMenuPopup
                                        >
                                            <button
                                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                                rdxMenuItem
                                            >
                                                Run command
                                            </button>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                            <button
                                class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                rdxMenuItem
                            >
                                Close menu
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <button class="demo-button demo-button-outline h-9 px-4">After menu</button>
            <output class="text-muted-foreground text-sm" aria-live="polite">{{ lastChange() }}</output>
            <p class="text-muted-foreground text-sm" aria-live="polite">{{ lastReturn() }}</p>
        </div>
    `
})
export class RdxMenuFocusReturnComponent {
    protected readonly rootMode = signal('auto');
    protected readonly childMode = signal('auto');
    protected readonly cancelParent = signal(false);
    protected readonly cancelChild = signal(false);
    protected readonly keepMounted = signal(true);
    protected readonly lastChange = signal('No close requested');
    protected readonly lastReturn = signal('No return callback invoked');
    protected readonly parentField = viewChild('parentField', { read: ElementRef<HTMLElement> });
    private readonly returnDefault = (type: RdxInteractionType) => {
        this.lastReturn.set(`Return callback: ${type ?? 'programmatic'} → default target`);
        return null;
    };
    private readonly skipReturn = (type: RdxInteractionType) => {
        this.lastReturn.set(`Return callback: ${type ?? 'programmatic'} → skip return`);
        return undefined;
    };
    protected policy(mode: string, target?: HTMLElement): RdxReturnFocus {
        if (mode === 'custom') return target;
        if (mode === 'none') return false;
        if (mode === 'callback-default') return this.returnDefault;
        if (mode === 'callback-skip') return this.skipReturn;
        return undefined;
    }
    protected change(layer: 'Parent' | 'Child', change: RdxMenuOpenChange) {
        if (change.open) return;
        if (change.reason === 'focus-out' && (layer === 'Parent' ? this.cancelParent() : this.cancelChild()))
            change.eventDetails.cancel();
        this.lastChange.set(`${layer}: ${change.reason}${change.eventDetails.isCanceled() ? ' (canceled)' : ''}`);
    }
}
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
