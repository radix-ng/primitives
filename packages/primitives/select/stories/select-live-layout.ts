import { Component, computed, input, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { demoSelect } from '../../storybook/styles';
import { _importsSelect } from '../index';

@Component({
    selector: 'select-live-layout',
    imports: [_importsSelect, LucideCheck, LucideChevronDown, LucideChevronUp],
    host: { '(document:keydown)': 'onCommand($event)' },
    template: `
        <p class="text-muted-foreground max-w-96 text-sm">
            Open the list, then use F2 to change width, F3 for taller rows, F4 to scale the trigger, and F6 to move it.
            Anchored mode follows the trigger; item alignment keeps its opening position.
        </p>
        <div
            [class]="scrollable() ? 'border-border fixed start-4 top-16 h-80 w-96 overflow-auto border' : 'contents'"
            data-testid="live-scroller"
        >
            <form
                class="grid w-64 gap-3"
                [class]="(scrollable() ? 'm-16' : 'fixed start-8 top-32') + formClass()"
                (submit)="$event.preventDefault()"
            >
                <ng-container [(value)]="value" [modal]="false" rdxSelectRoot>
                    <div class="text-sm font-medium" rdxSelectLabel>Destination</div>
                    <button [class]="s.trigger" rdxSelectTrigger>
                        <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                        <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                    </button>
                    <ng-template [container]="portalScale() ? portalHost : undefined" rdxSelectPortal>
                        @if (aligned()) {
                            <div
                                [class]="s.positioner"
                                [disableAnchorTracking]="disableTracking()"
                                sideOffset="5"
                                rdxSelectItemAlignedPosition
                            >
                                <div class="min-h-0 flex-1" rdxSelectPopup>
                                    <div
                                        [class]="s.popup + ' min-h-0 flex-1 overflow-hidden' + heightClass()"
                                        rdxSelectItemAlignedPositionContent
                                    >
                                        <div
                                            [class]="s.scrollButton + ' absolute inset-x-0 top-0 z-10'"
                                            rdxSelectScrollUpButton
                                        >
                                            <svg [class]="s.icon" lucideChevronUp size="16" aria-hidden="true" />
                                        </div>
                                        <div class="min-h-0" [class]="s.list" rdxSelectList>
                                            @for (option of options; track option) {
                                                <div
                                                    [class]="s.item + (tall() ? ' py-4!' : '')"
                                                    [value]="option"
                                                    rdxSelectItem
                                                >
                                                    <span
                                                        [class]="s.itemIndicator"
                                                        rdxSelectItemIndicator
                                                        aria-hidden="true"
                                                    >
                                                        <svg [class]="s.icon" lucideCheck size="16" />
                                                    </span>
                                                    <span rdxSelectItemText>{{ option }}</span>
                                                </div>
                                            }
                                        </div>
                                        <div
                                            [class]="s.scrollButton + ' absolute inset-x-0 bottom-0 z-10'"
                                            rdxSelectScrollDownButton
                                        >
                                            <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        } @else {
                            <div
                                [class]="s.positioner"
                                [disableAnchorTracking]="disableTracking()"
                                [hideWhenDetached]="hideWhenDetached()"
                                sideOffset="5"
                                align="start"
                                rdxSelectPositioner
                            >
                                <div
                                    [class]="s.popup + ' flex min-h-0 flex-col overflow-hidden' + heightClass()"
                                    rdxSelectPopup
                                >
                                    <div
                                        [class]="s.scrollButton + ' absolute inset-x-0 top-0 z-10'"
                                        rdxSelectScrollUpButton
                                    >
                                        <svg [class]="s.icon" lucideChevronUp size="16" aria-hidden="true" />
                                    </div>
                                    <div class="min-h-0" [class]="s.list" rdxSelectList>
                                        @for (option of options; track option) {
                                            <div
                                                [class]="s.item + (tall() ? ' py-4!' : '')"
                                                [value]="option"
                                                rdxSelectItem
                                            >
                                                <span
                                                    [class]="s.itemIndicator"
                                                    rdxSelectItemIndicator
                                                    aria-hidden="true"
                                                >
                                                    <svg [class]="s.icon" lucideCheck size="16" />
                                                </span>
                                                <span rdxSelectItemText>{{ option }}</span>
                                            </div>
                                        }
                                    </div>
                                    <div
                                        [class]="s.scrollButton + ' absolute inset-x-0 bottom-0 z-10'"
                                        rdxSelectScrollDownButton
                                    >
                                        <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                                    </div>
                                </div>
                            </div>
                        }
                    </ng-template>
                </ng-container>
            </form>
            @if (scrollable()) {
                <div class="h-[600px]" aria-hidden="true"></div>
            }
        </div>
        <div class="fixed start-8 bottom-8 flex max-w-96 flex-wrap gap-2 text-xs">
            <button
                class="border-border bg-background rounded border px-3 py-2"
                [attr.aria-pressed]="wide()"
                (click)="wide.set(!wide())"
            >
                Width (F2)
            </button>
            <button
                class="border-border bg-background rounded border px-3 py-2"
                [attr.aria-pressed]="tall()"
                (click)="tall.set(!tall())"
            >
                Rows (F3)
            </button>
            <button
                class="border-border bg-background rounded border px-3 py-2"
                [attr.aria-pressed]="scaled()"
                (click)="scaled.set(!scaled())"
            >
                Scale (F4)
            </button>
            <button
                class="border-border bg-background rounded border px-3 py-2"
                [attr.aria-pressed]="moved()"
                (click)="moved.set(!moved())"
            >
                Move (F6)
            </button>
        </div>
        <div
            #portalHost
            [class]="portalScale() ? 'pointer-events-none fixed inset-8 origin-top-left scale-110' : 'contents'"
            data-testid="live-portal"
        ></div>
    `
})
export class SelectLiveLayout {
    protected readonly s = demoSelect;
    readonly aligned = input(false);
    readonly tracking = input<'auto' | 'on' | 'off'>('auto');
    readonly portalScale = input(false);
    readonly hideWhenDetached = input(false);
    readonly scrollable = input(false);
    readonly disableTracking = computed(() => (this.tracking() === 'auto' ? undefined : this.tracking() === 'off'));
    readonly wide = signal(false);
    readonly tall = signal(false);
    readonly scaled = signal(false);
    readonly moved = signal(false);
    readonly value = signal<string | null>('Item 18');
    readonly options = Array.from({ length: 40 }, (_, i) => `Item ${String(i).padStart(2, '0')}`);
    readonly formClass = computed(
        () =>
            (this.wide() ? ' w-80!' : '') +
            (this.scaled() ? ' origin-top-left scale-125' : '') +
            (this.moved() ? ' translate-x-12 translate-y-8' : '')
    );
    readonly heightClass = computed(() =>
        this.aligned()
            ? ' data-[side=top]:max-h-[var(--available-height)] data-[side=bottom]:max-h-[var(--available-height)]'
            : ' max-h-[var(--available-height)]'
    );
    onCommand(event: KeyboardEvent) {
        const target = (
            { F2: this.wide, F3: this.tall, F4: this.scaled, F6: this.moved } as Record<string, typeof this.wide>
        )[event.key];
        if (!target) return;
        event.preventDefault();
        target.update((value) => !value);
    }
}
