import { Directive, effect, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { RdxTabsContextService, TABS_CONTEXT_TOKEN } from './tabs-context.service';

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
    selector: '[rdxTabsRoot]',
    standalone: true,
    providers: [{ provide: TABS_CONTEXT_TOKEN, useExisting: RdxTabsContextService }],
    host: {
        '[attr.data-orientation]': 'orientation',
        '[attr.dir]': 'dir'
    }
})
export class RdxTabsRootDirective implements OnInit {
    private readonly tabsContext = inject(TABS_CONTEXT_TOKEN);

    @Input() value?: string;
    @Input() defaultValue?: string;
    @Input() orientation = 'horizontal';
    @Input() dir?: string;

    // Event handler called when the value changes.
    @Output() onValueChange = new EventEmitter<string>();

    constructor() {
        effect(() => {
            const value = this.tabsContext.value$();
            if (value !== undefined) {
                this.onValueChange.emit(value);
            }
        });
    }

    ngOnInit() {
        this.tabsContext.setOrientation(this.orientation);

        if (this.dir) {
            this.tabsContext.setDir(this.dir);
        }

        if (this.value) {
            this.tabsContext.setValue(this.value);
        } else if (this.defaultValue) {
            this.tabsContext.setValue(this.defaultValue);
        }
    }
}
