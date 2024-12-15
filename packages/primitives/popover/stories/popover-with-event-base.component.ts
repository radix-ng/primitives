import { NgTemplateOutlet } from '@angular/common';
import { AfterContentInit, Component, computed, contentChild, ElementRef, inject, input, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxPopoverContentDirective } from '../src/popover-content.directive';
import { RdxPopoverRootDirective } from '../src/popover-root.directive';
import { paramsAndEventsOnly } from './popover-styles.constants';

type Message = { value: string; timeFromPrev: number };

@Component({
    selector: 'popover-with-event-base',
    styles: paramsAndEventsOnly,
    template: `
        <ng-content select=".ParamsContainer" />

        @if (paramsContainerCounter() > 1) {
            <hr />
        }

        <div class="ParamsContainer">
            <input
                [ngModel]="onEscapeKeyDownPreventDefault()()"
                (ngModelChange)="onEscapeKeyDownPreventDefault().set($event)"
                type="checkbox"
            />
            (onEscapeKeyDown) prevent default
            <input
                [ngModel]="onPointerDownOutsidePreventDefault()()"
                (ngModelChange)="onPointerDownOutsidePreventDefault().set($event)"
                type="checkbox"
            />
            (onPointerDownOutside) prevent default
        </div>

        <ng-content />

        @if (messages().length) {
            <button (click)="messages.set([])" type="button">Clear messages</button>
            <div class="MessagesContainer">
                @for (message of messages(); track i; let i = $index) {
                    <ng-container
                        [ngTemplateOutlet]="messageTpl"
                        [ngTemplateOutletContext]="{ message: message, index: messages().length - i }"
                    />
                }
            </div>
        }

        <ng-template #messageTpl let-message="message" let-index="index">
            <p class="Message">
                {{ index }}.
                <span class="MessageId">[({{ message.timeFromPrev }}ms) POPOVER ID {{ rootUniqueId() }}]</span>
                {{ message.value }}
            </p>
        </ng-template>
    `,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        NgTemplateOutlet
    ],
    standalone: true
})
export class PopoverWithEventBaseComponent implements AfterContentInit {
    onEscapeKeyDownPrevent = input(false);
    onPointerDownOutsidePrevent = input(false);

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly popoverContentDirective = contentChild.required(RdxPopoverContentDirective);
    readonly popoverRootDirective = contentChild.required(RdxPopoverRootDirective);

    readonly paramsContainerCounter = signal(0);

    readonly messages = signal<Message[]>([]);
    readonly onEscapeKeyDownPreventDefault = computed(() => signal(this.onEscapeKeyDownPrevent()));
    readonly onPointerDownOutsidePreventDefault = computed(() => signal(this.onPointerDownOutsidePrevent()));

    readonly rootUniqueId = computed(() => this.popoverRootDirective().uniqueId());

    containers: Element[] | undefined = void 0;

    previousMessageTimestamp: number | undefined = void 0;

    timeFromPrev = () => {
        const now = Date.now();
        const timeFromPrev =
            typeof this.previousMessageTimestamp === 'undefined' ? 0 : Date.now() - this.previousMessageTimestamp;
        this.previousMessageTimestamp = now;
        return timeFromPrev;
    };

    ngAfterContentInit() {
        this.popoverContentDirective().onOpen.subscribe(this.onOpen);
        this.popoverContentDirective().onClosed.subscribe(this.onClose);
        this.popoverContentDirective().onPointerDownOutside.subscribe(this.onPointerDownOutside);
        this.popoverContentDirective().onEscapeKeyDown.subscribe(this.onEscapeKeyDown);

        this.paramsContainerCounter.set(
            this.elementRef.nativeElement?.querySelectorAll('.ParamsContainer').length ?? 0
        );
        this.containers = Array.from(this.elementRef.nativeElement?.querySelectorAll('.container') ?? []);
    }

    private inContainers(element: Element) {
        return !!this.containers?.find((container) => container.contains(element));
    }

    private onEscapeKeyDown = (event: KeyboardEvent) => {
        this.addMessage({
            value: `[PopoverRoot] Escape clicked! (preventDefault: ${this.onEscapeKeyDownPreventDefault()()})`,
            timeFromPrev: this.timeFromPrev()
        });
        this.onEscapeKeyDownPreventDefault()() && event.preventDefault();
    };

    private onPointerDownOutside = (event: MouseEvent) => {
        if (!event.target || !this.inContainers(event.target as HTMLElement)) {
            return;
        }
        this.addMessage({
            value: `[PopoverRoot] Mouse clicked outside the popover! (preventDefault: ${this.onPointerDownOutsidePreventDefault()()})`,
            timeFromPrev: this.timeFromPrev()
        });
        this.onPointerDownOutsidePreventDefault()() && event.preventDefault();
    };

    private onOpen = () => {
        this.addMessage({ value: '[PopoverContent] Open', timeFromPrev: this.timeFromPrev() });
    };

    private onClose = () => {
        this.addMessage({ value: '[PopoverContent] Closed', timeFromPrev: this.timeFromPrev() });
    };

    protected addMessage = (message: Message) => {
        this.messages.update((messages) => {
            return [
                message,
                ...messages
            ];
        });
    };
}
