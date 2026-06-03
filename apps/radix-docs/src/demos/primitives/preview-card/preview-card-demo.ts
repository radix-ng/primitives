import { Component } from '@angular/core';
import { RdxPreviewCardModule } from '@radix-ng/primitives/preview-card';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'preview-card-demo',
    standalone: true,
    imports: [LucideAngularModule, RdxPreviewCardModule],
    styleUrl: 'preview-card-demo.css',
    template: `
        <ng-container rdxPreviewCardRoot>
            <a
                class="ImageTrigger"
                href="https://twitter.com/radix_ui"
                target="_blank"
                rel="noreferrer noopener"
                rdxPreviewCardTrigger
            >
                <img
                    class="Image normal"
                    src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                    alt="Radix UI"
                />
            </a>

            <ng-template rdxPreviewCardPortalPresence>
                <div rdxPreviewCardPortal>
                    <div sideOffset="8" rdxPreviewCardPositioner>
                        <div class="PreviewCardContent" rdxPreviewCardPopup>
                            <div style="display: flex; flex-direction: column; gap: 7px">
                                <img
                                    class="Image large"
                                    src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                                    alt="Radix UI"
                                />
                                <div style="display: flex; flex-direction: column; gap: 15px;">
                                    <div>
                                        <div class="Text bold">Radix</div>
                                        <div class="Text faded">{{ '@radix_ui' }}</div>
                                    </div>
                                    <div class="Text">
                                        Components, icons, colors, and templates for building high-quality, accessible
                                        UI. Free and open-source.
                                    </div>
                                    <div style="display: flex; gap: 15px">
                                        <div style="display: flex; gap: 5px">
                                            <div class="Text bold">0</div>
                                            &nbsp;
                                            <div class="Text faded">Following</div>
                                        </div>
                                        <div style="display: flex; gap: 5px">
                                            <div class="Text bold">2,900</div>
                                            &nbsp;
                                            <div class="Text faded">Followers</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="PreviewCardArrow" rdxPreviewCardArrow></div>
                        </div>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class PreviewCardDemoComponent {
    protected readonly XIcon = X;
}

export default PreviewCardDemoComponent;
