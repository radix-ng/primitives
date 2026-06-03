import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxToggleGroupItemDirective } from '../src/toggle-group-item.directive';
import { RdxToggleGroupDirective } from '../src/toggle-group.directive';
import { ToggleGroup } from './toggle-group';

const html = String.raw;

export default {
    title: 'Primitives/Toggle Group',
    decorators: [
        moduleMetadata({
            imports: [RdxToggleGroupDirective, RdxToggleGroupItemDirective, LucideAngularModule, ToggleGroup]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div
                class="border-border bg-muted inline-flex rounded-md border shadow-sm"
                rdxToggleGroup
                value="center"
                aria-label="Text alignment"
            >
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    rdxToggleGroupItem
                    value="left"
                    aria-label="Left aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-left" size="12"></lucide-icon>
                </button>
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    rdxToggleGroupItem
                    value="center"
                    aria-label="Center aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-center" size="12"></lucide-icon>
                </button>
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    rdxToggleGroupItem
                    value="right"
                    aria-label="Right aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-right" size="12"></lucide-icon>
                </button>
            </div>
        `
    })
};

export const Multiple: Story = {
    render: () => ({
        props: {
            selectedValues: ['left', 'center']
        },
        template: html`
            <div
                class="border-border bg-muted inline-flex rounded-md border shadow-sm"
                rdxToggleGroup
                type="multiple"
                [value]="selectedValues"
                aria-label="Text alignment"
            >
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    rdxToggleGroupItem
                    value="left"
                    aria-label="Left aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-left" size="12"></lucide-icon>
                </button>
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    rdxToggleGroupItem
                    value="center"
                    aria-label="Center aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-center" size="12"></lucide-icon>
                </button>
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    rdxToggleGroupItem
                    value="right"
                    aria-label="Right aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-right" size="12"></lucide-icon>
                </button>
            </div>
        `
    })
};

export const Disable: Story = {
    render: () => ({
        props: {
            selectedValues: ['center']
        },
        template: html`
            <div
                class="border-border bg-muted inline-flex rounded-md border shadow-sm"
                rdxToggleGroup
                type="multiple"
                [value]="selectedValues"
                aria-label="Text alignment"
            >
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    disabled
                    rdxToggleGroupItem
                    value="left"
                    aria-label="Left aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-left" size="12"></lucide-icon>
                </button>
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    rdxToggleGroupItem
                    value="center"
                    aria-label="Center aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-center" size="12"></lucide-icon>
                </button>
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    disabled
                    rdxToggleGroupItem
                    value="right"
                    aria-label="Right aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-right" size="12"></lucide-icon>
                </button>
            </div>
        `
    })
};

export const DisableGroup: Story = {
    render: () => ({
        template: html`
            <div
                class="border-border bg-muted inline-flex rounded-md border shadow-sm"
                rdxToggleGroup
                aria-label="Text alignment"
                disabled
            >
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    rdxToggleGroupItem
                    value="left"
                    aria-label="Left aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-left" size="12"></lucide-icon>
                </button>
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    rdxToggleGroupItem
                    value="center"
                    aria-label="Center aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-center" size="12"></lucide-icon>
                </button>
                <button
                    class="bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-9 w-9 items-center justify-center border border-transparent transition-[color,box-shadow] outline-none first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                    rdxToggleGroupItem
                    value="right"
                    aria-label="Right aligned"
                    type="button"
                >
                    <lucide-icon class="flex" name="align-right" size="12"></lucide-icon>
                </button>
            </div>
        `
    })
};

export const Component: Story = {
    render: () => ({
        template: html`
            <toggle-group />
        `
    })
};
