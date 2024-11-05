import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    selector: 'app-accordion',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div rdxAccordionRoot>
            <div [value]="'one'" rdxAccordionItem>
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>One</button>
                </h3>
                <div rdxAccordionContent>
                    Per erat orci nostra luctus sociosqu mus risus penatibus, duis elit vulputate viverra integer
                    ullamcorper congue curabitur sociis, nisi malesuada scelerisque quam suscipit habitant sed.
                </div>
            </div>

            <div [value]="'two'" rdxAccordionItem>
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>Two</button>
                </h3>
                <div rdxAccordionContent>
                    Cursus sed mattis commodo fermentum conubia ipsum pulvinar sagittis, diam eget bibendum porta
                    nascetur ac dictum, leo tellus dis integer platea ultrices mi.
                </div>
            </div>

            <div [value]="'three'" [disabled]="true" rdxAccordionItem>
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>Three</button>
                </h3>
                <div rdxAccordionContent>
                    Sociis hac sapien turpis conubia sagittis justo dui, inceptos penatibus feugiat himenaeos euismod
                    magna, nec tempor pulvinar eu etiam mattis.
                </div>
            </div>

            <div [value]="'four'" rdxAccordionItem>
                <h3 rdxAccordionHeader>
                    <button type="button" rdxAccordionTrigger>Four</button>
                </h3>
                <div rdxAccordionContent>
                    Odio placerat quisque sapien sagittis non sociis ligula penatibus dignissim vitae, enim vulputate
                    nullam semper potenti etiam volutpat libero.
                    <button>Cool</button>
                </div>
            </div>
        </div>
    `
})
export default class AccordionComponent {}
