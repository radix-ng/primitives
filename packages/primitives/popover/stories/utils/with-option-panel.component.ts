import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    Component,
    computed,
    contentChild,
    ElementRef,
    inject,
    isDevMode,
    model,
    signal
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxPopoverRootDirective } from '../../src/popover-root.directive';
import { paramsAndEventsOnly } from './styles.constants';
import { Message } from './types';

@Component({
    selector: 'popover-with-option-panel',
    styles: paramsAndEventsOnly,
    template: `
        <ng-content select=".ParamsContainer" />

        @if (paramsContainerCounter() > 2) {
            <hr />
        }

        <div class="ParamsContainer">
            <input
                [ngModel]="onOverlayEscapeKeyDownDisabled()"
                (ngModelChange)="onOverlayEscapeKeyDownDisabled.set($event)"
                type="checkbox"
            />
            Disable (onOverlayEscapeKeyDown) event
            <input
                [ngModel]="onOverlayOutsideClickDisabled()"
                (ngModelChange)="onOverlayOutsideClickDisabled.set($event)"
                type="checkbox"
            />
            Disable (onOverlayOutsideClick) event
        </div>

        <div class="ParamsContainer">
            Arrow width
            <input [ngModel]="arrowWidth()" (ngModelChange)="arrowWidth.set($event)" type="number" />
            Arrow height
            <input [ngModel]="arrowHeight()" (ngModelChange)="arrowHeight.set($event)" type="number" />
        </div>

        <ng-content />

        @if (messages().length) {
            <button class="SkipOutsideClickPrevention" (click)="messages.set([])" type="button">Clear messages</button>
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
    imports: [ReactiveFormsModule, FormsModule, NgTemplateOutlet]
})
export class WithOptionPanelComponent {
    onOverlayEscapeKeyDownDisabled = model(false);
    onOverlayOutsideClickDisabled = model(false);

    arrowWidth = model<number>(0);
    arrowHeight = model<number>(0);

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly popoverRootDirective = contentChild.required(RdxPopoverRootDirective);

    readonly paramsContainerCounter = signal(0);

    readonly messages = signal<Message[]>([]);
    readonly rootUniqueId = computed(() => this.popoverRootDirective().uniqueId());

    /**
     * There should be only one container. If there is more, en error is thrown.
     */
    containers: Element[] | undefined = void 0;
    paramsContainers: Element[] | undefined = void 0;

    previousMessageTimestamp: number | undefined = void 0;

    timeFromPrev = () => {
        const now = Date.now();
        const timeFromPrev =
            typeof this.previousMessageTimestamp === 'undefined' ? 0 : Date.now() - this.previousMessageTimestamp;
        this.previousMessageTimestamp = now;
        return timeFromPrev;
    };

    constructor() {
        afterNextRender({
            read: () => {
                this.popoverRootDirective().popoverContentDirective().onOpen.subscribe(this.onOpen);
                this.popoverRootDirective().popoverContentDirective().onClosed.subscribe(this.onClose);
                this.popoverRootDirective()
                    .popoverContentDirective()
                    .onOverlayOutsideClick.subscribe(this.onOverlayOutsideClick);
                this.popoverRootDirective()
                    .popoverContentDirective()
                    .onOverlayEscapeKeyDown.subscribe(this.onOverlayEscapeKeyDown);

                /**
                 * There should be only one container. If there is more, en error is thrown.
                 */
                this.containers = Array.from(this.elementRef.nativeElement?.querySelectorAll('.container') ?? []);
                if (this.containers.length > 1) {
                    if (isDevMode()) {
                        console.error('<story>.elementRef.nativeElement', this.elementRef.nativeElement);
                        console.error('<story>.containers', this.containers);
                        throw Error('each story should have only one container!');
                    }
                }
                this.paramsContainers = Array.from(
                    this.elementRef.nativeElement?.querySelectorAll('.ParamsContainer') ?? []
                );

                this.paramsContainerCounter.set(this.paramsContainers.length ?? 0);
            }
        });
    }

    private inContainers(element: Element) {
        return !!this.containers?.find((container) => container.contains(element));
    }

    private inParamsContainers(element: Element) {
        return !!this.paramsContainers?.find((container) => container.contains(element));
    }

    private onOverlayEscapeKeyDown = () => {
        this.addMessage({
            value: `[PopoverRoot] Escape clicked! (disabled: ${this.onOverlayEscapeKeyDownDisabled()})`,
            timeFromPrev: this.timeFromPrev()
        });
    };

    private onOverlayOutsideClick = () => {
        this.addMessage({
            value: `[PopoverRoot] Mouse clicked outside the popover! (disabled: ${this.onOverlayOutsideClickDisabled()})`,
            timeFromPrev: this.timeFromPrev()
        });
    };

    private onOpen = () => {
        this.addMessage({ value: '[PopoverContent] Open', timeFromPrev: this.timeFromPrev() });
    };

    private onClose = () => {
        this.addMessage({ value: '[PopoverContent] Closed', timeFromPrev: this.timeFromPrev() });
    };

    protected addMessage = (message: Message) => {
        this.messages.update((messages) => {
            return [message, ...messages];
        });
    };
}
