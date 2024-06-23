import { Directive, inject, Input, OnInit } from '@angular/core';

import { TABS_CONTEXT_TOKEN, TabsContextService } from './tabs-context.service';

export interface TabsProps {
    /** The value for the selected tab, if controlled */
    value?: string;
    /** The value of the tab to select by default, if uncontrolled */
    defaultValue?: string;
    /** A function called when a new tab is selected */
    onValueChange?: (value: string) => void;
    /**
     * The orientation the tabs are layed out.
     * Mainly so arrow navigation is done accordingly (left & right vs. up & down)
     * @defaultValue horizontal
     */
    orientation?: string;
    /**
     * The direction of navigation between toolbar items.
     */
    dir?: string;
    /**
     * Whether a tab is activated automatically or manually.
     * @defaultValue automatic
     * */
    activationMode?: 'automatic' | 'manual';
}

@Directive({
    selector: '[TabsRoot]',
    standalone: true,
    providers: [{ provide: TABS_CONTEXT_TOKEN, useExisting: TabsContextService }]
})
export class RdxTabsRootDirective implements OnInit {
    private readonly tabsContext = inject(TABS_CONTEXT_TOKEN);

    @Input() orientation = 'horizontal';

    ngOnInit() {
        this.tabsContext.setOrientation(this.orientation);
    }
}
