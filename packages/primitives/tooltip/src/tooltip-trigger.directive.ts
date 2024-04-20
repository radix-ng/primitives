/* eslint-disable @angular-eslint/no-input-rename */
import {
    Directive,
    HostListener,
    Input,
    OnInit,
    TemplateRef,
    booleanAttribute,
    inject,
    numberAttribute
} from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { OverlayTriggerDirective } from '@radix-ng/primitives/overlay';
import { injectTooltipConfig } from './tooltip.config';
import { TooltipTriggerToken } from './tooltip-trigger.token';

@Directive({
    selector: '[rdxTooltipTrigger]',
    standalone: true,
    host: {
        '[attr.aria-describedby]': 'tooltipId'
    },
    hostDirectives: [
        {
            directive: OverlayTriggerDirective,
            inputs: [
                'rdxOverlayTrigger: rdxTooltipTrigger',
                'rdxOverlayDisabled: rdxTooltipDisabled',
                'rdxOverlayPlacement: rdxTooltipPlacement',
                'rdxOverlayOffset: rdxTooltipOffset',
                'rdxOverlayShowDelay: rdxTooltipShowDelay',
                'rdxOverlayHideDelay: rdxTooltipHideDelay',
                'rdxOverlayShift: rdxTooltipShift',
                'rdxOverlayFlip: rdxTooltipFlip',
                'rdxOverlayContainer: rdxTooltipContainer'
            ]
        }
    ]
})
export class TooltipTriggerDirective implements OnInit {
    /**
     * Access the overlay trigger directive
     */
    private readonly overlayTrigger = inject(OverlayTriggerDirective);

    /**
     * Access the global tooltip configuration
     */
    private readonly tooltipConfig = injectTooltipConfig();

    /**
     * Define the tooltip to display when the trigger is activated.
     */
    @Input({ alias: 'rdxTooltipTrigger', required: true }) templateRef!: TemplateRef<void>;

    /**
     * Define if the trigger should be disabled.
     * @default false
     */
    @Input({ alias: 'rdxTooltipDisabled', transform: booleanAttribute }) disabled = false;

    /**
     * Define the placement of the tooltip relative to the trigger.
     * @default 'bottom'
     */
    @Input('rdxTooltipPlacement') placement: Placement = this.tooltipConfig.placement;

    /**
     * Define the offset of the tooltip relative to the trigger.
     * @default 0
     */
    @Input({ alias: 'rdxTooltipOffset', transform: numberAttribute }) offset: number =
        this.tooltipConfig.offset;

    /**
     * Define the delay before the tooltip is displayed.
     * @default 0
     */
    @Input({ alias: 'rdxTooltipShowDelay', transform: numberAttribute }) showDelay: number =
        this.tooltipConfig.showDelay;

    /**
     * Define the delay before the tooltip is hidden.
     * @default 0
     */
    @Input({ alias: 'rdxTooltipHideDelay', transform: numberAttribute }) hideDelay: number =
        this.tooltipConfig.hideDelay;

    /**
     * Define whether the tooltip should flip when there is not enough space for the tooltip.
     * @default true
     */
    @Input({ alias: 'rdxTooltipFlip', transform: booleanAttribute }) flip: boolean =
        this.tooltipConfig.flip;

    /**
     * Define the container in to which the tooltip should be attached.
     * @default document.body
     */
    @Input('rdxTooltipContainer') container: HTMLElement = this.tooltipConfig.container;

    /**
     * The tooltip id.
     */
    protected tooltipId?: string;

    ngOnInit(): void {
        this.overlayTrigger.registerProvider({
            provide: TooltipTriggerToken,
            useValue: this
        });
    }

    /**
     * Show the tooltip.
     */
    @HostListener('mouseenter')
    @HostListener('focus')
    show(): void {
        this.overlayTrigger.show();
    }

    /**
     * Hide the tooltip.
     */
    @HostListener('mouseleave')
    @HostListener('blur')
    @HostListener('window:keydown.escape')
    hide(): void {
        this.overlayTrigger.hide();
    }

    /**
     * Define the tooltip id.
     * @param id The tooltip id
     * @internal
     */
    setTooltipId(id: string) {
        this.tooltipId = id;
    }
}