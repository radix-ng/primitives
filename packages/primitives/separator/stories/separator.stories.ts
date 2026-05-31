import { CommonModule } from '@angular/common';
import { moduleMetadata } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxSeparatorRootDirective } from '../src/separator.directive';

const html = String.raw;

export default {
    component: RdxSeparatorRootDirective,
    title: 'Primitives/Separator',
    decorators: [
        moduleMetadata({
            imports: [RdxSeparatorRootDirective, CommonModule]
        }),
        tailwindDemoDecorator()
    ]
};

export const Default = {
    render: () => ({
        template: html`
            <div class="flex w-full max-w-sm flex-col gap-3">
                <div class="text-foreground text-sm font-medium">Radix Primitives</div>
                <div class="text-muted-foreground text-sm">An open-source UI component library.</div>
                <div class="bg-border h-px w-full" rdxSeparatorRoot></div>
                <div class="flex h-5 items-center">
                    <div class="text-foreground text-sm">Blog</div>
                    <div
                        class="bg-border mx-4 h-5 w-px"
                        rdxSeparatorRoot
                        decorative="decorative"
                        orientation="vertical"
                    ></div>
                    <div class="text-foreground text-sm">Docs</div>
                    <div
                        class="bg-border mx-4 h-5 w-px"
                        rdxSeparatorRoot
                        decorative="decorative"
                        orientation="vertical"
                    ></div>
                    <div class="text-foreground text-sm">Source</div>
                </div>
            </div>
        `
    })
};
