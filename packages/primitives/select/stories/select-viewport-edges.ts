import { Component, computed, input, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import { demoSelect } from '../../storybook/styles';
import { _importsSelect } from '../index';

@Component({
    selector: 'select-viewport-edges',
    imports: [_importsSelect, RdxDirectionProvider, LucideCheck, LucideChevronDown, LucideChevronUp],
    template: `
        <div class="text-muted-foreground max-w-64 text-sm">
            Open the list and press Home or End. The highlighted item stays visible when scroll buttons appear.
        </div>
        <div
            class="fixed start-8 grid w-64 gap-3"
            [class]="edge() === 'bottom' ? 'bottom-2' : edge() === 'middle' ? 'top-24' : 'top-0'"
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
                <ng-template rdxSelectPortal>
                    <div [class]="s.positioner" rdxSelectItemAlignedPosition>
                        <div class="min-h-0 flex-1" rdxSelectPopup>
                            <div
                                class="min-h-0 flex-1 overflow-hidden"
                                [class]="s.popup"
                                rdxSelectItemAlignedPositionContent
                            >
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
    `
})
export class SelectViewportEdges {
    protected readonly s = demoSelect;
    readonly edge = input<'top' | 'middle' | 'bottom'>('top');
    readonly dir = input<'ltr' | 'rtl'>('ltr');
    readonly options = Array.from({ length: 40 }, (_, i) => `Item ${String(i).padStart(2, '0')}`);
    readonly initial = computed(() => this.options[this.edge() === 'bottom' ? 38 : this.edge() === 'middle' ? 18 : 1]);
    readonly value = signal<string | null | undefined>(undefined);
}
