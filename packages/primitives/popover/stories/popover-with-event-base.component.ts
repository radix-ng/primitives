import { NgTemplateOutlet } from '@angular/common';
import { AfterContentInit, Component, computed, contentChild, ElementRef, inject, model, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxPopoverContentDirective } from '../src/popover-content.directive';
import { RdxPopoverRootDirective } from '../src/popover-root.directive';
import { paramsAndEventsOnly } from './popover-styles.constants';

@Component({
    selector: 'popover-with-event-base',
    styles: paramsAndEventsOnly,
    template: `
        <ng-content select=".ParamsContainer" />

        @if (paramsContainerCounter()) {
            <hr />
        }

        <div class="ParamsContainer">
            (onEscapeKeyDown) prevent default:
            <input
                [ngModel]="onEscapeKeyDownPreventDefault()"
                (ngModelChange)="onEscapeKeyDownPreventDefault.set($event)"
                type="checkbox"
            />
            (onPointerDownOutside) prevent default:
            <input
                [ngModel]="onPointerDownOutsidePreventDefault()"
                (ngModelChange)="onPointerDownOutsidePreventDefault.set($event)"
                type="checkbox"
            />
        </div>

        <ng-content />

        @if (messages().length) {
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
                <span class="MessageId">[POPOVER ID {{ rootUniqueId() }}]</span>
                {{ message }}
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
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly popoverContentDirective = contentChild.required(RdxPopoverContentDirective);
    readonly popoverRootDirective = contentChild.required(RdxPopoverRootDirective);

    readonly paramsContainerCounter = signal(0);

    readonly messages = model<string[]>([]);
    readonly onEscapeKeyDownPreventDefault = signal(false);
    readonly onPointerDownOutsidePreventDefault = signal(false);

    readonly rootUniqueId = computed(() => this.popoverRootDirective().uniqueId());

    containers: Element[] | undefined = void 0;

    ngAfterContentInit() {
        this.popoverContentDirective().onShow.subscribe(this.onShow);
        this.popoverContentDirective().onHide.subscribe(this.onHide);
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
        this.addMessage(`Escape clicked! (preventDefault: ${this.onEscapeKeyDownPreventDefault()})`);
        this.onEscapeKeyDownPreventDefault() && event.preventDefault();
    };

    private onPointerDownOutside = (event: MouseEvent) => {
        if (!event.target || !this.inContainers(event.target as HTMLElement)) {
            return;
        }
        this.addMessage(
            `Mouse clicked outside the popover! (preventDefault: ${this.onPointerDownOutsidePreventDefault()})`
        );
        this.onPointerDownOutsidePreventDefault() && event.preventDefault();
    };

    private onShow = () => {
        this.addMessage('Popover shown!');
    };

    private onHide = () => {
        this.addMessage('Popover hidden!');
    };

    protected addMessage = (message: string) => {
        this.messages.update((messages) => {
            return [
                message,
                ...messages
            ];
        });
    };
}
