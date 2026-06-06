import { Component } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    selector: 'app-tabs',
    imports: [RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab],
    template: `
        <div rdxTabsRoot defaultValue="one">
            <div rdxTabsList>
                <button rdxTabsTab value="one">Tab 1</button>
                <button rdxTabsTab value="two">Tab 2</button>
                <button rdxTabsTab value="three">Tab 3</button>
            </div>
            <div rdxTabsPanel value="one">
                Dis metus rhoncus sit convallis sollicitudin vel cum, hac purus tincidunt eros sem himenaeos integer,
                faucibus varius nullam nostra bibendum consectetur mollis, gravida elementum pellentesque volutpat
                dictum ipsum.
            </div>
            <div rdxTabsPanel value="two">You'll never find me!</div>
            <div rdxTabsPanel value="three">
                Ut nisi elementum metus semper mauris dui fames accumsan aenean, maecenas ac sociis dolor quam tempus
                pretium.
            </div>
        </div>
    `
})
export default class Page {}
