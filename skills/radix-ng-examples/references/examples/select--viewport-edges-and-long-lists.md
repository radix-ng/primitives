# Select — Viewport edges and long lists

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

This example keeps the item-aligned trigger near an edge of the viewport. Use the `edge` and `dir`
controls to try top, middle, bottom and RTL layouts. Home and End reveal the first and last options,
including list padding. When scroll buttons change the list's height, Select keeps the keyboard
highlight visible after layout settles. Hovering an option does not scroll the list.

```typescript
import { Component, computed, input, signal, viewChild } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import { demoSelect } from '../../storybook/styles';
import { _importsSelect, RdxSelectRoot } from '../index';

@Component({
    selector: 'select-viewport-edges',
    imports: [_importsSelect, RdxDirectionProvider, LucideCheck, LucideChevronDown, LucideChevronUp],
    host: { '(document:keydown)': 'closeShortcut($event)' },
    template: `
        <div class="text-muted-foreground max-w-64 text-sm">
            Open the list and press Home or End. The highlighted item stays visible when scroll buttons appear. F10
            closes the popup.
        </div>
        <div
            class="fixed start-8 grid w-64 gap-3"
            [class]="
                edge() === 'near-top'
                    ? '-top-6'
                    : edge() === 'bottom'
                      ? 'bottom-2'
                      : edge() === 'middle'
                        ? 'top-24'
                        : 'top-0'
            "
            [direction]="dir()"
            [attr.dir]="dir()"
            rdxDirectionProvider
        >
            <ng-container [(value)]="value" [defaultValue]="initial()" rdxSelectRoot>
                <div class="text-sm font-medium" rdxSelectLabel>Viewport edge</div>
                <button [class]="s.trigger" rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                    <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template
                    [container]="transformed() ? portalHost : undefined"
                    [keepMounted]="keepMounted()"
                    rdxSelectPortal
                >
                    <div [class]="s.positioner" rdxSelectItemAlignedPosition>
                        <div class="min-h-0 flex-1" data-testid="viewport-popup" rdxSelectPopup>
                            <div
                                class="min-h-0 flex-1 overflow-hidden"
                                [class]="s.popup + (capped() ? ' max-h-60' : '')"
                                rdxSelectItemAlignedPositionContent
                            >
                                @if (showArrow()) {
                                    <div [class]="s.arrow" rdxSelectArrow></div>
                                }
                                <div [class]="s.scrollButton" rdxSelectScrollUpButton>
                                    <svg [class]="s.icon" lucideChevronUp size="16" aria-hidden="true" />
                                </div>
                                <div class="min-h-0" [class]="s.list" rdxSelectList>
                                    @for (option of options; track option) {
                                        <div [class]="s.item" [value]="option" rdxSelectItem>
                                            <span [class]="s.itemIndicator" rdxSelectItemIndicator aria-hidden="true">
                                                <svg [class]="s.icon" lucideCheck size="16" />
                                            </span>
                                            <span rdxSelectItemText>{{ option }}</span>
                                        </div>
                                    }
                                </div>
                                <div [class]="s.scrollButton" rdxSelectScrollDownButton>
                                    <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </div>
        <div
            #portalHost
            [class]="
                transformed()
                    ? 'border-border pointer-events-none fixed inset-8 translate-x-2 translate-y-2 border'
                    : 'contents'
            "
            data-testid="viewport-portal"
        ></div>
    `
})
export class SelectViewportEdges {
    private readonly root = viewChild(RdxSelectRoot);
    closeShortcut(event: KeyboardEvent) {
        if (event.key === 'F10') {
            event.preventDefault();
            this.root()?.close();
        }
    }
    protected readonly s = demoSelect;
    readonly edge = input<'top' | 'middle' | 'bottom' | 'near-top'>('top');
    readonly initialIndex = input<number>();
    readonly capped = input(false);
    readonly transformed = input(false);
    readonly keepMounted = input(false);
    readonly showArrow = input(false);
    readonly dir = input<'ltr' | 'rtl'>('ltr');
    readonly options = Array.from({ length: 40 }, (_, i) => `Item ${String(i).padStart(2, '0')}`);
    readonly initial = computed(
        () => this.options[this.initialIndex() ?? (this.edge() === 'bottom' ? 38 : this.edge() === 'middle' ? 18 : 1)]
    );
    readonly value = signal<string | null | undefined>(undefined);
}
```
