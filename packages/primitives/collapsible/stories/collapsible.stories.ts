import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxCollapsibleContentPresenceDirective } from '../src/collapsible-content-presence.directive';
import { RdxCollapsibleContentDirective } from '../src/collapsible-content.directive';
import { RdxCollapsibleRootDirective } from '../src/collapsible-root.directive';
import { RdxCollapsibleTriggerDirective } from '../src/collapsible-trigger.directive';
import { RdxCollapsibleAnimationComponent } from './collapsible-animation.component';
import { RdxCollapsibleExternalTriggeringComponent } from './collapsible-external-triggering.component';

const html = String.raw;

export default {
    title: 'Primitives/Collapsible',
    decorators: [
        moduleMetadata({
            imports: [
                RdxCollapsibleRootDirective,
                RdxCollapsibleTriggerDirective,
                RdxCollapsibleContentDirective,
                RdxCollapsibleContentPresenceDirective,
                RdxCollapsibleExternalTriggeringComponent,
                RdxCollapsibleAnimationComponent,
                LucideAngularModule
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div class="w-full max-w-sm" rdxCollapsibleRoot [open]="true" #collapsibleRoot="rdxCollapsibleRoot">
                <div class="flex items-center justify-between gap-3">
                    <span class="text-foreground text-sm font-medium">&#64;peduarte starred 3 repositories</span>
                    <button
                        class="bg-muted text-primary hover:bg-muted/80 focus-visible:ring-ring border-border inline-flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors outline-none focus-visible:ring-2"
                        type="button"
                        rdxCollapsibleTrigger
                    >
                        @if (collapsibleRoot.open()) {
                        <lucide-angular class="flex" size="16" name="x"></lucide-angular>
                        } @else {
                        <lucide-angular class="flex" size="16" name="unfold-vertical"></lucide-angular>
                        }
                    </button>
                </div>

                <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
                    <span class="text-sm">&#64;radix-ui/primitives</span>
                </div>

                <div rdxCollapsibleContent>
                    <div *rdxCollapsibleContentPresence>
                        <div
                            class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm"
                        >
                            <span class="text-sm">&#64;radix-ui/colors</span>
                        </div>
                        <div
                            class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm"
                        >
                            <span class="text-sm">&#64;stitches/react</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    })
};

export const ExternalTrigger: Story = {
    render: () => ({
        template: html`
            <rdx-collapsible-external-triggering></rdx-collapsible-external-triggering>
        `
    })
};

export const Animation: Story = {
    render: () => ({
        template: html`
            <rdx-collapsible-animation></rdx-collapsible-animation>
        `
    })
};
