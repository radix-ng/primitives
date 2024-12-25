import { Component } from '@angular/core';
import {
    RdxTabsContentDirective,
    RdxTabsListDirective,
    RdxTabsRootDirective,
    RdxTabsTriggerDirective
} from '@radix-ng/primitives/tabs';

@Component({
    selector: 'app-tabs',
    imports: [RdxTabsContentDirective, RdxTabsListDirective, RdxTabsRootDirective, RdxTabsTriggerDirective],
    template: `
        <div rdxTabsRoot defaultValue="one">
            <div rdxTabsList>
                <button rdxTabsTrigger value="one">Tab 1</button>
                <button rdxTabsTrigger value="two">Tab 2</button>
                <button rdxTabsTrigger value="three">Tab 3</button>
            </div>
            <div rdxTabsContent value="one">
                Dis metus rhoncus sit convallis sollicitudin vel cum, hac purus tincidunt eros sem himenaeos integer,
                faucibus varius nullam nostra bibendum consectetur mollis, gravida elementum pellentesque volutpat
                dictum ipsum.
            </div>
            <div rdxTabsContent value="two">You'll never find me!</div>
            <div rdxTabsContent value="three">
                Ut nisi elementum metus semper mauris dui fames accumsan aenean, maecenas ac sociis dolor quam tempus
                pretium.
            </div>
        </div>
    `
})
export default class TabsComponent {}
