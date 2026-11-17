import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionItemOpenChangeEvent,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective,
    RdxAccordionValueChangeEvent
} from '..';

@Component({
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <div
            [value]="controlled()"
            [defaultValue]="defaults()"
            [multiple]="multiple()"
            [disabled]="disabled()"
            [keepMounted]="keep()"
            [hiddenUntilFound]="findable()"
            (onValueChange)="rootRequest($event)"
            (valueChange)="values.push($event)"
            rdxAccordionRoot
        >
            @for (item of items(); track item.id) {
                <div
                    [value]="item.value"
                    [disabled]="item.disabled ?? false"
                    (onOpenChange)="itemRequest(item.id, $event)"
                    rdxAccordionItem
                >
                    <h3 rdxAccordionHeader>
                        @if (showTrigger()) {
                            @if (nonNative()) {
                                <span [disabled]="localDisabled()" rdxAccordionTrigger>{{ item.id }}</span>
                            } @else {
                                <button
                                    [disabled]="localDisabled()"
                                    [id]="triggerId()"
                                    (click)="consumerClick($event)"
                                    rdxAccordionTrigger
                                >
                                    {{ item.id }}
                                </button>
                            }
                        }
                    </h3>
                    @if (showPanel()) {
                        <div
                            *rdxAccordionPanelPresence="{ keepMounted: panelKeep(), hiddenUntilFound: panelFindable() }"
                            [id]="panelId()"
                            rdxAccordionPanel
                        >
                            Content
                        </div>
                    }
                </div>
            }
        </div>
    `
})
export class AccordionTestHost {
    readonly controlled = signal<unknown[] | undefined>(undefined);
    readonly defaults = signal<unknown[] | undefined>(undefined);
    readonly items = signal<{ id: string; value?: unknown; disabled?: boolean }[]>([
        { id: 'a', value: 'a' },
        { id: 'b', value: 'b' }
    ]);
    readonly multiple = signal(false);
    readonly disabled = signal(false);
    readonly localDisabled = signal(false);
    readonly nonNative = signal(false);
    readonly keep = signal(true);
    readonly findable = signal(false);
    readonly panelKeep = signal<boolean | undefined>(undefined);
    readonly panelFindable = signal<boolean | undefined>(undefined);
    readonly showTrigger = signal(true);
    readonly showPanel = signal(true);
    readonly triggerId = signal<string | undefined>(undefined);
    readonly panelId = signal<string | undefined>(undefined);
    preventClick = false;
    consumerClick(event: Event) {
        if (this.preventClick) event.preventDefault();
    }
    cancelItem = false;
    cancelRoot = false;
    readonly trace: { part: string; request: RdxAccordionItemOpenChangeEvent | RdxAccordionValueChangeEvent }[] = [];
    readonly values: unknown[][] = [];
    itemRequest(id: string, request: RdxAccordionItemOpenChangeEvent) {
        this.trace.push({ part: id, request });
        if (this.cancelItem) request.eventDetails.cancel();
    }
    rootRequest(request: RdxAccordionValueChangeEvent) {
        this.trace.push({ part: 'root', request });
        if (this.cancelRoot) request.eventDetails.cancel();
    }
}

export function setup(configure?: (host: AccordionTestHost) => void) {
    const fixture = TestBed.createComponent(AccordionTestHost);
    const host = fixture.componentInstance;
    configure?.(host);
    fixture.detectChanges();
    const elements = (part: string) => fixture.debugElement.queryAll(By.css(`[rdxAccordion${part}]`));
    const triggers = () => elements('Trigger').map((element) => element.nativeElement as HTMLElement);
    const panels = () => elements('Panel').map((element) => element.nativeElement as HTMLElement);
    const root = fixture.debugElement
        .query(By.directive(RdxAccordionRootDirective))
        .injector.get(RdxAccordionRootDirective);
    const click = (index = 0) => {
        triggers()[index].click();
        fixture.detectChanges();
    };
    return { fixture, host, elements, triggers, panels, root, click };
}
