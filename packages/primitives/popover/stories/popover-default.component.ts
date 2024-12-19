import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MountainSnowIcon, TriangleAlert, X } from 'lucide-angular';
import { RdxPopoverModule, RdxPopoverRootDirective } from '../index';
import { RdxPopoverContentAttributesComponent } from '../src/popover-content-attributes.component';
import { containerAlert } from './utils/constants';
import { IgnoreClickOutsideContainerBase } from './utils/ignore-click-outside-container-base.class';
import styles from './utils/styles.constants';
import { WithEventBaseComponent } from './utils/with-event-base.component';

@Component({
    selector: 'rdx-popover-default',
    standalone: true,
    imports: [
        FormsModule,
        RdxPopoverModule,
        LucideAngularModule,
        RdxPopoverContentAttributesComponent,
        WithEventBaseComponent
    ],
    styles: styles(),
    template: `
        <popover-with-event-base>
            <div class="ContainerAlerts">
                <lucide-angular [img]="TriangleAlert" size="16" />
                {{ containerAlert }}
            </div>
            <div class="container">
                <ng-container rdxPopoverRoot>
                    <button class="reset IconButton" rdxPopoverTrigger>
                        <lucide-angular [img]="MountainSnowIcon" size="16" style="display: flex" />
                    </button>

                    <ng-template rdxPopoverContent>
                        <div class="PopoverContent" rdxPopoverContentAttributes>
                            <button class="reset PopoverClose" rdxPopoverClose aria-label="Close">
                                <lucide-angular [img]="XIcon" size="16" style="display: flex" />
                            </button>
                            <div style="display: flex; flex-direction: column; gap: 10px">
                                <p class="Text" style="margin-bottom: 10px">Dimensions</p>
                                <fieldset class="reset Fieldset">
                                    <label class="Label" for="width">Width</label>
                                    <input class="reset Input" id="width" value="100%" />
                                </fieldset>
                                <fieldset class="reset Fieldset">
                                    <label class="Label" for="maxWidth">Max. width</label>
                                    <input class="reset Input" id="maxWidth" value="300px" />
                                </fieldset>
                                <fieldset class="reset Fieldset">
                                    <label class="Label" for="height">Height</label>
                                    <input class="reset Input" id="height" value="25px" />
                                </fieldset>
                                <fieldset class="reset Fieldset">
                                    <label class="Label" for="maxHeight">Max. height</label>
                                    <input class="reset Input" id="maxHeight" value="none" />
                                </fieldset>
                            </div>
                            <div class="PopoverArrow" rdxPopoverArrow></div>
                        </div>
                    </ng-template>
                </ng-container>
            </div>
            <div class="PopoverId">ID: {{ popoverRootDirective()?.uniqueId() }}</div>
        </popover-with-event-base>
    `
})
export class RdxPopoverDefaultComponent extends IgnoreClickOutsideContainerBase {
    readonly popoverRootDirective = viewChild(RdxPopoverRootDirective);

    readonly MountainSnowIcon = MountainSnowIcon;
    readonly XIcon = X;
    protected readonly TriangleAlert = TriangleAlert;
    protected readonly containerAlert = containerAlert;
}
