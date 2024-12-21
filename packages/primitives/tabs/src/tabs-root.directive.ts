import { Directive, InjectionToken, input, model, OnInit, output } from '@angular/core';

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

export type DataOrientation = 'vertical' | 'horizontal';

export const RDX_TABS_ROOT_TOKEN = new InjectionToken<RdxTabsRootDirective>('RdxTabsRootDirective');

@Directive({
    selector: '[rdxTabsRoot]',
    standalone: true,
    providers: [
        { provide: RDX_TABS_ROOT_TOKEN, useExisting: RdxTabsRootDirective }],
    host: {
        '[attr.data-orientation]': 'orientation()',
        '[attr.dir]': 'dir()'
    }
})
export class RdxTabsRootDirective implements OnInit {
    /**
     * The controlled value of the tab to activate. Should be used in conjunction with `onValueChange`.
     */
    readonly value = model<string>();

    readonly defaultValue = input<string>();

    /**
     * When automatic, tabs are activated when receiving focus. When manual, tabs are activated when clicked.
     */
    readonly activationMode = input<'automatic' | 'manual'>('automatic');

    /**
     * The orientation of the component.
     */
    readonly orientation = input<DataOrientation>('horizontal');

    readonly dir = input<string>('ltr');

    /**
     * Event handler called when the value changes.
     */
    readonly onValueChange = output<string>();

    ngOnInit() {
        if (this.defaultValue()) {
            this.value.set(this.defaultValue());
        }
    }

    select(value: string) {
        this.value.set(value);
        this.onValueChange.emit(value);
    }

    /** @ignore */
    getBaseId() {
        return `tabs-${Math.random().toString(36).substr(2, 9)}`;
    }
}
