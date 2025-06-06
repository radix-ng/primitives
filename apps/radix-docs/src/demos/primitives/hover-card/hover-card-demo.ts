import { Component } from '@angular/core';
import { RdxHoverCardModule } from '@radix-ng/primitives/hover-card';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'hover-card-demo',
    standalone: true,
    imports: [LucideAngularModule, RdxHoverCardModule],
    styleUrl: 'hover-card-demo.css',
    template: `
        <ng-container rdxHoverCardRoot>
            <a
                class="ImageTrigger"
                href="https://twitter.com/radix_ui"
                target="_blank"
                rel="noreferrer noopener"
                rdxHoverCardTrigger
            >
                <img
                    class="Image normal"
                    src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                    alt="Radix UI"
                />
            </a>

            <ng-template rdxHoverCardContent>
                <div class="HoverCardContent" rdxHoverCardContentAttributes>
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
                                Components, icons, colors, and templates for building high-quality, accessible UI. Free
                                and open-source.
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
                    <div class="HoverCardArrow" rdxHoverCardArrow></div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class HoverCardDemoComponent {
    protected readonly XIcon = X;
}

export default HoverCardDemoComponent;
