import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
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
        RdxAccordionPanelDirective
    ],
    template: `
        <div rdxAccordionRoot multiple>
            <div rdxAccordionItem [value]="'one'">
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>One</button>
                </h3>
                <div rdxAccordionPanel>
                    Per erat orci nostra luctus sociosqu mus risus penatibus, duis elit vulputate viverra integer
                    ullamcorper congue curabitur sociis, nisi malesuada scelerisque quam suscipit habitant sed.
                </div>
            </div>

            <div rdxAccordionItem [value]="'two'">
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>Two</button>
                </h3>
                <div rdxAccordionPanel>
                    Cursus sed mattis commodo fermentum conubia ipsum pulvinar sagittis, diam eget bibendum porta
                    nascetur ac dictum, leo tellus dis integer platea ultrices mi.
                </div>
            </div>

            <div rdxAccordionItem [value]="'three'" [disabled]="true">
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>Three</button>
                </h3>
                <div rdxAccordionPanel>
                    Sociis hac sapien turpis conubia sagittis justo dui, inceptos penatibus feugiat himenaeos euismod
                    magna, nec tempor pulvinar eu etiam mattis.
                </div>
            </div>

            <div rdxAccordionItem [value]="'four'">
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>Four</button>
                </h3>
                <div rdxAccordionPanel>
                    Odio placerat quisque sapien sagittis non sociis ligula penatibus dignissim vitae, enim vulputate
                    nullam semper potenti etiam volutpat libero.
                    <button>Cool</button>
                </div>
            </div>
        </div>
    `
})
export default class Page {}
