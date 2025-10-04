import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionContentPresenceDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    selector: 'app-accordion',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective,
        RdxAccordionContentPresenceDirective
    ],
    template: `
        <div rdxAccordionRoot type="multiple">
            <div [value]="'one'" rdxAccordionItem>
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>One</button>
                </h3>
                <div rdxAccordionContent>
                    <ng-template rdxAccordionContentPresence>
                        Per erat orci nostra luctus sociosqu mus risus penatibus, duis elit vulputate viverra integer
                        ullamcorper congue curabitur sociis, nisi malesuada scelerisque quam suscipit habitant sed.
                    </ng-template>
                </div>
            </div>

            <div [value]="'two'" rdxAccordionItem>
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>Two</button>
                </h3>
                <div rdxAccordionContent>
                    <ng-template rdxAccordionContentPresence>
                        Cursus sed mattis commodo fermentum conubia ipsum pulvinar sagittis, diam eget bibendum porta
                        nascetur ac dictum, leo tellus dis integer platea ultrices mi.
                    </ng-template>
                </div>
            </div>

            <div [value]="'three'" [disabled]="true" rdxAccordionItem>
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>Three</button>
                </h3>
                <div rdxAccordionContent>
                    <ng-template rdxAccordionContentPresence>
                        Sociis hac sapien turpis conubia sagittis justo dui, inceptos penatibus feugiat himenaeos
                        euismod magna, nec tempor pulvinar eu etiam mattis.
                    </ng-template>
                </div>
            </div>

            <div [value]="'four'" rdxAccordionItem>
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>Four</button>
                </h3>
                <div rdxAccordionContent>
                    <ng-template rdxAccordionContentPresence>
                        Odio placerat quisque sapien sagittis non sociis ligula penatibus dignissim vitae, enim
                        vulputate nullam semper potenti etiam volutpat libero.
                        <button>Cool</button>
                    </ng-template>
                </div>
            </div>
        </div>
    `
})
export default class Page {}
